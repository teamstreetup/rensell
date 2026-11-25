const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

async function createOrder(req, res, next) {
  try {
    const data = req.validatedBody;

    const productIds = data.items.map((item) => item.productId);
    const invalidProductId = productIds.find((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidProductId) {
      return res.status(400).json({ error: 'Invalid product ID in order items' });
    }

    const uniqueProductIds = [...new Set(productIds)];
    const products = await Product.find({ _id: { $in: uniqueProductIds } })
      .select('_id name image price originalPrice type category')
      .lean();

    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({ error: 'One or more products were not found' });
    }

    const productsById = new Map(products.map((product) => [String(product._id), product]));

    let computedTotal = 0;
    const normalizedItems = [];

    for (const item of data.items) {
      const product = productsById.get(item.productId);
      if (!product) {
        return res.status(400).json({ error: 'Product lookup failed during order creation' });
      }

      const unitPrice = Number(product.price);
      const quantity = Number(item.quantity || 1);

      if (product.type === 'rent') {
        let rentalDays = Number(item.rentalDays || 1);
        let parsedStart;
        let parsedEnd;

        if (item.startDate && item.endDate) {
          parsedStart = new Date(item.startDate);
          parsedEnd = new Date(item.endDate);
          if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
            return res.status(400).json({ error: `Invalid rental dates for ${product.name}` });
          }
          if (parsedEnd <= parsedStart) {
            return res.status(400).json({ error: `End date must be after start date for ${product.name}` });
          }
          const diffDays = Math.ceil((parsedEnd.getTime() - parsedStart.getTime()) / (1000 * 60 * 60 * 24));
          rentalDays = diffDays > 0 ? diffDays : 1;
        }

        // Calculate security deposit strictly on backend (20% of originalPrice)
        const securityDeposit = Math.round(Number(product.originalPrice || 0) * 0.2);
        const lineTotal = (unitPrice * rentalDays + securityDeposit) * quantity;
        computedTotal += lineTotal;

        normalizedItems.push({
          productId: product._id,
          quantity,
          price: unitPrice,
          name: product.name,
          image: product.image,
          category: product.category,
          type: product.type,
          startDate: parsedStart || item.startDate,
          endDate: parsedEnd || item.endDate,
          rentalDays,
          securityDeposit,
        });
      } else {
        const lineTotal = unitPrice * quantity;
        computedTotal += lineTotal;

        normalizedItems.push({
          productId: product._id,
          quantity,
          price: unitPrice,
          name: product.name,
          image: product.image,
          category: product.category,
          type: product.type,
        });
      }
    }

    const roundedComputedTotal = Math.round(computedTotal * 100) / 100;

    if (
      data.totalAmount !== undefined &&
      Math.abs(roundedComputedTotal - Number(data.totalAmount)) > 0.01
    ) {
      return res.status(400).json({
        error: 'Order total mismatch. Please refresh cart and try again.',
        expectedTotal: roundedComputedTotal,
      });
    }

    const order = await Order.create({
      userId: req.user.userId,
      items: normalizedItems,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      totalAmount: roundedComputedTotal,
    });

    return res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrders(req, res, next) {
  try {
    const { orderId } = req.query;

    if (orderId) {
      if (!mongoose.Types.ObjectId.isValid(String(orderId))) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      const order = await Order.findOne({ _id: orderId, userId: req.user.userId })
        .populate('items.productId')
        .lean();

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.json({ orders: [order] });
    }

    const orders = await Order.find({ userId: req.user.userId })
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ orders });
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const query = req.user.role === 'admin' ? { _id: id } : { _id: id, userId: req.user.userId };
    const order = await Order.findOne(query).populate('items.productId').lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({ order });
  } catch (error) {
    next(error);
  }
}

async function updateOrder(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const { paymentStatus, status } = req.body;

    const allowedPaymentStatuses = ['failed'];
    const allowedStatuses = ['cancelled'];

    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    if (!paymentStatus && !status) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    const order = await Order.findOne({ _id: id, userId: req.user.userId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus !== 'pending' || order.status === 'delivered') {
      return res.status(400).json({ error: 'Order can no longer be modified' });
    }

    const updateFields = {};
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (status) updateFields.status = status;

    const updatedOrder = await Order.findByIdAndUpdate(id, updateFields, { new: true });

    return res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
};
