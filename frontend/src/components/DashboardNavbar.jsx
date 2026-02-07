import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardNavbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('vendor');
        navigate('/login');
    };

    return (
        <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-sm">
                <User size={16} className="text-white/40" />
                <span className="text-sm text-white/70">{user.name || 'User'}</span>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-sm text-red-400 hover:bg-red-500/30 transition-colors text-sm font-bold uppercase tracking-wider"
            >
                <LogOut size={16} />
                <span className="hidden md:inline">Logout</span>
            </button>
        </div>
    );
};

export default DashboardNavbar;
