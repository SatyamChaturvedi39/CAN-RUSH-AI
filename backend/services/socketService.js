// Socket.io service for real-time updates
const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ New client connected: ${socket.id}`);

        // Join vendor-specific room
        socket.on('join:vendor', (vendorId) => {
            socket.join(`vendor:${vendorId}`);
            console.log(`Vendor ${vendorId} joined their room`);
        });

        // Join student-specific room
        socket.on('join:student', (studentId) => {
            socket.join(`student:${studentId}`);
            console.log(`Student ${studentId} joined their room`);
        });

        // Track specific order
        socket.on('track:order', (orderId) => {
            socket.join(`order:${orderId}`);
            console.log(`Tracking order ${orderId}`);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Emit new order to vendor
const emitNewOrder = (vendorId, orderData) => {
    if (io) {
        io.to(`vendor:${vendorId}`).emit('order:new', orderData);
    }
};

// Emit order status update to student
const emitOrderUpdate = (studentId, orderId, update) => {
    if (io) {
        io.to(`student:${studentId}`).emit('order:update', {
            orderId,
            ...update
        });
        io.to(`order:${orderId}`).emit('order:update', update);
    }
};

// Emit order ready notification
const emitOrderReady = (studentId, orderData) => {
    if (io) {
        io.to(`student:${studentId}`).emit('order:ready', orderData);
    }
};

// Emit queue update to all connected clients for a vendor
const emitQueueUpdate = (vendorId, queueData) => {
    if (io) {
        io.to(`vendor:${vendorId}`).emit('queue:update', queueData);
    }
};

// Emit penalty notification to student
const emitPenalty = (studentId, penaltyData) => {
    if (io) {
        io.to(`student:${studentId}`).emit('penalty:issued', penaltyData);
    }
};

module.exports = {
    initializeSocket,
    getIO,
    emitNewOrder,
    emitOrderUpdate,
    emitOrderReady,
    emitQueueUpdate,
    emitPenalty
};
