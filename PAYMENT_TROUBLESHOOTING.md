# 🔧 Payment Troubleshooting Guide

## ⚠️ Common Payment Issues & Fixes

### Issue 1: "Payment does not work" - COD

**Symptoms:**
- Click "Place Order" with COD
- Nothing happens or error appears

**Solution:**

1. **Check if logged in:**
   - Must be signed in first
   - Click "Sign In" → Create account
   - Then try checkout again

2. **Check cart has items:**
   - Cart must have at least 1 product
   - Add products before checkout

3. **Fill all address fields:**
   - Full Name (required)
   - Phone (10 digits)
   - Address (required)
   - City (required)
   - State (required)
   - Pincode (6 digits)

4. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Look for error messages
   - Share errors for help

---

### Issue 2: "Payment does not work" - Razorpay

**Symptoms:**
- Razorpay modal doesn't open
- Payment button does nothing
- Error: "Razorpay is not defined"

**Solution:**

**Step 1: Verify Razorpay Keys**

Open `.env.local` and check:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

**All THREE must be set!**

**Step 2: Get Real Razorpay Keys**

1. Go to https://razorpay.com
2. Sign up (free)
3. Login to https://dashboard.razorpay.com
4. Click "Settings" → "API Keys"
5. Click "Generate Test Key"
6. Copy Key ID (starts with `rzp_test_`)
7. Copy Key Secret (click "Show")
8. Update `.env.local` with REAL keys

**Step 3: Restart Server**

After updating `.env.local`:
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

**Step 4: Test Payment**

1. Add product to cart
2. Go to checkout
3. Fill address
4. Select "Online Payment"
5. Click "Place Order"
6. Razorpay modal should open
7. Use test card: **4111 1111 1111 1111**
8. CVV: **123**
9. Expiry: **12/25**
10. Click "Pay"

---

### Issue 3: Order Created but Payment Fails

**Symptoms:**
- Order appears in database
- But payment not completed
- Stuck on checkout page

**Solution:**

This is normal! Order is created first, then payment.

**For COD:**
- Order created → Success page
- Payment status: "pending"
- Order status: "confirmed"

**For Razorpay:**
- Order created → Razorpay modal opens
- Complete payment → Verification
- Payment status: "paid"
- Order status: "confirmed"

---

### Issue 4: "Internal Server Error" on Checkout

**Possible Causes:**

**1. MongoDB not connected**
```bash
# Test connection
node scripts/test-setup.js
```

**2. Invalid token**
- Sign out and sign in again
- Clear localStorage: F12 → Application → Local Storage → Clear

**3. Missing environment variables**
```bash
# Check all variables set
node scripts/test-setup.js
```

**4. Database validation error**
- Check all form fields filled
- Phone: exactly 10 digits
- Pincode: exactly 6 digits

---

## ✅ Step-by-Step Payment Test

### Test 1: Cash on Delivery (No Razorpay needed)

1. **Sign In**
   - Go to http://localhost:3000
   - Click "Sign In"
   - Create account or login

2. **Add to Cart**
   - Click "ADD TO CART" on any product
   - See notification "Product added to cart!"
   - Cart count increases

3. **View Cart**
   - Click cart icon (top right)
   - See your items
   - Click "Proceed to Checkout"

4. **Fill Address**
   - Full Name: Test User
   - Phone: 9999999999
   - Address: 123 Test Street
   - City: Mumbai
   - State: Maharashtra
   - Pincode: 400001

5. **Select COD**
   - Select "Cash on Delivery" radio button

6. **Place Order**
   - Click "Place Order" button
   - Should redirect to success page
   - See order details

7. **Verify**
   - Go to http://localhost:3000/orders
   - See your order
   - Payment Status: "pending"
   - Order Status: "confirmed"

**✅ If this works, COD payment is working!**

---

### Test 2: Razorpay Payment (Requires API Keys)

**Prerequisites:**
- Razorpay account created
- Test API keys added to `.env.local`
- Server restarted

1. **Follow steps 1-4 from Test 1**

