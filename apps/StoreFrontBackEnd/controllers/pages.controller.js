// controllers/pages.controller.js
const Page = require('../models/Page');

exports.getPageBySlug = async (req, res, next) => {
  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ message: 'slug query param is required.' });

    const page = await Page.findOne({ slug });
    if (!page) return res.status(404).json({ message: 'Page not found.' });
    res.json(page);
  } catch (err) {
    next(err);
  }
};

exports.createPage = async (req, res, next) => {
  try {
    const { slug, title, blocks, status } = req.body || {};
    if (!slug) return res.status(400).json({ message: 'slug is required.' });

    const created = await Page.create({
      slug,
      title: title || '',
      blocks: Array.isArray(blocks) ? blocks : [],
      status: status === 'published' ? 'published' : 'draft',
      publishedAt: status === 'published' ? new Date() : null,
    });

    res.status(201).json(created);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'A page with that slug already exists.' });
    }
    next(err);
  }
};

exports.updatePageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patch = req.body || {};

    const update = {};
    if (typeof patch.slug === 'string') update.slug = patch.slug;
    if (typeof patch.title === 'string') update.title = patch.title;
    if (Array.isArray(patch.blocks)) update.blocks = patch.blocks;
    if (typeof patch.status === 'string' && ['draft', 'published'].includes(patch.status)) {
      update.status = patch.status;
      update.publishedAt = patch.status === 'published' ? new Date() : null;
    }

    const updated = await Page.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Page not found.' });

    res.json(updated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'A page with that slug already exists.' });
    }
    next(err);
  }
};

exports.publishPageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Page.findByIdAndUpdate(
      id,
      { $set: { status: 'published', publishedAt: new Date() } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Page not found.' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
