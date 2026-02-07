# 🔧 How to Test Real-Time Order Updates

## The Issue
Orders placed by students weren't appearing in vendor dashboard due to Socket.io room joining mismatch.

## The Fix
Updated VendorDashboard to properly join vendor room using correct vendor ID.

## Testing Steps

### **Step 1: Open Two Browser Windows**

**Window 1 - Student:**
1. Go to: http://localhost:5173/register
2. Register as Student:
   - Name: Test Student
   - Email: student@test.com
   - Password: test123
   - Role: Student
   - Student ID: 12345
3. You'll auto-login and see Student Dashboard

**Window 2 - Vendor:**
1. Go to: http://localhost:5173/login
2. Login as Vendor:
   - Email: bakery@christuniversity.in
   - Password: vendor123
3. You'll see Vendor Dashboard

### **Step 2: Place Order (Window 1 - Student)**
1. In student dashboard, click on "Christ Bakery"
2. Add items to cart:
   - Click "+ Add" on Croissant (2x)
   - Click "+ Add" on Cappuccino (1x)
3. Click "Place Order 🚀"
4. **You should see:**
   - "Order placed successfully" message
   - AI prediction: "Ready in X minutes"
   - Order appears in "My Orders" section

### **Step 3: Check Vendor Dashboard (Window 2)**
1. Switch to vendor dashboard window
2. **You should NOW see:**
   - New order appears in "Live Order Queue"
   - Order shows student name, items, total
   - Status: "PLACED" with orange color

### **Step 4: Test Real-Time Flow**
1. In Vendor window, click "Accept Order"
2. **In Student window, you should see:**
   - Order status changes to "AcceptedAccepted" (update received!)
3. In Vendor window, click "Start Preparing"
4. **In Student window, order status → "PreparingPreparing"**
5. In Vendor window, click "Mark Ready"
6. **In Student window:**
   - Status → "READY"
   - Notification appears!

## Expected Console Logs

**Student Dashboard Console:**
```
Socket connected
Joined student room: <student_id>
Order update received: {status: 'accepted', ...}
Order ready!: {orderToken: 'ABC123', ...}
```

**Vendor Dashboard Console:**
```
Socket connected
Joined vendor room: <vendor_id>
New order received!: {orderId: '...', studentName: 'Test Student', ...}
```

## If It Still Doesn't Work

### Check Backend Logs:
Look for:
```
✅ New client connected: socket_id
Vendor <id> joined their room
```

### Check Browser Console:
Press F12 and look for Socket.io connection errors

### Verify Services Running:
- Backend: http://localhost:5000/api/health
- ML Service: http://localhost:8000/health
- Frontend: http://localhost:5173

## Quick Debug Commands

**Test order creation:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendorId":"VENDOR_ID","items":[{"foodItemId":"FOOD_ID","quantity":1}]}'
```

**Check Socket.io connection:**
Open browser console on student/vendor dashboard and type:
```javascript
window.socket // Should show Socket object
```
