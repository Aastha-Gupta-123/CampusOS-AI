import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Sun, Moon, Bell, ChevronDown, Wifi, LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const pageMeta = {
  '/':          { title: 'Dashboard',          subtitle: 'Platform overview & quick access' },
  '/dashboard': { title: 'Dashboard',          subtitle: 'Platform overview & quick access' },
  '/navigation':{ title: 'Campus Navigation AI', subtitle: 'Find any campus location instantly' },
  '/hostel':    { title: 'Hostel Complaint AI',  subtitle: 'Report and track hostel issues' },
  '/attendance':{ title: 'Attendance AI',        subtitle: 'Track your academic attendance' },
  '/timetable': { title: 'Timetable AI',         subtitle: 'View your class schedule' },
  '/placement': { title: 'Placement AI',         subtitle: 'Generate placement preparation plans' },
  '/campusos':  { title: 'CampusOS AI',          subtitle: 'Unified learning & placement assistant' },
  '/tracker':   { title: 'Complaint Tracker',    subtitle: 'Monitor complaint status & history' },
  '/map':       { title: 'Campus Map',           subtitle: 'Interactive campus location map' },
  '/about':     { title: 'About',               subtitle: 'Platform information & team' },
  '/settings':  { title: 'Settings',            subtitle: 'Customize your experience' },
};

export default function Navbar({ onMenuClick, darkMode, onToggleDark }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const meta = pageMeta[location.pathname] || { title: 'CampusMate AI', subtitle: '' };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-30 glass-navbar">
      <div className="flex items-center justify-between px-4 lg:px-6 h-14">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden btn-ghost p-2 -ml-1"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{meta.title}</h2>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 hidden sm:block">{meta.subtitle}</p>
          </motion.div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Status */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-500/10 border border-accent-200/60 dark:border-accent-500/20">
            <Wifi className="w-3 h-3 text-accent-500" />
            <span className="text-[11px] font-medium text-accent-700 dark:text-accent-400">All Systems Online</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
          </div>

          {/* Notifications */}
          <button className="btn-ghost p-2 relative" aria-label="Notifications">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleDark}
            className="btn-ghost p-2"
            aria-label="Toggle theme"
          >
            <motion.div
              key={darkMode}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {darkMode === 'dark'
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-slate-600" />
              }
            </motion.div>
          </button>

          {/* User avatar with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all duration-200"
            >
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials}
              </div>
              <span className="hidden sm:block text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                {user?.full_name || 'User'}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 glass-card rounded-xl py-2 shadow-2xl border border-gray-200/60 dark:border-white/[0.06] z-50"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="badge bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20 text-[10px] capitalize">
                      {user?.role || 'student'}
                    </span>
                    <span className="text-[10px] text-gray-400">{user?.department?.split(' ').slice(0, 2).join(' ') || ''}</span>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <User className="w-3.5 h-3.5" /> Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}