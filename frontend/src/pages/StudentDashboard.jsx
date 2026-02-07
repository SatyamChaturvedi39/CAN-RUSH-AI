import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    Clock,
    CheckCircle,
    AlertTriangle,
    Timer,
    Coffee,
    Utensils
} from 'lucide-react';
import { vendorAPI, foodAPI, orderAPI } from '../services/api';
import socketService from '../services/socket';
import DashboardNavbar from '../components/DashboardNavbar';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('order'); // 'order' or 'history'

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
        socketService.connect();
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData._id) {
            socketService.joinStudentRoom(userData._id);
        }

        // Listen for order updates
        socketService.onOrderUpdate((update) => {
            console.log('Order update:', update);
            loadMyOrders();
        });

        socketService.onOrderReady((data) => {
            console.log('Order ready!', data);
            // Show notification
            alert(`🎉 Your order ${data.orderToken} is ready for pickup!`);
            loadMyOrders();
        });

        socketService.onPenalty((data) => {
            console.log('Penalty issued:', data);
            alert(`⚠️ Late pickup penalty: ${data.reason}`);
        });
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(userData);

            const [vendorsRes, ordersRes] = await Promise.all([
                vendorAPI.getAll(),
                orderAPI.getMyOrders()
            ]);

            setVendors(vendorsRes.data.data);
            setMyOrders(ordersRes.data.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMyOrders = async () => {
        try {
            const res = await orderAPI.getMyOrders();
            setMyOrders(res.data.data);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const loadMenu = async (vendorId) => {
        try {
            const res = await foodAPI.getByVendor(vendorId);
            setMenu(res.data.data);
            setSelectedVendor(vendorId);
            setCart([]);
        } catch (error) {
            console.error('Error loading menu:', error);
        }
    };

    const addToCart = (item) => {
        const existing = cart.find(c => c._id === item._id);
        if (existing) {
            setCart(cart.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId) => {
        const existing = cart.find(c => c._id === itemId);
        if (existing && existing.quantity > 1) {
            setCart(cart.map(c => c._id === itemId ? { ...c, quantity: c.quantity - 1 } : c));
        } else {
            setCart(cart.filter(c => c._id !== itemId));
        }
    };

    const placeOrder = async () => {
        if (cart.length === 0) return alert('Cart is empty!');

        try {
            setLoading(true);
            const orderData = {
                vendorId: selectedVendor,
                items: cart.map(item => ({
                    foodItemId: item._id,
                    quantity: item.quantity
                })),
                requestedPickupTime: new Date(Date.now() + 30 * 60000).toISOString()
            };

            const res = await orderAPI.create(orderData);
            const newOrder = res.data.data;
            const estimatedWait = res.data.estimatedWaitMinutes;

            alert(`✅ Order placed! Token: ${newOrder.orderToken}\n🤖 AI Estimate: ${estimatedWait.toFixed(1)} minutes\n📍 Queue Position: ${newOrder.queuePosition}`);

            setCart([]);
            setSelectedVendor(null);
            setActiveTab('history');
            loadMyOrders();
        } catch (error) {
            console.error('Error placing order:', error);
            alert(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                        Canteen <span className="text-primary">Rush</span>
                    </h1>
                    <p className="text-white/40 text-sm font-bold tracking-widest uppercase mt-2">
                        Student Dashboard • {user?.name || 'Loading...'}
                    </p>
                </div>
                <DashboardNavbar />
            </header>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('order')}
                    className={`pb-3 px-1 font-bold uppercase text-sm tracking-wider transition-colors ${activeTab === 'order'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-white/40 hover:text-white/60'
                        }`}
                >
                    <ShoppingBag className="inline mr-2" size={16} />
                    Place Order
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 px-1 font-bold uppercase text-sm tracking-wider transition-colors ${activeTab === 'history'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-white/40 hover:text-white/60'
                        }`}
                >
                    <Clock className="inline mr-2" size={16} />
                    My Orders ({myOrders.length})
                </button>
            </div>

            {activeTab === 'order' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Vendor Selection */}
                    <div className="lg:col-span-2">
                        {!selectedVendor ? (
                            <>
                                <h2 className="text-2xl font-heading font-bold uppercase tracking-wide mb-6">
                                    Select Vendor
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {vendors.map((vendor) => (
                                        <motion.div
                                            key={vendor._id}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => loadMenu(vendor._id)}
                                            className={`p-6 rounded-sm cursor-pointer transition-all ${vendor.isOpen
                                                ? 'bg-white/5 border border-white/10 hover:border-primary/50'
                                                : 'bg-white/5 border border-red-500/20 opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="text-4xl mb-3">
                                                {vendor.name.includes('Bakery') ? '🍰' : vendor.name.includes('Fresh') ? '🥗' : '🍜'}
                                            </div>
                                            <h3 className="text-xl font-bold font-heading mb-2">{vendor.name}</h3>
                                            <div className="flex items-center gap-2 text-sm">
                                                {vendor.isOpen ? (
                                                    <>
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                        <span className="text-green-400">Open</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                        <span className="text-red-400">Closed</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="mt-3 text-white/40 text-xs">
                                                Queue: {vendor.currentLoad}/{vendor.capacity}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-heading font-bold uppercase tracking-wide">Menu</h2>
                                    <button
                                        onClick={() => {
                                            setSelectedVendor(null);
                                            setCart([]);
                                        }}
                                        className="text-sm text-white/40 hover:text-white uppercase tracking-wider"
                                    >
                                        ← Change Vendor
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {menu.filter(item => item.isAvailable).map((item) => (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="p-4 bg-white/5 border border-white/10 rounded-sm"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold">{item.name}</h3>
                                                    <p className="text-xs text-white/40">{item.category}</p>
                                                </div>
                                                <span className="text-primary font-bold">₹{item.price}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xs text-white/40">
                                                    <Timer size={12} className="inline" /> {item.preparationTime}m
                                                </span>
                                                <button
                                                    onClick={() => addToCart(item)}
                                                    className="bg-primary/20 text-primary px-4 py-1 text-xs font-bold uppercase border border-primary/50 hover:bg-primary/30 transition-colors"
                                                >
                                                    Add +
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: Cart */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 p-6 bg-white/5 border border-white/10 rounded-sm">
                            <h3 className="text-xl font-bold font-heading uppercase mb-4">Your Cart</h3>
                            {cart.length === 0 ? (
                                <p className="text-white/40 text-sm text-center py-8">Cart is empty</p>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-6">
                                        {cart.map(item => (
                                            <div key={item._id} className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <div className="font-bold text-sm">{item.name}</div>
                                                    <div className="text-xs text-white/40">₹{item.price} × {item.quantity}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => removeFromCart(item._id)}
                                                        className="w-6 h-6 bg-red-500/20 text-red-400 flex items-center justify-center text-xs"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addToCart(item)}
                                                        className="w-6 h-6 bg-green-500/20 text-green-400 flex items-center justify-center text-xs"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-white/10 pt-4 mb-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-primary">₹{cartTotal}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={placeOrder}
                                        disabled={loading}
                                        className="w-full bg-primary text-black py-3 font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Placing...' : 'Place Order 🚀'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // Order History Tab
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myOrders.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-white/40">
                            No orders yet. Start by placing an order!
                        </div>
                    ) : (
                        myOrders.map(order => (
                            <OrderCard key={order._id} order={order} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const OrderCard = ({ order }) => {
    const statusColors = {
        placed: 'border-blue-500',
        accepted: 'border-yellow-500',
        preparing: 'border-orange-500',
        ready: 'border-green-500',
        completed: 'border-gray-500',
        cancelled: 'border-red-500'
    };

    const statusIcons = {
        placed: <Clock className="text-blue-400" size={20} />,
        accepted: <CheckCircle className="text-yellow-400" size={20} />,
        preparing: <Utensils className="text-orange-400" size={20} />,
        ready: <Coffee className="text-green-400" size={20} />,
        completed: <CheckCircle className="text-gray-400" size={20} />,
        cancelled: <AlertTriangle className="text-red-400" size={20} />
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 bg-white/5 border-l-4 ${statusColors[order.status]} border border-white/10 rounded-sm`}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {statusIcons[order.status]}
                        <span className="text-xs uppercase font-bold tracking-wider text-white/60">
                            {order.status}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold font-heading">#{order.orderToken}</h3>
                </div>
                <div className="text-right">
                    <div className="text-xs text-white/40">Queue</div>
                    <div className="text-xl font-bold">#{order.queuePosition}</div>
                </div>
            </div>

            <div className="space-y-1 mb-4 text-sm">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-white/80">
                        <span>{item.quantity}× {item.foodItemId?.name || 'Item'}</span>
                        <span>₹{item.price}</span>
                    </div>
                ))}
            </div>

            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-primary text-lg font-bold">₹{order.totalAmount}</span>
            </div>

            {order.status === 'ready' && (
                <div className="mt-4 bg-green-500/10 border border-green-500/30 p-3 rounded text-center">
                    <div className="text-green-400 font-bold text-sm">🎉 READY FOR PICKUP!</div>
                </div>
            )}

            {order.isLate && (
                <div className="mt-3 bg-red-500/10 border border-red-500/30 p-2 rounded text-center">
                    <div className="text-red-400 text-xs">⚠️ Late by {order.lateByMinutes} min</div>
                </div>
            )}
        </motion.div>
    );
};

export default StudentDashboard;
