const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, getMyProfile);
router.patch('/me', authMiddleware, updateMyProfile);
router.get('/:id', getPublicProfile);

module.exports = router;
