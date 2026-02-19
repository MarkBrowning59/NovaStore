// controllers/products.controller.js
const productService = require('../services/products.service');

// controllers/products.controller.js
const novaMongoDBRepository = require('../Repositories/NovaMongoDBRepository');

const { getInventoryForBcNo } = require('../services/bcInventory.service');

const COLLECTION = 'Products';

exports.getProductsByIds = async (req, res) => {
  try {
    let { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json([]);
    }

    // Normalize ids (e.g. "XMPie13347", "13347", etc.)
    ids = ids
      .map((id) => (id != null ? String(id).trim() : ''))
      .filter(Boolean);

    if (!ids.length) {
      return res.json([]);
    }

    const db = novaMongoDBRepository.getMongoRepository();

    // De-duplicate for query efficiency
    const uniqueIds = [...new Set(ids)];

    // Some may be "XMPie13347" — also derive numeric forms like "13347"
    const numericIds = uniqueIds
      .map((id) => id.replace(/^XMPie/i, '').trim())
      .filter((id) => id.length > 0);

    const collectionPrimary = db.collection(COLLECTION);
    const collectionSecondary =
      COLLECTION.toLowerCase() !== COLLECTION
        ? db.collection(COLLECTION.toLowerCase())
        : null;

    const orConditions = [
      { _id: { $in: uniqueIds } },
      { 'IDs.ID': { $in: uniqueIds } },
    ];

    if (numericIds.length) {
      orConditions.push({ 'IDs.ID': { $in: numericIds } });
    }

    const query = { $or: orConditions };

    let docs = await collectionPrimary.find(query).toArray();
    if ((!docs || docs.length === 0) && collectionSecondary) {
      docs = await collectionSecondary.find(query).toArray();
    }

    if (!docs || docs.length === 0) {
      return res.json([]);
    }

    // Build a lookup map from all ids in the document to the doc
    const docByKey = new Map();

    for (const p of docs) {
      const candidates = [];

      if (p._id != null) {
        candidates.push(String(p._id).trim());
      }

      if (Array.isArray(p.IDs)) {
        for (const idObj of p.IDs) {
          if (!idObj || idObj.ID == null) continue;
          candidates.push(String(idObj.ID).trim());
        }
      }

      const uniqueKeys = [...new Set(candidates)];
      for (const key of uniqueKeys) {
        if (!docByKey.has(key)) {
          docByKey.set(key, p);
        }
      }
    }

    // Helper to resolve BC no from a product document
    const resolveBcNo = (product) => {
      if (!product || !Array.isArray(product.IDs)) return null;
      const bcEntry = product.IDs.find((x) => {
        if (!x || x.System == null) return false;
        const sys = String(x.System).trim().toUpperCase();
        return sys === 'BC' || sys === 'BCITEM' || sys === 'BUSINESSCENTRAL';
      });
      return bcEntry && bcEntry.ID != null ? String(bcEntry.ID).trim() : null;
    };

    // To avoid hammering BC for the same product multiple times,
    // compute inventory once per unique product we actually return.
    const productCache = new Map(); // key: product _id → enriched product

    const results = [];

    for (const requestedId of ids) {
      const key = String(requestedId).trim();

      // Try exact match, then "XMPie" → numeric fallback
      let productDoc =
        docByKey.get(key) ||
        docByKey.get(key.replace(/^XMPie/i, '').trim()) ||
        null;

      if (!productDoc) {
        continue; // no matching product for this id
      }

      const cacheKey = String(productDoc._id).trim();

      if (!productCache.has(cacheKey)) {
        const bcNo = resolveBcNo(productDoc);
        let inventory = null;

        if (bcNo) {
          try {
            inventory = await getInventoryForBcNo(bcNo);
          } catch (err) {
            console.error(
              'Error fetching BC inventory for',
              cacheKey,
              bcNo,
              err.message
            );
            inventory = null;
          }
        }

        productCache.set(cacheKey, {
          ...productDoc,
          bcNo,
          inventory,
        });
      }

      results.push(productCache.get(cacheKey));
    }

    return res.json(results);
  } catch (err) {
    console.error('getProductsByIds error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// exports.getProductsByIds = async (req, res) => {
//   try {
//     let { ids } = req.body;

//     if (!Array.isArray(ids) || ids.length === 0) {
//       return res.json([]);
//     }

//     // Normalize ids ← they might be things like "XMPie13347" or "13347"
//     ids = ids
//       .map((id) => (id != null ? String(id).trim() : ''))
//       .filter(Boolean);

//     // ✅ getMongoRepository already gives you the Db instance
//     const db = novaMongoDBRepository.getMongoRepository();
//     const collection = db.collection('products'); // default Mongoose collection name

//     // Your product doc looks like:
//     // {
//     //   _id: "XMPie13347",
//     //   IDs: [
//     //     { System: "XMPie", ID: "13347" },
//     //     { System: "BC", ID: "WCHD-2058" },
//     //     { System: "StoreFront", ID: "XMPie13347" }
//     //   ],
//     //   ...
//     // }

//     // Our frontend is currently passing catalog.products[]. _id,
//     // which are StoreFront ids like "XMPie13347" / "XMPie19484".
//     // Those match BOTH:
//     //   - _id
//     //   - IDs[ { System: "StoreFront", ID: "XMPie13347" } ]
//     //
//     // To be robust, we can match either _id OR any IDs.ID in the array.

//     const products = await collection
//       .find({
//         $or: [
//           { _id: { $in: ids } },
//           { 'IDs.ID': { $in: ids } },
//         ],
//       })
//       .toArray();

//     return res.json(products);
//   } catch (err) {
//     console.error('Error fetching products by ids:', err);
//     return res
//       .status(500)
//       .json({ message: 'Server error fetching products by ids.' });
//   }
// };





// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const system = req.query.system || 'XMPie';

    const products = await productService.getProducts({ page, pageSize, system });
    res.status(200).json(products);
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error('getProductById error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// GET /api/products/by-system?system=XMPie&id=13346
exports.getProductBySystemId = async (req, res) => {
  try {
    const { system, id } = req.query;

    if (!system || !id) {
      return res
        .status(400)
        .json({ message: 'system and id query params required.' });
    }

    const product = await productService.getBySystemId(system, id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error('getProductBySystemId error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



// POST /api/products/:id/clone
exports.cloneProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // productService.cloneProduct will create a NEW product with a new _id
    const cloned = await productService.cloneProduct(id, req.body || {});
    if (!cloned) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(201).json({
      message: 'Product cloned',
      product: cloned,
    });
  } catch (err) {
    console.error('cloneProduct error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error.',
    });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const created = await productService.createProduct(req.body);
    res.status(201).json({
      message: 'Product created',
      product: created,
    });
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PATCH /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await productService.updateProduct(id, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({
      message: 'Product updated',
      product: updated,
    });
  } catch (err) {
    console.error('updateProduct error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await productService.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product deleted', productId: id });
  } catch (err) {
    console.error('deleteProduct error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};




exports.getProductInventory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[getProductInventory] called for product id:', id);

    let product = null;

    // 1️⃣ Try via productService first
    try {
      product = await productService.getProductById(id);
      console.log('[getProductInventory] productService.getProductById result:', !!product);
    } catch (e) {
      console.warn('[getProductInventory] productService.getProductById failed:', e.message);
    }

    // 2️⃣ Fallback: direct Mongo lookup if needed
    if (!product) {
      const db = novaMongoDBRepository.getMongoRepository();
      product =
        (await db.collection(COLLECTION).findOne({ _id: id })) ||
        (await db.collection('products').findOne({ _id: id }));
      console.log('[getProductInventory] direct Mongo lookup result:', !!product);
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    console.log('[getProductInventory] product IDs field:', product.IDs || product.ids);

    // 3️⃣ Try to locate the BC ID in various shapes
    const idsArray = Array.isArray(product.IDs)
      ? product.IDs
      : Array.isArray(product.ids)
      ? product.ids
      : null;

    let bcEntry = null;

    if (idsArray) {
      bcEntry = idsArray.find((x) => {
        if (!x || x.System == null) return false;
        const sys = String(x.System).trim().toUpperCase();
        return sys === 'BC' || sys === 'BCITEM' || sys === 'BUSINESSCENTRAL';
      });
    }

    const bcNo =
      bcEntry && bcEntry.ID != null ? String(bcEntry.ID).trim() : null;

    if (!bcNo) {
      console.log('[getProductInventory] No BC entry found. idsArray =', idsArray);
      return res.json({
        productId: id,
        bcNo: null,
        inventory: null,
        message: 'No BC ID on product.',
      });
    }

    console.log('[getProductInventory] BC no resolved to:', bcNo);

    // 4️⃣ Call BC to get inventory for that item "no"
    const inventory = await getInventoryForBcNo(bcNo);

    return res.status(200).json({
      productId: id,
      bcNo,
      inventory,
    });
  } catch (err) {
    console.error('Error getting product inventory from BC:', err);
    res
      .status(500)
      .json({ message: 'Error fetching inventory from Business Central.' });
  }
};


// GET /api/products/:id/withProfiles
exports.getProductWithProfiles = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productService.getProductWithProfiles(id);

    if (!result) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('getProductWithProfiles error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
