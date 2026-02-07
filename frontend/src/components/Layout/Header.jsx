import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4 bg-black/80 backdrop-blur-md' : 'py-8 bg-transparent'
                    }`}
            >
                <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
                    <a href="/" className="relative z-50 group">
                        <span className="text-2xl md:text-3xl font-heading font-bold text-white tracking-tighter uppercase group-hover:text-primary transition-colors">
                            CAN<span className="text-primary">-</span>RUSH
                        </span>
                    </a>

                    <div className="flex items-center gap-8">
                        <Link to="/login" className="hidden md:block text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors">
                            Login
                        </Link>

                        <Link to="/register" className="hidden md:block text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors">
                            Register
                        </Link>

                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="group flex items-center gap-3 text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors"
                        >
                            <span className="hidden md:block">Menu</span>
                            <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                                <Menu size={20} />
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Fullscreen Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex flex-col"
                    >
                        <div className="flex justify-between items-center p-6 md:p-12">
                            <span className="text-2xl font-heading font-bold tracking-tighter text-white/50">NAVIGATION</span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-primary hover:text-white transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex-1 flex flex-col justify-center items-center gap-8">
                            {[
                                { name: 'Locations', href: '#locations' },
                                { name: 'How it Works', href: '#how-it-works' },
                                { name: 'Contact', href: '#contact' }
                            ].map((item, i) => (
                                <motion.a
                                    key={item.name}
                                    href={item.href}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-5xl md:text-8xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 hover:to-primary transition-all uppercase tracking-tight"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </motion.a>
                            ))}
                        </nav>

                        <div className="p-12 text-center">
                            <p className="text-white/30 text-xs font-bold tracking-[0.3em] uppercase">Est. 2026 // Campus Dining Reimagined</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