2. **Select Razorpay**
   - Select "Online Payment" radio button

3. **Place Order**
   - Click "Place Order" button
   - Razorpay modal should open

4. **Complete Payment**
   - Card Number: 4111 1111 1111 1111
   - CVV: 123
   - Expiry: 12/25
   - Name: Test User
   - Click "Pay"

5. **Verify**
   - Should redirect to success page
   - Payment Status: "paid"
   - Order Status: "confirmed"
   - Razorpay Payment ID visible

**✅ If this works, Razorpay payment is working!**

---

## 🐛 Debug Checklist

Before reporting payment not working:

- [ ] Signed in to website
- [ ] Products in cart
- [ ] All address fields filled correctly
- [ ] Phone is 10 digits (no spaces)
- [ ] Pincode is 6 digits
- [ ] MongoDB connected (run `node scripts/test-setup.js`)
- [ ] `.env.local` file exists
- [ ] MONGODB_URI is set
- [ ] JWT_SECRET is set
- [ ] For Razorpay: All 3 keys set
- [ ] Server restarted after changing `.env.local`
- [ ] Browser console checked for errors
- [ ] Network tab checked for failed requests

---

## 🔍 Check Browser Console

1. Press **F12** in browser
2. Go to **Console** tab
3. Try placing order
4. Look for errors (red text)

**Common Errors:**

**"Razorpay is not defined"**
- Razorpay script not loaded
- Check internet connection
- Refresh page

**"401 Unauthorized"**
- Not logged in
- Token expired
- Sign in again

**"400 Bad Request"**
- Form validation failed
- Check all fields filled
- Check phone/pincode format

**"500 Internal Server Error"**
- Database connection issue
- Check MongoDB URI
- Check server logs

---

## 📊 Check Server Logs

Look at terminal where `npm run dev` is running.

**Good logs:**
```
POST /api/orders 201 in 234ms
POST /api/payment/create-order 200 in 123ms
POST /api/payment/verify 200 in 89ms
```

**Bad logs:**
```
Error: MONGODB_URI not defined
Error: Invalid token
Error: Razorpay key not found
```

---

## 🎯 Quick Fixes

### Fix 1: Clear Cart and Try Again
```javascript
// In browser console (F12)
localStorage.removeItem('cart');
location.reload();
```

### Fix 2: Clear All Data
```javascript
// In browser console (F12)
localStorage.clear();
location.reload();
```

### Fix 3: Reset Database
```bash
node scripts/seed.js
```

### Fix 4: Restart Everything
```bash
# Stop server (Ctrl+C)
# Clear node cache
npm cache clean --force
# Reinstall
npm install
# Seed database
node scripts/seed.js
# Start server
npm run dev
```

---

## ✅ Working Configuration Example

**`.env.local` (with real keys):**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/rensell?retryWrites=true&w=majority
JWT_SECRET=my-super-secret-jwt-key-12345
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=my-nextauth-secret-key-12345
RAZORPAY_KEY_ID=rzp_test_AbCdEfGhIjKlMn
RAZORPAY_KEY_SECRET=OpQrStUvWxYz1234567890
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_AbCdEfGhIjKlMn
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📞 Still Not Working?

1. **Check this file:** `COMPLETE.md`
2. **Check setup:** `SETUP_MONGODB.md`
3. **Check Razorpay:** `RAZORPAY_INTEGRATION.md`

**Provide these details:**
- What payment method? (COD or Razorpay)
- What error message?
- Browser console errors?
- Server log errors?
- Screenshot of issue?

---

## 🎉 Success Indicators

**COD Working:**
- ✅ Order created in database
- ✅ Redirected to success page
- ✅ Order visible in /orders
- ✅ Payment status: "pending"

**Razorpay Working:**
- ✅ Razorpay modal opens
- ✅ Can enter test card
- ✅ Payment completes
- ✅ Redirected to success page
- ✅ Payment status: "paid"
- ✅ Razorpay IDs saved

**Both working = Payment system is working! 🎉**
