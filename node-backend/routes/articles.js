const express = require('express');
const articleController = require('../controllers/articleController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { validateRequired } = require('../middleware/validation');

const router = express.Router();
router.get('/', articleController.getAll);
router.post('/', authMiddleware, adminMiddleware, validateRequired(['title']), articleController.create);
router.put('/:id', authMiddleware, adminMiddleware, validateRequired(['title']), articleController.update);
router.delete('/:id', authMiddleware, adminMiddleware, articleController.delete);

module.exports = router;
