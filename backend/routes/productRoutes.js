const express = require('express');
const {
  getProducts,
  getMyProducts,
  getProductById,
  getManagedProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { productSchema } = require('../utils/validations');

const router = express.Router();

router.get('/', getProducts);
router.get('/me', authMiddleware, getMyProducts);
router.post('/', authMiddleware, validateBody(productSchema), createProduct);
router.get('/:id/manage', authMiddleware, getManagedProduct);
router.get('/:id', getProductById);
router.patch('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
