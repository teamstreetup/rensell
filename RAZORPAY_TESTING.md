# Razorpay Testing Guide

## Test Payment Flow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Create Test Account
1. Go to http://localhost:3000/auth/signup
2. Create account with test email
3. Login with credentials

### 3. Add Products to Cart
1. Browse products on homepage
2. Click "ADD TO CART" on any product
3. View cart at http://localhost:3000/cart

### 4. Proceed to Checkout
1. Click "Proceed to Checkout"
2. Fill delivery address:
   - Full Name: Test User
   - Phone: 9999999999
   - Address: Test Address
   - City: Mumbai
   - State: Maharashtra
   - Pincode: 400001

### 5. Test Razorpay Payment

#### Option A: Test Card Payment
1. Select "Online Payment" option
2. Click "Place Order"
3. Razorpay modal opens
4. Select "Card" payment method
5. Enter test card details:
   - **Card Number:** 4111 1111 1111 1111
   - **CVV:** 123
   - **Expiry:** 12/25
   - **Name:** Test User
6. Click "Pay"
7. Payment succeeds
8. Redirected to success page

#### Option B: Test UPI Payment
1. Select "Online Payment" option
2. Click "Place Order"
3. Razorpay modal opens
4. Select "UPI" payment method
5. Enter UPI ID: **success@razorpay**
6. Click "Pay"
7. Payment succeeds

#### Option C: Test Netbanking
1. Select "Online Payment" option
2. Click "Place Order"
3. Razorpay modal opens
4. Select "Netbanking"
5. Choose any bank
6. Use test credentials on bank page
7. Complete payment

#### Option D: Cash on Delivery
1. Select "Cash on Delivery" option
2. Click "Place Order"
3. Order placed immediately
4. Redirected to success page

---

## Test Cards Reference

### Success Cards
| Card Number | Type | Result |
|------------|------|--------|
| 4111 1111 1111 1111 | Visa | Success |
| 5555 5555 5555 4444 | Mastercard | Success |
| 3782 822463 10005 | Amex | Success |
| 6011 1111 1111 1117 | Discover | Success |

### Failure Cards
| Card Number | Type | Result |
|------------|------|--------|
| 4000 0000 0000 0002 | Visa | Declined |
| 4000 0000 0000 0069 | Visa | Expired |
| 4000 0000 0000 0127 | Visa | Incorrect CVV |

### Test UPI IDs
- **Success:** success@razorpay
- **Failure:** failure@razorpay

---

## Verify Payment in Database

### Using MongoDB Compass:
1. Connect to your MongoDB
2. Navigate to `rensell` database
3. Open `orders` collection
4. Find your order
5. Check fields:
   - `paymentStatus`: should be "paid"
   - `razorpayOrderId`: should have value
   - `razorpayPaymentId`: should have value
   - `razorpaySignature`: should have value
   - `status`: should be "confirmed"

### Using MongoDB Shell:
```javascript
use rensell
db.orders.find().sort({createdAt: -1}).limit(1).pretty()
```

---

## Verify Payment in Razorpay Dashboard

1. Login to https://dashboard.razorpay.com
2. Go to **Transactions** → **Payments**
3. Find your test payment
4. Check status: "Captured"
5. View payment details

---

## Test Scenarios

### ✅ Scenario 1: Successful Payment
1. Add products to cart
2. Checkout with valid details
3. Pay with test card: 4111 1111 1111 1111
4. Verify order created in database
5. Check payment status = "paid"
6. Verify order status = "confirmed"

### ❌ Scenario 2: Failed Payment
1. Add products to cart
2. Checkout with valid details
3. Pay with failure card: 4000 0000 0000 0002
4. Payment fails
5. Order remains in "pending" status
6. User can retry payment

### 💵 Scenario 3: Cash on Delivery
1. Add products to cart
2. Checkout with valid details
3. Select COD option
4. Order placed immediately
5. Payment status = "pending"
6. Order status = "confirmed"

### 🔄 Scenario 4: Multiple Orders
1. Place order 1 with Razorpay
2. Place order 2 with COD
3. View orders page
4. Both orders should appear
5. Verify different payment methods

---

## API Testing with Postman/cURL

### 1. Create Razorpay Order
```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 1000,
    "receipt": "order_test_123"
  }'
```

### 2. Verify Payment
```bash
curl -X POST http://localhost:3000/api/payment/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "razorpayOrderId": "order_xxx",
    "razorpayPaymentId": "pay_xxx",
    "razorpaySignature": "signature_xxx",
    "orderId": "mongodb_order_id"
  }'
```

### 3. Get Orders
```bash
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Common Test Issues

### Issue: Razorpay modal not opening
**Check:**
- Browser console for errors
- Razorpay script loaded (Network tab)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` in .env.local

### Issue: Payment verification fails
**Check:**
- `RAZORPAY_KEY_SECRET` matches dashboard
- Signature verification logic
- Server logs for errors

### Issue: Order not created
**Check:**
- MongoDB connection
- JWT token valid
- Request body validation
- Server logs

---

## Test Checklist

- [ ] User signup/login works
- [ ] Add products to cart
- [ ] Cart displays correctly
- [ ] Checkout form validation
- [ ] Razorpay modal opens
- [ ] Card payment succeeds
- [ ] UPI payment succeeds
- [ ] Netbanking payment succeeds
- [ ] COD order placement
- [ ] Payment verification works
- [ ] Order saved in database
- [ ] Success page displays
- [ ] Order history shows orders
- [ ] Payment status correct
- [ ] Order status correct

---

## Production Testing

Before going live:

1. **Small Amount Test:**
   - Use live keys
   - Place order with ₹1
   - Complete real payment
   - Verify in dashboard
   - Check bank settlement

2. **Refund Test:**
   - Place test order
   - Process refund from dashboard
   - Verify refund received

3. **Webhook Test:**
   - Set up webhook URL
   - Place order
   - Verify webhook received
   - Check webhook logs

---

## Support

If you encounter issues:
1. Check browser console
2. Check server logs
3. Verify environment variables
4. Test with different payment methods
5. Contact Razorpay support: support@razorpay.com

---

**Happy Testing! 🎉**
