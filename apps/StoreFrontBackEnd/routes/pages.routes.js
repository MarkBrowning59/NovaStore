// routes/pages.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/pages.controller');

// GET /api/pages?slug=/some
router.get('/pages', ctrl.getPageBySlug);

// POST /api/pages
router.post('/pages', ctrl.createPage);

// PATCH /api/pages/:id
router.patch('/pages/:id', ctrl.updatePageById);

// POST /api/pages/:id/publish
router.post('/pages/:id/publish', ctrl.publishPageById);

module.exports = router;
