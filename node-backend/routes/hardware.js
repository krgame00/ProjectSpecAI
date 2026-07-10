const express = require('express');
const router = express.Router();
const hardwareController = require('../controllers/hardwareController');
const { validateRequired, validatePositiveNumber } = require('../middleware/validation');

router.get('/catalog', hardwareController.getCatalog);
router.get('/:id', hardwareController.getById);
router.post('/', validateRequired(['name', 'price', 'category']), validatePositiveNumber(['price']), hardwareController.create);
router.put('/:id', validateRequired(['name', 'price']), validatePositiveNumber(['price']), hardwareController.update);
router.delete('/:id', hardwareController.delete);

module.exports = router;
