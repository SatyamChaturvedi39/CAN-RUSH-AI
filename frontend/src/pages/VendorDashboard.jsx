import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Menu as MenuIcon
} from 'lucide-react';
import { orderAPI, vendorAPI } from '../services/api';
import socketService from '../services/socket';
import DashboardNavbar from '../components/DashboardNavbar';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        avgTime: '0m',
        pending: 0
    });
    const [orders, setOrders] = useState([]);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Auth check
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        loadData();
        setupSocket();
        return () => socketService.disconnect();
    }, []);

    const setupSocket = () => {
        console.log('🔌 Setting up Socket.io connection...');
        socketService.connect();

        // Get vendor info from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const vendorData = JSON.parse(localStorage.getItem('vendor') || '{}');

        console.log('👤 User Data:', userData);
        console.log('🏪 Vendor Data:', vendorData);

        if (vendorData._id) {
            console.log(`📡 Joining vendor room with ID: ${vendorData._id}`);
            socketService.joinVendorRoom(vendorData._id);
        } else {
            console.error('❌ Vendor ID not found in localStorage!');
        }

        // Listen for new orders
        socketService.onNewOrder((orderData) => {
            console.log('🔔 New order received!', orderData);
            // Play notification sound or show toast
            loadOrders();
        });

        socketService.onQueueUpdate((queueData) => {
            console.log('📊 Queue updated:', queueData);
            loadOrders();
        });
    };

    const loadData = async () => {
        try {
            setLoading(true);
            await loadOrders();

            // Load vendor stats if available
            const vendorData = JSON.parse(localStorage.getItem('vendor') || '{}');
            if (vendorData._id) {
                setVendor(vendorData);
                try {
                    const statsRes = await vendorAPI.getStats(vendorData._id);
                    // Update stats from API if available
                } catch (err) {
                    console.log('Stats not available yet');
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const res = await orderAPI.getVendorQueue();
            const queueOrders = res.data.data;
            setOrders(queueOrders);

            // Calculate stats
            const pending = queueOrders.filter(o => o.status === 'placed').length;
            const totalAmount = queueOrders.reduce((sum, o) => sum + o.totalAmount, 0);

            setStats({
                revenue: totalAmount,
                orders: queueOrders.length,
                avgTime: '12m', // Can be calculated from actual data
                pending
            });
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setLoading(true);

            if (newStatus === 'accepted') {
                await orderAPI.accept(orderId);
            } else if (newStatus === 'preparing') {
                await orderAPI.markPreparing(orderId);
            } else if (newStatus === 'ready') {
                await orderAPI.markReady(orderId);
            }

            // Reload orders
            await loadOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.response?.data?.message || 'Failed to update order');
        } finally {
            setLoading(false);
        }
    };

    const getStatusButton = (order) => {
        if (order.status === 'placed') {
            return (
                <button
                    onClick={() => handleStatusUpdate(order._id, 'accepted')}
                    disabled={loading}
                    className="flex-1 bg-orange-500/20 text-orange-400 border border-orange-500/50 py-2 text-xs font-bold uppercase tracking-wider hover:bg-orange-500/30 transition-colors disabled:opacity-50"
                >
                    Accept Order
                </button>
            );
        } else if (order.status === 'accepted') {
            return (
                <button
                    onClick={() => handleStatusUpdate(order._id, 'preparing')}
                    disabled={loading}
                    className="flex-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 py-2 text-xs font-bold uppercase tracking-wider hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                >
                    Start Preparing
                </button>
            );
        } else if (order.status === 'preparing') {
            return (
                <button
                    onClick={() => handleStatusUpdate(order._id, 'ready')}
                    disabled={loading}
                    className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 py-2 text-xs font-bold uppercase tracking-wider hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                    Mark Ready
                </button>
            );
        } else if (order.status === 'ready') {
            return (
                <div className="flex-1 bg-green-500/10 text-green-500 py-2 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Ready to Pickup
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                        Kitchen <span className="text-primary">Live</span>
                    </h1>
                    <p className="text-white/40 text-sm font-bold tracking-widest uppercase mt-2">
                        Vendor Dashboard • {vendor?.name || 'Loading...'}
                    </p>
                </div>
                <DashboardNavbar />
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <StatCard icon={<DollarSign />} label="Today's Revenue" value={`₹${stats.revenue}`} color="text-green-400" border="border-green-500/20" />
                <StatCard icon={<Users />} label="Active Orders" value={stats.orders} color="text-blue-400" border="border-blue-500/20" />
                <StatCard icon={<Clock />} label="Avg. Prep Time" value={stats.avgTime} color="text-orange-400" border="border-orange-500/20" />
                <StatCard icon={<AlertCircle />} label="Pending" value={stats.pending} color="text-red-400" border="border-red-500/20" />
            </div>

            {/* Live Queue */}
            <h2 className="text-2xl font-heading font-bold uppercase tracking-wide mb-6 flex items-center gap-3">
                <MenuIcon className="text-primary" /> Live Order Queue
            </h2>

            {loading && orders.length === 0 ? (
                <div className="text-center py-12 text-white/40">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 text-white/40">No active orders in queue</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-sm border ${order.status === 'placed' ? 'border-l-4 border-l-red-500 bg-white/5 border-white/10' :
                                order.status === 'preparing' ? 'border-l-4 border-l-orange-500 bg-white/5 border-white/10' :
                                    order.status === 'accepted' ? 'border-l-4 border-l-yellow-500 bg-white/5 border-white/10' :
                                        'border-l-4 border-l-green-500 bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold font-heading">#{order.orderToken}</h3>
                                    <p className="text-white/60 text-sm">{order.studentId?.name || 'Student'}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-mono text-white/40">Queue</span>
                                    <div className="text-xl font-bold">#{order.queuePosition}</div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-white/80">
                                            {item.quantity}× {item.foodItemId?.name || 'Item'}
                                        </span>
                                        <span className="text-white/60">₹{item.price}</span>
                                    </div>
                                ))}
                                <div className="pt-2 mt-2 border-t border-white/10 flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">₹{order.totalAmount}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {getStatusButton(order)}
                            </div>

                            <div className="mt-3 text-xs text-white/40">
                                Created: {new Date(order.createdAt).toLocaleTimeString()}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color, border }) => (
    <div className={`p-6 bg-white/5 border ${border} rounded-sm`}>
        <div className={`mb-2 ${color}`}>{icon}</div>
        <div className="text-3xl font-heading font-bold">{value}</div>
        <div className="text-xs text-white/40 uppercase tracking-widest">{label}</div>
    </div>
);

export default VendorDashboard;
