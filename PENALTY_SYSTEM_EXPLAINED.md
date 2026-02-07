# ⚖️ Automated Vendor Penalty System

## What is it?
This is an accountability feature designed to prevent food wastage and ensure smooth canteen operations. Since orders are prepared based on time predictions, if a student fails to pick up their food on time, it disrupts the vendor's workflow and food quality drops.

**The Goal:** Ensure students show up when the AI says the food is ready.

## ✅ Is it Implemented?
**YES, it is fully implemented in the backend code.**

I verified the code in `backend/controllers/orderController.js` (Lines 500-558).

## ⚙️ How it Works (Logic)

1. **Detection:**
   When a student picks up an order/marks it complete, the system calculates the delay.
   - **Grace Period:** 5 minutes
   - If `Actual Pickup Time` > `Predicted Time + 5 mins` → **Marked as LATE**

2. **Progressive Punishments:**
   The system automatically checks the student's history:

   - **1st Offense:** ⚠️ **Warning issued** (0 points)
     - *"First late pickup - Warning issued"*
   
   - **2nd Offense:** ⚠️ **5 Penalty Points**
     - *"Second late pickup - 5 penalty points"*
   
   - **3rd+ Offense:** ❌ **10 Penalty Points** (per offense)
     - *"X late pickups - 10 penalty points"*

3. **Automatic Blocking:**
   - If a student accumulates **50+ points**, their account is **automatically blocked**.
   - `student.isBlocked = true`
   - Blocked students **cannot place new orders** until an Admin unblocks them.

## 📝 Code Proof
Found in `backend/controllers/orderController.js`:

```javascript
// Trigger in completeOrder function
if (lateMinutes > 5) {
    // ...
    await processPenalty(order._id, order.studentId);
}

// Logic in processPenalty function
if (student.penaltyPoints >= 50) {
    student.isBlocked = true;
    penalty.type = 'block';
}
```

## 🎯 Why This Matters for Judges
1. **Real-world complexity:** Most hackathon projects just do "happy path" ordering. This handles "unhappy paths" (delays/no-shows).
2. **Accountability:** Shows you thought about the business side (food wastage), not just the tech side.
3. **Automation:** No manual admin work needed; the code handles enforcement 24/7.
