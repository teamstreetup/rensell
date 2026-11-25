const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { orderSchema } = require('../utils/validations');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getOrders);
router.post('/', validateBody(orderSchema), createOrder);
router.get('/:id', getOrderById);
router.patch('/:id', updateOrder);

module.exports = router;
