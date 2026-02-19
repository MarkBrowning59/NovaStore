const { ObjectId } = require('mongodb');
const Router = require('express').Router;
const novaMongoDBRepository = require('../Repositories/NovaMongoDBRepository');

const router = Router();

const COL = 'Pages';

const now = () => new Date();
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

function normalizePage(payload) {
  const slug = payload?.slug ?? payload?.Slug;
  const title = payload?.title ?? payload?.Title;
  const blocks = payload?.blocks ?? payload?.Blocks ?? [];
  const status = payload?.status ?? payload?.Status ?? 'draft';

  return {
    slug: isNonEmptyString(slug) ? slug.trim() : null,
    title: isNonEmptyString(title) ? title.trim() : null,
    blocks: Array.isArray(blocks) ? blocks : [],
    status: status === 'published' ? 'published' : 'draft',
  };
}

// GET page by slug (published by default)
// GET /api/pages?slug=/
// Optional: includeDraft=true
router.get('/pages', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const slug = req.query.slug;
    const includeDraft = req.query.includeDraft === 'true';

    if (!isNonEmptyString(slug)) {
      return res.status(400).json({ message: 'slug is required' });
    }

    const query = includeDraft ? { slug } : { slug, status: 'published' };

    const page = await db.collection(COL).findOne(query);
    if (!page) return res.status(404).json({ message: 'Page not found' });

    res.status(200).json(page);
  } catch (err) {
    console.error('Error fetching page:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create page (draft)
router.post('/pages', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const p = normalizePage(req.body);

    if (!p.slug || !p.title) {
      return res.status(400).json({ message: 'slug and title are required' });
    }

    const existing = await db.collection(COL).findOne({ slug: p.slug });
    if (existing) return res.status(409).json({ message: 'slug already exists' });

    const doc = {
      slug: p.slug,
      title: p.title,
      blocks: p.blocks,
      status: 'draft',
      createdAt: now(),
      updatedAt: now(),
    };

    const result = await db.collection(COL).insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    console.error('Error creating page:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH update page by id
router.patch('/pages/:id', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const title = req.body?.title;
    const blocks = req.body?.blocks;
    const status = req.body?.status;

    const $set = { updatedAt: now() };
    if (isNonEmptyString(title)) $set.title = title.trim();
    if (Array.isArray(blocks)) $set.blocks = blocks;
    if (status === 'draft' || status === 'published') $set.status = status;

    const result = await db.collection(COL).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ message: 'Page not found' });

    res.status(200).json(result.value);
  } catch (err) {
    console.error('Error updating page:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST publish page by id
router.post('/pages/:id/publish', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const result = await db.collection(COL).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: 'published', updatedAt: now() } },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ message: 'Page not found' });

    res.status(200).json(result.value);
  } catch (err) {
    console.error('Error publishing page:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
