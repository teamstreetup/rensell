const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  originalPrice: Number,
  type: String,
  category: String,
  description: String,
  image: String,
  rating: Number,
  discount: Number,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const products = [
  {
    name: "Apple iPhone 14 Pro Max (256GB)",
    price: 134900,
    originalPrice: 159900,
    type: "sale",
    category: "electronics",
    description: "Latest iPhone with A16 Bionic chip, 48MP camera, Dynamic Island",
    image: "/photo/I phone .jpg",
    rating: 4.9,
    discount: 16
  },
  {
    name: "Premium Wireless Earbuds Pro",
    price: 2499,
    originalPrice: 4999,
    type: "sale",
    category: "electronics",
    description: "Active noise cancellation, 30hrs battery, premium sound quality",
    image: "/photo/earbuds.webp",
    rating: 4.7,
    discount: 50
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    price: 26990,
    originalPrice: 33990,
    type: "sale",
    category: "electronics",
    description: "Industry-leading noise cancellation, 30hr battery, premium comfort",
    image: "/photo/head phone.webp",
    rating: 4.8,
    discount: 21
  },
  {
    name: "Executive Office Chair - Ergonomic",
    price: 299,
    originalPrice: 599,
    type: "rent",
    category: "furniture",
    description: "Comfortable ergonomic chair perfect for work from home setup",
    image: "/photo/chair .webp",
    rating: 4.6,
    discount: 50
  },
  {
    name: "Premium Study Table with Storage",
    price: 399,
    originalPrice: 799,
    type: "rent",
    category: "furniture",
    description: "Spacious study table with drawers, ideal for students & professionals",
    image: "/photo/table.webp",
    rating: 4.7,
    discount: 50
  },
  {
    name: "Luxury Leather Diary & Planner 2024",
    price: 599,
    originalPrice: 999,
    type: "sale",
    category: "stationery",
    description: "Premium leather diary with monthly planner, goal tracker & notes",
    image: "/photo/Diary.webp",
    rating: 4.8,
    discount: 40
  },
  {
    name: "Insulated Steel Water Bottle 1L",
    price: 449,
    originalPrice: 899,
    type: "sale",
    category: "lifestyle",
    description: "Keeps hot for 12hrs, cold for 24hrs, leak-proof, BPA-free",
    image: "/photo/warer bottle.webp",
    rating: 4.6,
    discount: 50
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    await Product.insertMany(products);
    console.log('Seeded products successfully');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
