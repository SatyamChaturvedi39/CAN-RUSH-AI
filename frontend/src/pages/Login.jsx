import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);

            if (response.data.success) {
                // Store token in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Redirect based on role
                if (response.data.user.role === 'vendor') {
                    navigate('/vendor-dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center brightness-[0.2]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md px-6">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Logo/Title */}
                    <div className="text-center mb-12">
                        <Link to="/" className="inline-block mb-4">
                            <h1 className="text-4xl font-heading font-bold tracking-tighter uppercase">
                                CAN<span className="text-primary">-</span>RUSH
                            </h1>
                        </Link>
                        <p className="text-white/50 text-sm font-bold tracking-widest uppercase">Welcome Back</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/10 border border-red-500/50 rounded-sm p-4 flex items-center gap-3"
                            >
                                <AlertCircle className="text-red-500" size={20} />
                                <p className="text-red-500 text-sm">{error}</p>
                            </motion.div>
                        )}

                        {/* Email Field */}
                        <div className="relative">
                            <label className="block text-xs font-bold tracking-widest uppercase mb-2 text-white/70">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-sm py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <label className="block text-xs font-bold tracking-widest uppercase mb-2 text-white/70">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-sm py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-heading font-bold tracking-widest uppercase py-4 rounded-sm transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'LOGGING IN...' : 'LOGIN'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-8 text-center">
                        <p className="text-white/50 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary hover:underline font-bold">
                                Register here
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
