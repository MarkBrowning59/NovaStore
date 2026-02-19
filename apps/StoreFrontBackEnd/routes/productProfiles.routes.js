// routes/productProfiles.routes.js
const Router = require('express').Router;
const novaMongoDBRepository = require('../Repositories/NovaMongoDBRepository');

const router = Router();

/**
 * GET /api/productprofiles
 * Optional query:
 *  - page, pageSize
 *  - customerId
 *  - storeNumber
 */
router.get('/productprofiles', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

    const { customerId, storeNumber } = req.query;
    const query = {};

    if (customerId) query['Scope.CustomerID'] = customerId;
    if (storeNumber) query['Scope.StoreNumber'] = storeNumber;

    const cursor = db
      .collection('ProductProfiles')
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const profiles = await cursor.toArray();
    const total = await db.collection('ProductProfiles').countDocuments(query);

    res.status(200).json({ page, pageSize, total, profiles });
  } catch (err) {
    console.error('Error fetching product profiles:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/productprofiles/:id
 */
router.get('/productprofiles/:id', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const { id } = req.params;

    const profile = await db
      .collection('ProductProfiles')
      .findOne({ _id: id });

    if (!profile) {
      return res.status(404).json({ message: 'Product profile not found.' });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error('Error fetching product profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/productprofiles
 * Body should include at least: { _id, Name, Properties }
 */
router.post('/productprofiles', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const payload = req.body || {};
    const now = new Date();

    const newProfile = {
      _id: payload._id || payload.Key, // string key like "StandardApparelProfile"
      Name: payload.Name,
      Description: payload.Description || '',
      Scope: {
        CustomerID: payload.Scope?.CustomerID || null,
        StoreNumber: payload.Scope?.StoreNumber || null,
        Systems: payload.Scope?.Systems || [],
      },
      Properties: payload.Properties || {},
      CreatedAt: now,
      UpdatedAt: now,
      CreatedBy: payload.CreatedBy || 'system',
      UpdatedBy: payload.UpdatedBy || 'system',
    };

    if (!newProfile._id) {
      return res.status(400).json({ message: '_id (profile key) is required.' });
    }

    const result = await db.collection('ProductProfiles').insertOne(newProfile);

    res.status(201).json({
      message: 'Product profile created',
      profileId: result.insertedId,
      profile: newProfile,
    });
  } catch (err) {
    console.error('Error creating product profile:', err);

    if (err.code === 11000) {
      return res.status(409).json({ message: 'Profile with that _id already exists.' });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PATCH /api/productprofiles/:id
 * Partial update
 */
router.patch('/productprofiles/:id', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const { id } = req.params;
    const payload = req.body || {};

    const update = {
      $set: {
        ...(payload.Name !== undefined && { Name: payload.Name }),
        ...(payload.Description !== undefined && {
          Description: payload.Description,
        }),
        ...(payload.Scope !== undefined && {
          'Scope.CustomerID': payload.Scope.CustomerID || null,
          'Scope.StoreNumber': payload.Scope.StoreNumber || null,
          'Scope.Systems': payload.Scope.Systems || [],
        }),
        ...(payload.Properties !== undefined && {
          Properties: payload.Properties,
        }),
        UpdatedAt: new Date(),
        UpdatedBy: payload.UpdatedBy || 'system',
      },
    };

    const result = await db
      .collection('ProductProfiles')
      .updateOne({ _id: id }, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product profile not found.' });
    }

    res
      .status(200)
      .json({ message: 'Product profile updated', profileId: id });
  } catch (err) {
    console.error('Error updating product profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/productprofiles/:id
 */
router.delete('/productprofiles/:id', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const { id } = req.params;

    const result = await db
      .collection('ProductProfiles')
      .deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product profile not found.' });
    }

    res
      .status(200)
      .json({ message: 'Product profile deleted', profileId: id });
  } catch (err) {
    console.error('Error deleting product profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
