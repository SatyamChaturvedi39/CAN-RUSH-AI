const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./models/Order');
const User = require('./models/User');

const testPenalty = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find the most recent order that is NOT completed
        const order = await Order.findOne({
            status: { $ne: 'completed' }
        }).sort({ createdAt: -1 });

        if (!order) {
            console.log('❌ No active order found to make late.');
            console.log('👉 Please place an order first!');
            process.exit(1);
        }

        console.log(`\nFound Order: ${order.orderToken}`);
        console.log(`Original Predicted Time: ${order.predictedReadyTime}`);

        // 2. Make it "LATE" by setting predicted time to 1 hour ago
        // Actual pickup will be NOW, so it will be ~60 mins late
        order.predictedReadyTime = new Date(Date.now() - 60 * 60 * 1000);
        await order.save();

        console.log(`UPDATED Predicted Time:  ${order.predictedReadyTime}`);
        console.log(`\n✅ Order ${order.orderToken} is now 1 HOUR late.`);
        console.log(`👉 Go to the Dashboard and click 'Complete' (or 'Picked Up')`);
        console.log(`👉 The system should issue a penalty immediately.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testPenalty();
