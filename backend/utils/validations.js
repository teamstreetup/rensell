const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .refine((val) => val.toLowerCase().endsWith('@mitaoe.ac.in'), {
      message: 'Only college emails ending with @mitaoe.ac.in are allowed',
    }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  price: z.coerce.number().positive('Price must be positive'),
  originalPrice: z.coerce.number().min(0, 'Original price cannot be negative').default(0),
  type: z.enum(['rent', 'sale']),
  category: z.string().trim().min(1, 'Category is required'),
  description: z.string().trim().min(1, 'Description is required'),
  image: z
    .string()
    .min(1, 'Image is required')
    .refine(
      (val) =>
        val.startsWith('/') ||
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('data:image/'),
      { message: 'Invalid image URL or path' }
    ),
  rating: z.coerce.number().min(0).max(5).optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
});

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.coerce.number().int().positive('Quantity must be at least 1').default(1),
        price: z.coerce.number().min(0).optional(),
        name: z.string().optional(),
        image: z.string().optional(),
        type: z.enum(['rent', 'sale']).optional(),
        startDate: z.string().or(z.date()).optional(),
        endDate: z.string().or(z.date()).optional(),
        rentalDays: z.coerce.number().int().positive().optional(),
        securityDeposit: z.coerce.number().min(0).optional(),
      })
    )
    .min(1, 'At least one item required'),
  shippingAddress: z.object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    phone: z.string().trim().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    address: z.string().trim().min(1, 'Address is required'),
    city: z.string().trim().min(1, 'City is required'),
    state: z.string().trim().min(1, 'State is required'),
    pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  }),
  paymentMethod: z.enum(['razorpay', 'cod']),
  totalAmount: z.coerce.number().positive().optional(),
});

const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.coerce.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().max(500, 'Comment cannot exceed 500 characters').optional().default(''),
});

module.exports = {
  signupSchema,
  loginSchema,
  productSchema,
  orderSchema,
  reviewSchema,
};
