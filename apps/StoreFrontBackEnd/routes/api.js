// routes/api.js
const router = require('express').Router();

router.use(require('./products.routes'));
router.use(require('./productBases.routes'));
router.use(require('./catalogs.routes'));
router.use(require('./productProfiles.routes'));
router.use(require('./productTemplates.routes'));
router.use(require('./pages.routes'));

module.exports = router;
