# 🚀 RUN WEBSITE - 3 Simple Steps

## Step 1: Get MongoDB Connection String (5 minutes)

### Go to: https://cloud.mongodb.com

1. Sign up (free)
2. Create cluster (M0 Free)
3. Create user: `rensell` / `password123`
4. Whitelist IP: "Allow from anywhere"
5. Get connection string
6. Replace `<password>` with `password123`
7. Add `/rensell` before the `?`

**Example:**
```
mongodb+srv://rensell:password123@cluster0.xxxxx.mongodb.net/rensell?retryWrites=true&w=majority
```

---

## Step 2: Update Configuration

Open file: `a:\Self Education\Amazon Q\RENSELL\nextjs-app\.env.local`

Replace line 3 with your connection string:
```
MONGODB_URI=mongodb+srv://rensell:password123@cluster0.xxxxx.mongodb.net/rensell?retryWrites=true&w=majority
```

Save file.

---

## Step 3: Run Commands

Open Command Prompt in `nextjs-app` folder:

```bash
cd "a:\Self Education\Amazon Q\RENSELL\nextjs-app"

npm install

node scripts/seed.js

npm run dev
```

---

## ✅ Done!

Open browser: **http://localhost:3000**

You should see:
- ✅ RENSELL homepage
- ✅ 7 products with images
- ✅ Orange "ADD TO CART" buttons
- ✅ Sign In button

---

## 🧪 Test Sign In

1. Click "Sign In"
2. Click "Sign Up" link
3. Fill form:
   - Name: Test
   - Email: test@test.com
   - Password: test123
4. Click "Sign Up"
5. ✅ You're logged in!

---

## 🛒 Test Shopping

1. Click "ADD TO CART" on any product
2. Click cart icon (top right)
3. Click "Proceed to Checkout"
4. Fill address
5. Select "Cash on Delivery"
6. Click "Place Order"
7. ✅ Order placed!

---

## ❌ If Sign In Gives Error

Run this command:
```bash
node scripts/seed.js
```

Then try signing up again.

---

## 📖 More Help

Read these files:
- `SETUP_MONGODB.md` - Detailed MongoDB guide
- `START_HERE.md` - Complete setup
- `COMPLETE.md` - What was done

---

**That's it! Enjoy! 🎉**
