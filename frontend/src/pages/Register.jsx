import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, Hash, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        confirmPassword: '',
        studentId: '',
        vendorId: '',
        role: 'student'
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

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...registerData } = formData;
            const response = await axios.post('http://localhost:5000/api/auth/register', registerData);

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
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden py-12">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center brightness-[0.2]"></div>
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
                        <p className="text-white/50 text-sm font-bold tracking-widest uppercase">Create Account</p>
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

                        {/* Name Field */}
                        <div className="relative">
                            <label className="block text-xs font-bold tracking-widest uppercase mb-2 text-white/70">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-sm py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

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

                        {/* Role Selection */}
                        <div className="flex gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'student', vendorId: '' })}
                                className={`flex-1 py-3 rounded-sm text-xs font-bold tracking-widest uppercase transition-all border ${formData.role === 'student'
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'vendor', studentId: '' })}
                                className={`flex-1 py-3 rounded-sm text-xs font-bold tracking-widest uppercase transition-all border ${formData.role === 'vendor'
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                Vendor
                            </button>
                        </div>

                        {/* Dynamic ID Field */}
                        <div className="relative">
                            <label className="block text-xs font-bold tracking-widest uppercase mb-2 text-white/70">
                                {formData.role === 'student' ? 'Student ID' : 'Vendor ID'}
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input
                                    type="text"
                                    name={formData.role === 'student' ? 'studentId' : 'vendorId'}
                                    value={formData.role === 'student' ? formData.studentId : formData.vendorId}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-sm py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors"
                                    placeholder={formData.role === 'student' ? 'STU123456' : 'VEN-001'}
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

                        {/* Confirm Password Field */}
                        <div className="relative">
                            <label className="block text-xs font-bold tracking-widest uppercase mb-2 text-white/70">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
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
                            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-8 text-center">
                        <p className="text-white/50 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline font-bold">
                                Login here
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
