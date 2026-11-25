const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const { productSchema } = require('../utils/validations');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getProducts(req, res, next) {
  try {
    const { category, type, search, ownerId, sort, page, limit } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = { $regex: `^${escapeRegex(String(category))}$`, $options: 'i' };
    }

    if (type && type !== 'all') {
      query.type = String(type).toLowerCase();
    }

    if (ownerId) {
      query.ownerId = String(ownerId);
    }

    if (search && String(search).trim()) {
      const pattern = new RegExp(escapeRegex(String(search).trim()), 'i');
      query.$or = [{ name: pattern }, { description: pattern }, { category: pattern }];
    }

    let sortSpec = { createdAt: -1 };
    if (sort === 'price_asc') sortSpec = { price: 1 };
    else if (sort === 'price_desc') sortSpec = { price: -1 };
    else if (sort === 'rating') sortSpec = { rating: -1 };

    const total = await Product.countDocuments(query);

    let mongoQuery = Product.find(query).sort(sortSpec);

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = parseInt(limit, 10) || 0;

    if (limitNum > 0) {
      mongoQuery = mongoQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const products = await mongoQuery.lean();

    return res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum || total,
        totalPages: limitNum > 0 ? Math.max(Math.ceil(total / limitNum), 1) : 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getMyProducts(req, res, next) {
  try {
    const products = await Product.find({ ownerId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ products });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productData = { ...product };

    if (productData.ownerId && mongoose.Types.ObjectId.isValid(productData.ownerId)) {
      const owner = await User.findById(productData.ownerId)
        .select('name profileImage isVerified')
        .lean();
      if (owner) {
        productData.owner = owner;
      }
    }

    return res.json({ product: productData });
  } catch (error) {
    next(error);
  }
}

async function getManagedProduct(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const isOwner = String(product.ownerId) === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json({ product });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const data = req.validatedBody;
    const effectiveOriginalPrice =
      data.originalPrice && data.originalPrice > 0 ? data.originalPrice : data.price;

    const computedDiscount =
      data.discount !== undefined
        ? data.discount
        : effectiveOriginalPrice > data.price
          ? Math.min(
              100,
              Math.max(
                0,
                Math.round(((effectiveOriginalPrice - data.price) / effectiveOriginalPrice) * 100)
              )
            )
          : 0;

    const product = await Product.create({
      ...data,
      originalPrice: effectiveOriginalPrice,
      discount: computedDiscount,
      ownerId: req.user.userId,
    });

    return res.status(201).json({
      message: 'Product created',
      product,
    });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const validation = productSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.errors[0]?.message || 'Validation failed',
        details: validation.error.errors,
      });
    }

    if (Object.keys(validation.data).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const isOwner = String(product.ownerId) === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: validation.data },
      { new: true, runValidators: true }
    );

    return res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const isOwner = String(product.ownerId) === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Product.findByIdAndDelete(id);

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getMyProducts,
  getProductById,
  getManagedProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
