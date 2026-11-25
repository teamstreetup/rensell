const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');

async function getReviews(req, res, next) {
  try {
    const productId = req.query.productId || req.params.productId;

    if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) {
      return res.status(400).json({ error: 'Valid productId is required' });
    }

    const reviews = await Review.find({ productId })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ reviews });
  } catch (error) {
    next(error);
  }
}

async function createReview(req, res, next) {
  try {
    const { productId, rating, comment } = req.validatedBody;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Valid productId is required' });
    }

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Upsert review (one review per user per product)
    const review = await Review.findOneAndUpdate(
      { productId, userId: req.user.userId },
      { rating, comment },
      { new: true, upsert: true, runValidators: true }
    );

    const aggregationResult = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    const newAvgRating =
      aggregationResult.length > 0
        ? Math.round(aggregationResult[0].avgRating * 10) / 10
        : rating;

    await Product.findByIdAndUpdate(productId, { rating: newAvgRating });

    return res.status(201).json({
      message: 'Review published successfully!',
      review,
      newAvgRating,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already reviewed this item.' });
    }
    next(error);
  }
}

module.exports = { getReviews, createReview };
