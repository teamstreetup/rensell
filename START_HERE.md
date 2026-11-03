# 🚀 START HERE - Complete Setup Guide

## ✅ Step 1: Install Dependencies (2-3 minutes)

Open Command Prompt in `nextjs-app` folder:

```bash
cd "a:\Self Education\Amazon Q\RENSELL\nextjs-app"
npm install
```

Wait for installation to complete.

---

## ✅ Step 2: Verify Environment File

Check if `.env.local` file exists in `nextjs-app` folder.

**File location:** `a:\Self Education\Amazon Q\RENSELL\nextjs-app\.env.local`

**It should contain:**
```env
MONGODB_URI=mongodb+srv://test:test123@cluster0.mongodb.net/rensell?retryWrites=true&w=majority
JWT_SECRET=rensell-super-secret-jwt-key-2024-change-in-production
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=rensell-nextauth-secret-key-2024
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ Step 3: Test Configuration

```bash
node scripts/test-setup.js
```

This will verify:
- Environment variables are set
- MongoDB connection works
- Database has products

**Expected output:**
```
✓ MongoDB connected successfully
✓ Products in database: 7
✓ All tests passed!
```

---

## ✅ Step 4: Seed Database (if needed)

If test shows 0 products, run:

```bash
node scripts/seed.js
```

**Expected output:**
```
Connected to MongoDB
Cleared existing products
Seeded 7 products successfully
```

---

## ✅ Step 5: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
✓ Ready in 3.2s
○ Local:   http://localhost:3000
```

---

## ✅ Step 6: Open Website

Open browser and go to:
```
http://localhost:3000
```

You should see:
- ✅ RENSELL homepage with hero section
- ✅ 7 products displayed
- ✅ Navigation menu (Home, Rent, Buy, Electronics, Furniture)
- ✅ Search bar
- ✅ Cart icon
- ✅ Sign In button

---

## 🔧 Troubleshooting Sign-In Error

### Issue: "Internal Server Error" when signing in

**Solution 1: Check MongoDB Connection**
```bash
node scripts/test-setup.js
```

If this fails, MongoDB URI is wrong. Update `.env.local` with correct URI.

**Solution 2: Create Test User**

1. Go to http://localhost:3000/auth/signup
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
3. Click "Sign Up"
4. If successful, you'll be logged in automatically

**Solution 3: Check Browser Console**

1. Press F12 in browser
2. Go to "Console" tab
3. Look for error messages
4. Check "Network" tab for failed requests

**Solution 4: Check Server Logs**

Look at terminal where `npm run dev` is running.
Check for error messages.

---

## 🎯 Test All Features

### 1. Browse Products
- ✅ Homepage shows all 7 products
- ✅ Click on product to view details
- ✅ Products have correct images
- ✅ Prices in Indian Rupees
- ✅ Discount badges visible

### 2. Sign Up / Sign In
- ✅ Click "Sign In" button
- ✅ Fill email and password
- ✅ Click "Sign In"
- ✅ Should see "Welcome back!" message
- ✅ Button changes to show username

### 3. Add to Cart
- ✅ Click "ADD TO CART" on any product
- ✅ See notification "Product added to cart!"
- ✅ Cart count increases
- ✅ Click cart icon to view items

### 4. Checkout (Without Razorpay)
- ✅ Add products to cart
- ✅ Click "Proceed to Checkout"
- ✅ Fill delivery address
- ✅ Select "Cash on Delivery"
- ✅ Click "Place Order"
- ✅ Order created successfully

### 5. Checkout (With Razorpay)
**Requires Razorpay API keys**

1. Get keys from https://dashboard.razorpay.com
2. Update `.env.local` with real keys
3. Restart server: `Ctrl+C` then `npm run dev`
4. Add products to cart
5. Go to checkout
6. Select "Online Payment"
7. Use test card: 4111 1111 1111 1111
8. Complete payment

---

## 📊 Product List

All 7 products from original website:

1. **Apple iPhone 14 Pro Max** - ₹134,900 (Sale)
2. **Premium Wireless Earbuds** - ₹2,499 (Sale)
3. **Sony WH-1000XM5 Headphones** - ₹26,990 (Sale)
4. **Executive Office Chair** - ₹299/day (Rent)
5. **Premium Study Table** - ₹399/day (Rent)
6. **Luxury Leather Diary** - ₹599 (Sale)
7. **Insulated Water Bottle** - ₹449 (Sale)

---

## 🎨 Design Features

Matching original HTML website:

- ✅ Orange/Yellow "ADD TO CART" buttons
- ✅ Flipkart-style pricing (strikethrough original price)
- ✅ Green discount badges
- ✅ Product ratings with stars
- ✅ Rent/Sale badges
- ✅ Hero section with gradient
- ✅ Font Awesome icons
- ✅ Responsive design
- ✅ Hover effects on cards

---

## 🔑 Quick Commands

```bash
# Install dependencies
npm install

# Test setup
node scripts/test-setup.js

# Seed database
node scripts/seed.js

# Start server
npm run dev

# Stop server
Ctrl + C

# Build for production
npm run build

# Start production
npm start
```

---

## 📞 Common Issues

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

### MongoDB connection failed
- Check internet connection
- Verify MONGODB_URI in `.env.local`
- Try test connection: `node scripts/test-setup.js`

### Images not showing
- Check `public/photo` folder has 7 images
- Verify image paths in database
- Run seed script again: `node scripts/seed.js`

### Sign-in not working
- Check MongoDB connection
- Try creating new account first
- Check browser console for errors
- Check server logs in terminal

---

## ✅ Success Checklist

- [ ] Dependencies installed
- [ ] `.env.local` file exists
- [ ] Test script passes
- [ ] Database has 7 products
- [ ] Server starts without errors
- [ ] Website opens at localhost:3000
- [ ] All 7 products visible
- [ ] Can sign up new account
- [ ] Can sign in
- [ ] Can add to cart
- [ ] Can view cart
- [ ] Can checkout with COD

---

## 🎉 You're Ready!

Your RENSELL e-commerce website is now running with:
- ✅ Original HTML design
- ✅ All 7 products
- ✅ Full authentication
- ✅ Cart functionality
- ✅ Checkout system
- ✅ Razorpay integration (with keys)
- ✅ Order management

**Enjoy! 🚀**
