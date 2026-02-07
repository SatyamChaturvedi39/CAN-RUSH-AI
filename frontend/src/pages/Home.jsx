import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Clock, Star } from 'lucide-react';
import Header from '../components/Layout/Header';

// Cinematic Vendor Data including large background images
const vendors = [
    {
        id: 1,
        name: "CHRIST BAKERY",
        tagline: "Artisan Pastries & Coffee",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop",
        wait: "12 MIN",
        accent: "#ff3300"
    },
    {
        id: 2,
        name: "FRESHATARIA",
        tagline: "Clean Eating Reimagined",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop",
        wait: "8 MIN",
        accent: "#00cc66"
    },
    {
        id: 3,
        name: "MINGOS",
        tagline: "The Taste of Asia",
        image: "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1964&auto=format&fit=crop",
        wait: "20 MIN",
        accent: "#ff9900"
    }
];

const VendorSection = ({ vendor, index }) => {
    return (
        <div className="relative h-screen w-full overflow-hidden flex items-center justify-center sticky top-0">
            {/* Background Image with Parallax Scale Effect would ideally go here, using CSS sticky for stacking cards */}
            <div className="absolute inset-0 z-0">
                <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-full h-full object-cover brightness-[0.4]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center">
                <motion.span
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-primary font-bold tracking-[0.5em] uppercase mb-4 text-sm md:text-base"
                >
                    0{index + 1} — {vendor.tagline}
                </motion.span>

                <motion.h2
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-[12vw] leading-[0.85] font-heading font-bold text-white uppercase tracking-tighter mb-8 mix-blend-overlay"
                >
                    {vendor.name}
                </motion.h2>

                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex items-center gap-8"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-heading font-bold text-white">{vendor.wait}</span>
                        <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">Wait Time</span>
                    </div>

                    <button className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 group">
                        <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:-rotate-45 transition-transform duration-500" />
                    </button>

                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-heading font-bold text-white">4.8</span>
                        <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">Rating</span>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
            </div>
        </div>
    )
}

const Home = () => {
    return (
        <div className="bg-black text-white min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="h-screen relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {/* Simulated Video Background */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center brightness-[0.3] scale-105 animate-[pulse_10s_ease-in-out_infinite]"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black"></div>
                </div>

                <div className="relative z-10 text-center max-w-5xl px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-[15vw] leading-[0.8] font-heading font-bold uppercase tracking-tighter mb-4"
                    >
                        Canteen<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-white/50">Rush</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="text-lg md:text-2xl font-body font-light uppercase tracking-[0.3em] text-white/70"
                    >
                        The Future of Campus Dining
                    </motion.p>
                </div>
            </section>

            {/* Vendors Stacking Sections */}
            <main>
                {vendors.map((vendor, index) => (
                    <VendorSection key={vendor.id} vendor={vendor} index={index} />
                ))}
            </main>

            <footer className="h-screen flex items-center justify-center bg-black relative z-10 border-t border-white/10">
                <div className="text-center">
                    <h2 className="text-[10vw] font-heading font-bold text-white/10 select-none">THE END</h2>
                    <div className="flex gap-8 justify-center mt-12">
                        <a href="#" className="font-heading text-xl uppercase hover:text-primary transition-colors">Instagram</a>
                        <a href="#" className="font-heading text-xl uppercase hover:text-primary transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
