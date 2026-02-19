// controllers/productBases.controller.js
const productBasesService = require('../services/productBases.service');

// GET /api/productBases
exports.getProductBases = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 25;
    const q = req.query.q || '';

    const result = await productBasesService.getProductBases({ page, pageSize, q });
    res.status(200).json(result);
  } catch (err) {
    console.error('getProductBases error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// GET /api/productBases/:id
exports.getProductBaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const base = await productBasesService.getProductBaseById(id);

    if (!base) {
      return res.status(404).json({ message: 'BaseProduct not found.' });
    }

    res.status(200).json(base);
  } catch (err) {
    console.error('getProductBaseById error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// POST /api/productBases
exports.createProductBase = async (req, res) => {
  try {
    const created = await productBasesService.createProductBase(req.body);
    res.status(201).json({
      message: 'BaseProduct created',
      baseProduct: created,
    });
  } catch (err) {
    console.error('createProductBase error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error.',
    });
  }
};

// PATCH /api/productBases/:id
exports.updateProductBase = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await productBasesService.updateProductBase(id, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'BaseProduct not found.' });
    }

    res.status(200).json({
      message: 'BaseProduct updated',
      baseProduct: updated,
    });
  } catch (err) {
    console.error('updateProductBase error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error.',
    });
  }
};



// POST /api/productBases/:id/clone
exports.cloneProductBase = async (req, res) => {
  try {
    const { id } = req.params;

    const cloned = await productBasesService.cloneProductBase(id, req.body || {});
    if (!cloned) {
      return res.status(404).json({ message: 'BaseProduct not found.' });
    }

    res.status(201).json({
      message: 'BaseProduct cloned',
      baseProduct: cloned,
    });
  } catch (err) {
    console.error('cloneProductBase error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error.',
    });
  }
};

// DELETE /api/productBases/:id
exports.deleteProductBase = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await productBasesService.deleteProductBase(id);

    if (!deleted) {
      return res.status(404).json({ message: 'BaseProduct not found.' });
    }

    res.status(200).json({ message: 'BaseProduct deleted', baseProductId: id });
  } catch (err) {
    console.error('deleteProductBase error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
