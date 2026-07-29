import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Compass, Building2, ClipboardList,
  Info, Settings, Sparkles, X, Zap, Map,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/navigation', icon: Compass, label: 'Navigation AI' },
  { to: '/hostel', icon: Building2, label: 'Hostel AI' },
  { to: '/tracker', icon: ClipboardList, label: 'Complaint Tracker' },
  { to: '/map', icon: Map, label: 'Campus Map' },
  { to: '/about', icon: Info, label: 'About' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: -280, opacity: 0, transition: { duration: 0.2 } },
};

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex flex-col w-64 glass-sidebar h-screen sticky top-0 shrink-0">
        <SidebarContent onClose={onClose} />
      </aside>

      {/* Mobile sidebar — animated */}
      <AnimatePresence>
        {open && (
          <motion.aside
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 z-50 flex flex-col w-64 glass-sidebar h-screen lg:hidden shadow-2xl"
          >
            <SidebarContent onClose={onClose} mobile />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ onClose, mobile }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200/50 dark:border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-400 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">CampusMate</h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest">AI Platform</p>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="btn-ghost p-1.5 -mr-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Main Menu</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
        {navItems.map((item, idx) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                      : 'bg-gray-100/80 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400'
                  }`}>
                    <item.icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 text-sm">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200/50 dark:border-white/[0.05]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-500/10 dark:to-secondary-500/10 border border-primary-100 dark:border-primary-500/20">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-sm">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">AI v1.0 · Online</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Multi-Agent System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
