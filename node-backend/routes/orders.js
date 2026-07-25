const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { validateRequired, validatePositiveNumber, validateEnum } = require('../middleware/validation');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, adminMiddleware, ordersController.getAll);
router.post('/', validateRequired(['assembly_type', 'total_price', 'build_items']), validateEnum('assembly_type', ['none', 'standard', 'premium']), validatePositiveNumber(['total_price']), ordersController.create);
router.get('/:id/status', ordersController.getStatus);
router.put('/:id/status', authMiddleware, adminMiddleware, ordersController.updateStatus);

module.exports = router;
