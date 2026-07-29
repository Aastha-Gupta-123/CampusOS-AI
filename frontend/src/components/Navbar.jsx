import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Sun, Moon, Bell, ChevronDown, Wifi } from 'lucide-react';

const pageMeta = {
  '/':          { title: 'Dashboard',          subtitle: 'Platform overview & quick access' },
  '/navigation':{ title: 'Campus Navigation AI', subtitle: 'Find any campus location instantly' },
  '/hostel':    { title: 'Hostel Complaint AI',  subtitle: 'Report and track hostel issues' },
  '/tracker':   { title: 'Complaint Tracker',    subtitle: 'Monitor complaint status & history' },
  '/map':       { title: 'Campus Map',           subtitle: 'Interactive campus location map' },
  '/about':     { title: 'About',               subtitle: 'Platform information & team' },
  '/settings':  { title: 'Settings',            subtitle: 'Customize your experience' },
};

export default function Navbar({ onMenuClick, darkMode, onToggleDark }) {
  const location = useLocation();
  const meta = pageMeta[location.pathname] || { title: 'CampusMate AI', subtitle: '' };

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

          {/* User avatar */}
          <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all duration-200">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
              DS
            </div>
            <span className="hidden sm:block text-xs font-medium text-gray-700 dark:text-gray-300">Deepak S</span>
            <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
