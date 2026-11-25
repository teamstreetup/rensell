const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getStats,
  getAllOrders,
  updateOrderAdmin,
  getAllUsers,
  updateUserAdmin,
  deleteUserAdmin,
  deleteProductAdmin,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', getStats);

router.get('/orders', getAllOrders);
router.patch('/orders', updateOrderAdmin);
router.patch('/orders/:id', updateOrderAdmin);

router.get('/users', getAllUsers);
router.patch('/users', updateUserAdmin);
router.patch('/users/:id', updateUserAdmin);
router.delete('/users', deleteUserAdmin);
router.delete('/users/:id', deleteUserAdmin);

router.delete('/products/:id', deleteProductAdmin);

module.exports = router;
