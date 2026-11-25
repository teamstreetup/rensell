const express = require('express');
const { getReviews, createReview } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { reviewSchema } = require('../utils/validations');

const router = express.Router();

router.get('/', getReviews);
router.get('/:productId', getReviews);
router.post('/', authMiddleware, validateBody(reviewSchema), createReview);

module.exports = router;
