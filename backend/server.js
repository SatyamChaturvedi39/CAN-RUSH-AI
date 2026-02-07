require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initializeSocket } = require('./services/socketService');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Canteen Rush AI Backend is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/orders', require('./routes/orders'));
// app.use('/api/students', require('./routes/students'));
app.use('/api/admin', require('./routes/admin'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);

    // Initialize Socket.io after server starts
    initializeSocket(server);
    console.log(`⚡ Socket.io initialized for real-time updates\n`);
});

module.exports = app;
