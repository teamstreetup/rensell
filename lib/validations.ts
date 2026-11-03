import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string()
    .email('Invalid email address')
    .refine((val) => val.toLowerCase().endsWith('@mitaoe.ac.in'), {
      message: 'Only college emails ending with @mitaoe.ac.in are allowed',
    }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive('Original price must be positive'),
  type: z.enum(['rent', 'sale']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().url('Invalid image URL'),
  rating: z.number().min(0).max(5).optional(),
  discount: z.number().min(0).max(100).optional(),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    price: z.number().min(0),
    name: z.string().min(1),
    image: z.string().min(1),
    type: z.enum(['rent', 'sale']).optional(),
    startDate: z.string().or(z.date()).optional(),
    endDate: z.string().or(z.date()).optional(),
    rentalDays: z.number().positive().optional(),
    securityDeposit: z.number().min(0).optional(),
  })).min(1, 'At least one item required'),
  shippingAddress: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  }),
  paymentMethod: z.enum(['razorpay', 'cod']),
  totalAmount: z.number().positive(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
