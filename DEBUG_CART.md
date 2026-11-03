# 🔧 Cart & Checkout Debug Guide

## Check Cart Structure

Open browser console (F12) and run:

```javascript
// Check cart contents
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
console.log('Cart items:', cart);

// Check each item structure
cart.forEach((item, index) => {
  console.log(`Item ${index}:`, {
    _id: item._id,
    name: item.name,
    price: item.price,
    image: item.image,
    type: item.type
  });
});

// Verify all required fields
const valid = cart.every(item => 
  item._id && 
  item.name && 
  typeof item.price === 'number' && 
  item.image
);
console.log('All items valid:', valid);
```

## Expected Cart Item Structure

Each item should have:
```javascript
{
  _id: "507f1f77bcf86cd799439011",  // MongoDB ObjectId string
  name: "Product Name",
  price: 1234,                       // Number (not string)
  image: "/photo/image.jpg",
  type: "sale" or "rent"
}
```

## Fix Cart Issues

### Issue: Cart items missing _id

**Fix in browser console:**
```javascript
localStorage.removeItem('cart');
location.reload();
```

Then add products to cart again.

### Issue: Price is string instead of number

**Fix in browser console:**
```javascript
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
const fixed = cart.map(item => ({
  ...item,
  price: typeof item.price === 'string' ? parseInt(item.price) : item.price
}));
localStorage.setItem('cart', JSON.stringify(fixed));
location.reload();
```

## Test Order Creation

In browser console:

```javascript
// Get token
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Present' : 'Missing');

// Get cart
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
console.log('Cart items:', cart.length);

// Test order data
const orderData = {
  items: cart.map(item => ({
    productId: item._id,
    quantity: 1,
    price: item.price,
    name: item.name,
    image: item.image,
  })),
  shippingAddress: {
    fullName: 'Test User',
    phone: '9999999999',
    address: '123 Test St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
  paymentMethod: 'cod',
  totalAmount: cart.reduce((sum, item) => sum + item.price, 0),
};

console.log('Order data:', orderData);

// Test API call
fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(orderData),
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

## Common Validation Errors

### "Phone must be 10 digits"
- Phone should be: `"9999999999"` (string, 10 digits, no spaces)
- NOT: `"999 999 9999"` or `9999999999` (number)

### "Pincode must be 6 digits"
- Pincode should be: `"400001"` (string, 6 digits)
- NOT: `"400 001"` or `400001` (number)

### "At least one item required"
- Cart is empty
- Add products to cart first

### "productId is required"
- Cart items missing `_id` field
- Clear cart and add products again

## Server Logs

Check terminal where `npm run dev` is running.

Look for:
```
Order request body: { ... }
Validation error: [ ... ]
Order created successfully: 507f...
```

## Quick Fixes

### Fix 1: Clear Everything
```javascript
// In browser console
localStorage.clear();
location.reload();
```

Then:
1. Sign in again
2. Add products to cart
3. Try checkout

### Fix 2: Reset Cart
```javascript
// In browser console
localStorage.removeItem('cart');
location.reload();
```

### Fix 3: Check Token
```javascript
// In browser console
const token = localStorage.getItem('token');
if (!token) {
  console.log('Not logged in - go to /auth/login');
} else {
  console.log('Token present');
}
```

## Successful Order Creation

You should see in server logs:
```
Order request body: {
  "items": [...],
  "shippingAddress": {...},
  "paymentMethod": "cod",
  "totalAmount": 1234
}
Order created successfully: 507f1f77bcf86cd799439011
POST /api/orders 201 in 234ms
```

And in browser:
- Redirect to success page
- Order ID displayed
- Order details shown

## Still Getting 400 Error?

1. Check server logs for validation errors
2. Run cart structure check (above)
3. Verify all form fields filled
4. Check phone is 10 digits (no spaces)
5. Check pincode is 6 digits
6. Make sure logged in (token present)
7. Clear cart and try again

## Test with cURL

```bash
# Replace TOKEN and adjust data
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [{
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 1,
      "price": 1234,
      "name": "Test Product",
      "image": "/photo/test.jpg"
    }],
    "shippingAddress": {
      "fullName": "Test User",
      "phone": "9999999999",
      "address": "123 Test St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "paymentMethod": "cod",
    "totalAmount": 1234
  }'
```

## Success!

When working, you'll see:
- ✅ No validation errors in logs
- ✅ Order created successfully message
- ✅ 201 status code
- ✅ Redirect to success page
- ✅ Order appears in /orders
