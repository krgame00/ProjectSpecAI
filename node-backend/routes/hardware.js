const express = require('express');
const router = express.Router();
const hardwareController = require('../controllers/hardwareController');
const { validateRequired, validatePositiveNumber } = require('../middleware/validation');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/catalog', hardwareController.getCatalog);
router.get('/:id', hardwareController.getById);
router.post('/', authMiddleware, adminMiddleware, validateRequired(['name', 'price', 'category']), validatePositiveNumber(['price']), hardwareController.create);
router.put('/:id', authMiddleware, adminMiddleware, validateRequired(['name', 'price']), validatePositiveNumber(['price']), hardwareController.update);
router.delete('/:id', authMiddleware, adminMiddleware, hardwareController.delete);

module.exports = router;
