# 🚀 Quick Start Guide - Run RENSELL Website

## Step-by-Step Instructions

### Step 1: Open Terminal/Command Prompt
- Press `Windows + R`
- Type `cmd` and press Enter
- Navigate to project folder:
```bash
cd "a:\Self Education\Amazon Q\RENSELL\nextjs-app"
```

---

### Step 2: Install Dependencies
Run this command (only needed first time):
```bash
npm install
```

**Wait 2-3 minutes** for installation to complete.

---

### Step 3: Create Environment File
Create `.env.local` file in `nextjs-app` folder with this content:

```env
# MongoDB (Use this free test database for now)
MONGODB_URI=mongodb+srv://test:test123@cluster0.mongodb.net/rensell?retryWrites=true&w=majority

# JWT Secret (You can use this for testing)
JWT_SECRET=rensell-super-secret-jwt-key-2024-change-in-production

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=rensell-nextauth-secret-key-2024

# Razorpay (Get your keys from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** For Razorpay to work, you need to get real API keys from Razorpay (see Step 5).

---

### Step 4: Start Development Server
Run this command:
```bash
npm run dev
```

You should see:
```
✓ Ready in 3.2s
○ Local:   http://localhost:3000
```

---

### Step 5: Open Website in Browser
Open your browser and go to:
```
http://localhost:3000
```

🎉 **Your website is now running!**

---

## 🎯 What You Can Do Now

### Without Razorpay Setup:
✅ Browse products
✅ View product details
✅ Add items to cart
✅ Sign up / Login
✅ View cart
✅ Fill checkout form
❌ Complete payment (needs Razorpay keys)

### With Razorpay Setup:
✅ Everything above +
✅ Complete online payments
✅ Test with test cards
✅ View order history

---

## 🔑 Get Razorpay API Keys (Optional - For Payment Testing)

### Step 1: Create Razorpay Account
1. Go to https://razorpay.com
2. Click "Sign Up"
3. Fill details and verify email
4. Login to dashboard

### Step 2: Get Test API Keys
1. Go to https://dashboard.razorpay.com
2. Click **Settings** (left sidebar)
3. Click **API Keys**
4. Click **Generate Test Key**
5. Copy **Key ID** (starts with `rzp_test_`)
6. Click **Show** to see **Key Secret**
7. Copy both keys

### Step 3: Update .env.local
Replace these lines in `.env.local`:
```env
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
```

### Step 4: Restart Server
- Press `Ctrl + C` in terminal
- Run `npm run dev` again

---

## 💳 Test Payment (After Razorpay Setup)

1. Add products to cart
2. Go to checkout
3. Fill delivery address
4. Select "Online Payment"
5. Click "Place Order"
6. Use test card:
   - **Card Number:** 4111 1111 1111 1111
   - **CVV:** 123
   - **Expiry:** 12/25
   - **Name:** Test User
7. Click "Pay"
8. ✅ Payment successful!

---

## 🗄️ Database Setup (Optional - For Production)

The test MongoDB URI works for testing, but for production:

### Step 1: Create MongoDB Atlas Account
1. Go to https://cloud.mongodb.com
2. Sign up for free account
3. Create free cluster (M0)
4. Wait 3-5 minutes for cluster creation

### Step 2: Create Database User
1. Click **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Username: `rensell`
4. Password: Create strong password
5. Click **Add User**

### Step 3: Whitelist IP Address
1. Click **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for testing)
4. Click **Confirm**

### Step 4: Get Connection String
1. Click **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Click **Connect your application**
4. Copy connection string
5. Replace `<password>` with your password
6. Update `MONGODB_URI` in `.env.local`

### Step 5: Seed Database
Run this command to add products:
```bash
node scripts/seed.js
```

---

## 🛠️ Common Issues & Solutions

### Issue: "npm is not recognized"
**Solution:** Install Node.js from https://nodejs.org (download LTS version)

### Issue: "Port 3000 is already in use"
**Solution:** 
- Close other apps using port 3000
- Or use different port: `npm run dev -- -p 3001`

### Issue: "Cannot find module"
**Solution:** Run `npm install` again

### Issue: ".env.local not found"
**Solution:** Create the file manually in `nextjs-app` folder

### Issue: "MongoDB connection failed"
**Solution:** Check `MONGODB_URI` in `.env.local` is correct

### Issue: "Razorpay modal not opening"
**Solution:** Add real Razorpay API keys in `.env.local`

---

## 📁 Project Structure

```
nextjs-app/
├── app/                    # Pages and routes
│   ├── page.tsx           # Homepage
│   ├── cart/              # Cart page
│   ├── checkout/          # Checkout page
│   ├── orders/            # Order history
│   └── api/               # API endpoints
├── components/            # React components
├── lib/                   # Utilities
├── models/                # Database models
├── .env.local            # Environment variables (create this)
└── package.json          # Dependencies
```

---

## 🎓 Quick Commands Reference

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Stop server
Ctrl + C

# Build for production
npm run build

# Start production server
npm start

# Seed database with products
node scripts/seed.js
```

---

## 📞 Need Help?

1. **Check documentation:**
   - `RAZORPAY_INTEGRATION.md` - Payment setup
   - `RAZORPAY_TESTING.md` - Testing guide
   - `README.md` - Project overview

2. **Check browser console:**
   - Press `F12` in browser
   - Look for error messages

3. **Check terminal:**
   - Look for error messages in terminal where server is running

---

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created
- [ ] Server running (`npm run dev`)
- [ ] Website opens at http://localhost:3000
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can sign up/login
- [ ] (Optional) Razorpay keys added
- [ ] (Optional) Can complete test payment

---

## 🎉 You're All Set!

Your RENSELL e-commerce website is now running locally.

**Next Steps:**
1. Browse the website
2. Test all features
3. Add Razorpay keys for payment testing
4. Deploy to production (Vercel)

**Enjoy! 🚀**
