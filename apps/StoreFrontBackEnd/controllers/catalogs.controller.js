// controllers/catalogs.controller.js

const novaMongoDBRepository = require('../Repositories/NovaMongoDBRepository');
const productService = require('../services/products.service');

/**
 * Utility: get the native Mongo DB instance
 */
function getDb() {
  const db = novaMongoDBRepository.getMongoRepository();
  if (!db) {
    throw new Error('NovaMongoDBRepository not initialized. Call init_NovaMongoDBRepository() first.');
  }
  return db;
}

const { ObjectId } = require('mongodb');

function buildIdQuery(id) {
  // If it looks like a Mongo ObjectId, search as ObjectId
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return { _id: new ObjectId(id) };
  }
  // Otherwise treat as string id (XMPie4008)
  return { _id: id };
}


// ... your other exports (getCatalogs, getCatalogById, etc.) ...

async function searchCatalogPaths(req, res) {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const db = getDb();
    const collection = db.collection('productcatalogs'); // matches your other uses

    const regex = new RegExp(q, 'i'); // case-insensitive name match

    const matches = await collection
      .find({ name: regex })
      .limit(25)
      .toArray();

    // Build full path back to root for each result
    const buildPath = async (cat) => {
      const path = [];
      let current = cat;
      const seen = new Set();

      while (current && !seen.has(current._id)) {
        seen.add(current._id);
        path.unshift({
          id: current._id,
          name: current.name || 'Untitled',
        });

        if (!current.parentId) break;

        current = await collection.findOne({ _id: current.parentId });
      }

      return path;
    };

    const results = [];
    for (const cat of matches) {
      const path = await buildPath(cat);
      results.push({
        id: cat._id,
        name: cat.name,
        parentId: cat.parentId || null,
        path, // [ { id, name }, ... ] from root → this catalog
      });
    }

    res.json(results);
  } catch (err) {
    console.error('Error in searchCatalogPaths:', err);
    res
      .status(500)
      .json({ message: 'Server error searching catalog paths.' });
  }
}

/**
 * GET /api/catalogs
 * Query params:
 *   - page (default 1)
 *   - pageSize (default 10)
 *   - parentId (optional)
 *
 * Behavior:
 *   - If parentId is NOT provided -> return "root" catalogs
 *     where parentId is null, missing, or empty string.
 *   - If parentId IS provided -> return catalogs with that parentId.
 */
async function getCatalogs(req, res) {
  try {
    const db = getDb();
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

let parentIdParam = req.query.parentId;

if (typeof parentIdParam === 'string') parentIdParam = parentIdParam.trim();

    let query;

if (!parentIdParam) {
  query = {
    $or: [
      { parentId: null },
      { parentId: { $exists: false } },
      { parentId: '' },
    ],
  };
} else {
  query = { parentId: parentIdParam };
}

    console.log('[getCatalogs] query:', query);

    const catalogs = await db
      .collection('productcatalogs') // NOTE: lowercase, matches your shell usage
      .find(query)
      .sort({ DisplayOrder: 1, name: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    console.log('[getCatalogs] result count:', catalogs.length);

    res.status(200).json(catalogs);
  } catch (err) {
    console.error('Error in getCatalogs:', err);
    res.status(500).json({ message: 'Server error fetching catalogs.' });
  }
}

/**
 * POST /api/catalogs
 * Body: catalog fields
 *
 * Expected shape (based on your sample):
 *   {
 *     _id?: string,          // e.g. "XMPie1723" (optional; Mongo will create one if omitted)
 *     name: string,
 *     description?: string,
 *     DisplayOrder?: number,
 *     StatusID?: number,
 *     ProductGroupType?: number,
 *     ImageName?: string,
 *     children?: string[],
 *     products?: [{ _id: string, DisplayOrder?: number }],
 *     parentId?: string | null
 *   }
 */
async function createCatalog(req, res) {
  try {
    const db = getDb();

    const {
      _id,
      name,
      description = '',
      DisplayOrder = 0,
      StatusID = 1,
      ProductGroupType = 1,
      ImageName = '',
      children = [],
      products = [],
      parentId = null,
      ...rest
    } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: 'name is required to create a catalog.' });
    }

    const now = new Date();

    const newCatalog = {
      ...(typeof _id !== 'undefined' ? { _id } : {}),
      name,
      description,
      DisplayOrder,
      StatusID,
      ProductGroupType,
      ImageName,
      children,
      products,
      parentId,
      ...rest,
      CreatedOn: now,
      UpdatedOn: now,
    };

    const result = await db.collection('productcatalogs').insertOne(newCatalog);

    res.status(201).json({
      message: 'Catalog created',
      catalogId: result.insertedId,
      catalog: newCatalog,
    });
  } catch (err) {
    console.error('Error in createCatalog:', err);
    res.status(500).json({ message: 'Server error creating catalog.' });
  }
}

/**
 * PATCH /api/catalogs
 * Body: { _id, ...fieldsToUpdate }
 *
 * We treat _id as a string (e.g. "XMPie1723"), not ObjectId.
 */
async function updateCatalog(req, res) {
  try {
    const db = getDb();

    const { _id, ...updates } = req.body || {};
    if (!_id) {
      return res.status(400).json({ message: '_id is required to update a catalog.' });
    }

    // Never allow _id to be changed
    delete updates._id;
    updates.UpdatedOn = new Date();

    const result = await db
      .collection('productcatalogs')
      .updateOne({ _id }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Catalog not found.' });
    }

    res.status(200).json({
      message: 'Catalog updated',
      catalogId: _id,
    });
  } catch (err) {
    console.error('Error in updateCatalog:', err);
    res.status(500).json({ message: 'Server error updating catalog.' });
  }
}

