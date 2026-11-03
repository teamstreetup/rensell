import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  originalPrice: number;
  type: 'rent' | 'sale';
  category: string;
  description: string;
  image: string;
  rating: number;
  discount: number;
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: 0,
    },
    type: {
      type: String,
      enum: ['rent', 'sale'],
      required: [true, 'Type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    ownerId: {
      type: String,
      required: false, // False initially for backwards compatibility with seeded products
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ category: 1, type: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
