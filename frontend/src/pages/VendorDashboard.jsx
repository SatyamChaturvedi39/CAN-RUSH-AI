import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Menu as MenuIcon
} from 'lucide-react';

const VendorDashboard = () => {
    // Mock Data
    const [stats, setStats] = useState({
        revenue: 12500,
        orders: 45,
        avgTime: '12m',
        pending: 8
    });

    const [orders, setOrders] = useState([
        { id: 101, user: 'Rahul K.', items: ['Chicken Biryani', 'Coke'], total: 250, status: 'pending', time: '10:30 AM' },
        { id: 102, user: 'Sneha M.', items: ['Veg Sandwich', 'Cold Coffee'], total: 180, status: 'preparing', time: '10:32 AM' },
        { id: 103, user: 'Arjun S.', items: ['Masala Dosa'], total: 90, status: 'ready', time: '10:25 AM' },
    ]);

    const handleStatusUpdate = (id, newStatus) => {
        setOrders(orders.map(order =>
            order.id === id ? { ...order, status: newStatus } : order
        ));
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                        Kitchen <span className="text-primary">Live</span>
                    </h1>
                    <p className="text-white/40 text-sm font-bold tracking-widest uppercase mt-2">Vendor Dashboard • Christ Bakery</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                    <span className="text-green-500 font-bold tracking-widest text-xs uppercase">System Online</span>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <StatCard icon={<DollarSign />} label="Today's Revenue" value={`₹${stats.revenue}`} color="text-green-400" border="border-green-500/20" />
                <StatCard icon={<Users />} label="Total Orders" value={stats.orders} color="text-blue-400" border="border-blue-500/20" />
                <StatCard icon={<Clock />} label="Avg. Prep Time" value={stats.avgTime} color="text-orange-400" border="border-orange-500/20" />
                <StatCard icon={<AlertCircle />} label="Pending" value={stats.pending} color="text-red-400" border="border-red-500/20" />
            </div>

            {/* Live Queue */}
            <h2 className="text-2xl font-heading font-bold uppercase tracking-wide mb-6 flex items-center gap-3">
                <MenuIcon className="text-primary" /> Live Order Queue
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-sm border ${order.status === 'pending' ? 'border-l-4 border-l-red-500 bg-white/5 border-white/10' :
                                order.status === 'preparing' ? 'border-l-4 border-l-orange-500 bg-white/5 border-white/10' :
                                    'border-l-4 border-l-green-500 bg-white/5 border-white/10'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold font-heading">#{order.id}</h3>
                                <p className="text-white/60 text-sm">{order.user}</p>
                            </div>
                            <span className="text-xs font-mono text-white/40">{order.time}</span>
                        </div>

                        <div className="space-y-2 mb-6">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-white/80">{item}</span>
                                </div>
                            ))}
                            <div className="pt-2 mt-2 border-t border-white/10 flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-primary">₹{order.total}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                    className="flex-1 bg-orange-500/20 text-orange-400 border border-orange-500/50 py-2 text-xs font-bold uppercase tracking-wider hover:bg-orange-500/30 transition-colors"
                                >
                                    Accept
                                </button>
                            )}
                            {order.status === 'preparing' && (
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'ready')}
                                    className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 py-2 text-xs font-bold uppercase tracking-wider hover:bg-green-500/30 transition-colors"
                                >
                                    Mark Ready
                                </button>
                            )}
                            {order.status === 'ready' && (
                                <div className="flex-1 bg-green-500/10 text-green-500 py-2 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                                    <CheckCircle size={14} /> Ready to Pickup
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
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
