const express = require('express');
const router = express.Router();
const hardwareController = require('../controllers/hardwareController');
const { validateRequired, validatePositiveNumber } = require('../middleware/validation');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { syncPrices } = require('../services/priceSyncService');

router.get('/catalog', hardwareController.getCatalog);

// Phase 4.3: Sync Latest Prices (admin only) — MUST come before /:id routes
router.post('/sync-prices', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { category, limit } = req.body || {};
    const safeLimit = Math.min(parseInt(limit) || 200, 500);
    const result = await syncPrices(category || null, safeLimit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', hardwareController.getById);
router.post('/', authMiddleware, adminMiddleware, validateRequired(['name', 'price', 'category']), validatePositiveNumber(['price']), hardwareController.create);
router.put('/:id', authMiddleware, adminMiddleware, validateRequired(['name', 'price']), validatePositiveNumber(['price']), hardwareController.update);
router.delete('/:id', authMiddleware, adminMiddleware, hardwareController.delete);

module.exports = router;
