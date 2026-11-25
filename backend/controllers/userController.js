const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

async function getMyProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select('-password').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (error) {
    next(error);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const { name, bio, phone, profileImage } = req.body;

    const updateFields = {};
    if (typeof name === 'string' && name.trim()) updateFields.name = name.trim();
    if (bio !== undefined) updateFields.bio = String(bio).trim().slice(0, 300);
    if (phone !== undefined) updateFields.phone = String(phone).trim();
    if (profileImage !== undefined) updateFields.profileImage = String(profileImage);

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
}

async function getPublicProfile(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(id)
      .select('name bio profileImage isVerified createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const products = await Product.find({ ownerId: id }).sort({ createdAt: -1 }).lean();

    return res.json({ user, products });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
};