/**
 * PATCH /api/catalogs/:id
 * Body: fieldsToUpdate (no _id required)
 */
async function updateCatalogById(req, res) {
  try {
    const db = getDb();
    const { id } = req.params;

    const updates = { ...(req.body || {}) };
    delete updates._id;
    updates.UpdatedOn = new Date();

    const result = await db
      .collection('productcatalogs')
      .updateOne(buildIdQuery(id), { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Catalog not found.' });
    }

    res.status(200).json({ message: 'Catalog updated', catalogId: id });
  } catch (err) {
    console.error('Error in updateCatalogById:', err);
    res.status(500).json({ message: 'Server error updating catalog.' });
  }
}


/**
 * GET /api/catalogs/:id
 * Get a single catalog by _id (string).
 */
async function getCatalogById(req, res) {
  try {
    const db = getDb();
    const { id } = req.params;

    const catalog = await db
      .collection('productcatalogs')
      .findOne(buildIdQuery(id));

    if (!catalog) return res.status(404).json({ message: 'Catalog not found.' });

    res.json(catalog);
  } catch (err) {
    console.error('Error in getCatalogById:', err);
    res.status(500).json({ message: 'Server error getting catalog.' });
  }
}


/**
 * GET /api/catalogs/:id/products
 *
 * For a catalog document like:
 *   {
 *     _id: 'XMPie1723',
 *     ...,
 *     products: [
 *       { _id: 'XMPie19484', DisplayOrder: 2 }
 *     ]
 *   }
 *
 * This will return the matching product documents from the "products" collection.
 */
async function getCatalogProducts(req, res) {
  try {
    const db = getDb();
    const { id } = req.params;

    const catalog = await db
      .collection('productcatalogs')
      .findOne({ _id: id });

    if (!catalog) {
      return res.status(404).json({ message: 'Catalog not found.' });
    }

    const productList = Array.isArray(catalog.products) ? catalog.products : [];

    if (!productList.length) {
      return res.status(200).json([]);
    }

    // products[]._id holds the product ID string (e.g. "XMPie19484")
    const productIds = productList
      .map((p) => p && p._id)
      .filter(Boolean);

    if (!productIds.length) {
      return res.status(200).json([]);
    }

    // Fetch minimal fields needed to materialize ProductDefinition
    const rawProducts = await db
      .collection('products')
      .find(
        { _id: { $in: productIds } },
        {
          projection: {
            _id: 1,
            DisplayOrder: 1,
            BaseProductID: 1,
            Overrides: 1,
            Extensions: 1,
            ProductDefinition: 1 // legacy fallback
          },
        }
      )
      .toArray();

    if (!rawProducts || rawProducts.length === 0) {
      return res.status(200).json([]);
    }

    // Materialize so inherited ProductDefinition is returned even when it lives only in ProductBase.Defaults
    const materialized = await Promise.all(
      rawProducts.map((p) =>
        productService._materializeProductDoc(p, {
          includeBase: false,
          keepInheritanceFields: false,
        })
      )
    );

    // Keep the original response shape your UI expects
const projected = materialized.map((p) => ({
  _id: p._id,
  ProductDefinition: p.ProductDefinition,
      BaseProductID: p.BaseProductID ?? null,
      DisplayOrder: p.DisplayOrder,
}));

// Respect the catalog's stored order (catalog.products[].DisplayOrder) when available
const orderMap = new Map(
  productList.map((x) => [x && x._id, x && x.DisplayOrder != null ? x.DisplayOrder : 0])
);

projected.sort((a, b) => {
  const oa = orderMap.get(a._id) ?? 0;
  const ob = orderMap.get(b._id) ?? 0;
  if (oa !== ob) return oa - ob;

  // Tie-breakers: product DisplayOrder then id
  const da = a.DisplayOrder ?? 0;
  const db2 = b.DisplayOrder ?? 0;
  if (da !== db2) return da - db2;

  return String(a._id).localeCompare(String(b._id));
});

return res.status(200).json(projected);
  } catch (err) {
    console.error('Error in getCatalogProducts:', err);
    return res.status(500).json({ message: 'Server error fetching catalog products.' });
  }
}


async function addCatalogProduct(req, res) {
  try {
    const db = getDb();
    const { id } = req.params; // catalog id (string)
    const { productId } = req.body || {};

    if (!productId) {
      return res.status(400).json({ message: 'productId is required.' });
    }

    const catalog = await db
      .collection('productcatalogs')
      .findOne({ _id: id });

    if (!catalog) {
      return res.status(404).json({ message: 'Catalog not found.' });
    }

    const products = Array.isArray(catalog.products) ? catalog.products : [];

    // prevent duplicates
    if (products.some(p => p && p._id === productId)) {
      return res.status(200).json({ message: 'Product already in catalog.' });
    }

    const maxOrder = products.reduce(
      (max, p) => Math.max(max, p?.DisplayOrder ?? 0),
      0
    );

    const entry = {
      _id: productId,
      DisplayOrder: maxOrder + 1
    };

    await db.collection('productcatalogs').updateOne(
      { _id: id },
      { $push: { products: entry } }
    );

    res.status(201).json({
      message: 'Product added to catalog.',
      product: entry
    });
  } catch (err) {
    console.error('Error adding product to catalog:', err);
    res.status(500).json({ message: 'Server error adding product to catalog.' });
  }
}

/**
 * Explicit exports, so the router always gets real functions.
 */
module.exports = {
  getCatalogs,
  createCatalog,
  updateCatalog,         // legacy: PATCH /api/catalogs (body contains _id)
  updateCatalogById,     // new: PATCH /api/catalogs/:id
  getCatalogById,
  getCatalogProducts,
  searchCatalogPaths,
  addCatalogProduct
};
