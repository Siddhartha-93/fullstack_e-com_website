# UPI Payment Method Implementation Guide

## Overview
Your KPA Market application now supports **Razorpay UPI Intent Flow** payment method. Users can pay via UPI with a seamless experience.

## Files Modified

### Backend
1. **`backend/src/controllers/orderController.js`**
   - Added `createUPIIntentPayment()` - Creates UPI payment intent
   - Added `checkUPIPaymentStatus()` - Polls and verifies payment status

2. **`backend/src/routes/orderRoutes.js`**
   - Added `POST /:id/payment/upi` route
   - Added `GET /:id/payment/upi/status` route

### Frontend
1. **`front-end/src/api/orderApi.js`**
   - Added `createUPIPayment()` function
   - Added `checkUPIPaymentStatus()` function

2. **`front-end/src/utils/razorpay.js`**
   - Added `openUPIIntentPayment()` - Opens UPI payment
   - Added `showUPIPaymentModal()` - Displays payment link/QR code modal

3. **`front-end/src/pages/CheckoutPage.jsx`**
   - Updated imports to include UPI payment functions
   - Modified `handlePlaceOrder()` to support UPI Intent Flow
   - Added automatic payment status polling (every 3 seconds)
   - Added manual "Check Payment Status" button in modal

## How UPI Payment Works

### Flow Diagram
```
1. User selects "UPI" payment method
   ↓
2. Fills checkout form and clicks "Place order"
   ↓
3. Order is created in database
   ↓
4. Cart is cleared immediately
   ↓
5. UPI Payment Intent is created
   ↓
6. Modal shows payment link & QR code
   ↓
7. User scans QR or clicks link → opens UPI app
   ↓
8. System polls payment status every 3 seconds
   ↓
9. When payment is received:
   - Order marked as "paid"
   - Status changes to "processing"
   - User redirected to success page
   ↓
10. If payment fails or times out:
    - Order marked as "failed"
    - User redirected to failure page
```

## API Endpoints

### Create UPI Payment Intent
```
POST /api/orders/:orderId/payment/upi
Authorization: Bearer {token}
Body: {
  vpa?: "user@upi" // Optional: pre-fill UPI ID
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "pay_xxxxx",
    "order_id": "order_xxxxx",
    "amount": 50000,
    "currency": "INR",
    "status": "created",
    "short_url": "https://rzp.io/i/xxxxx",
    "vpa": "user@upi"
  },
  "razorpayKeyId": "rzp_test_xxxxx"
}
```

### Check UPI Payment Status
```
GET /api/orders/:orderId/payment/upi/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "paymentStatus": "captured|failed|created",
  "isPaid": true|false,
  "order": { /* full order object */ }
}
```

## Features

✅ **Non-Blocking Payment**
- Users can close modal and come back later
- Manual "Check Payment Status" button available

✅ **Automatic Polling**
- Checks payment status every 3 seconds
- Maximum 5-minute polling window

✅ **Payment Link & QR Code**
- Short URL provided for mobile users
- QR code can be generated from short URL

✅ **Cart Protection**
- Cart cleared immediately after order creation
- Prevents duplicate items regardless of payment outcome

✅ **Error Handling**
- Timeout handling after 5 minutes
- Graceful error messages
- Fallback to failure page on errors

✅ **Order Status Tracking**
- Orders show payment method in database
- Payment info stored for reference
- Clear distinction between pending and paid orders

## Configuration

### Required Environment Variables
Ensure these are set in your backend `.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

### Polling Configuration
To change polling interval or max time, edit `CheckoutPage.jsx`:
```javascript
// Line ~150 - Change polling interval (in milliseconds)
}, 3000)  // Currently 3 seconds

// Line ~155 - Change max polls (currently ~5 minutes)
const maxPolls = 100  // Change this value
```

## Testing

### Test UPI Payment Flow
1. Start both frontend and backend servers
2. Add items to cart
3. Go to checkout
4. Select "UPI" as payment method
5. Fill checkout form and click "Place order"
6. Modal appears with payment link
7. In production: Scan QR with your UPI app
8. In sandbox: Use Razorpay test credentials

### Test Links
- Razorpay Documentation: https://razorpay.com/docs/payments/payment-methods/upi/#intent-flow
- Payment Testing: https://razorpay.com/docs/development/sandbox/

## Troubleshooting

### Modal not showing
- Check browser console for errors
- Verify Razorpay SDK is loaded
- Check RAZORPAY_KEY_ID is set correctly

### Payment not detected
- Manually click "Check Payment Status" button
- Wait for automatic polling (updates every 3 seconds)
- Check payment status in Razorpay dashboard

### Cart not clearing
- Should clear immediately when order is created
- Check browser storage for cart data
- Try clearing browser cache

### Order showing "pending" after payment
- Click "Check Payment Status" button
- Payment status should update within 3 seconds
- If still pending after 5 minutes, check Razorpay dashboard

## Notes
- Payment signature verification not required for UPI Intent Flow (Razorpay handles it)
- Orders are immediately cleared from cart to prevent accidental duplicates
- For COD and standard checkout, existing flow remains unchanged
- UPI payment works alongside other payment methods (card, net banking, COD)

## Support
For issues with Razorpay integration:
- Check Razorpay dashboard: https://dashboard.razorpay.com
- Review API logs in backend
- Verify test/live mode credentials
