import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Sun, Moon, Monitor, Globe, Trash2, CheckCircle2, Info, RefreshCw, Bell, BellOff } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import notify from '../services/toast';

const themeOptions = [
  { value: 'light',  label: 'Light Mode',  icon: Sun,     desc: 'Clean, bright interface' },
  { value: 'dark',   label: 'Dark Mode',   icon: Moon,    desc: 'Easy on the eyes' },
  { value: 'system', label: 'System',      icon: Monitor, desc: 'Follows your OS setting' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Settings({ darkMode, setDarkMode, language, setLanguage }) {
  const [cleared, setCleared] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode === 'dark') root.classList.add('dark');
    else if (darkMode === 'light') root.classList.remove('dark');
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [darkMode]);

  const handleClear = () => {
    setCleared(true);
    notify.success('Chat history cleared');
    setTimeout(() => setCleared(false), 3000);
  };

  const handleReset = () => {
    notify.info('Demo data reset is not available in production mode.');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={itemVariants}>
        <PageHeader
          icon={SettingsIcon}
          title="Settings"
          description="Customize your CampusMate AI experience."
          gradient="from-slate-700 via-slate-800 to-gray-900"
        />
      </motion.div>

      {/* Theme */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Sun className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Appearance</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {themeOptions.map(({ value, label, icon: Icon, desc }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setDarkMode(value)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                darkMode === value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 shadow-md shadow-primary-500/10'
                  : 'border-gray-200 dark:border-white/[0.07] bg-white dark:bg-slate-800/40 hover:border-gray-300 dark:hover:border-white/[0.12]'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${darkMode === value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
              <p className={`text-sm font-semibold ${darkMode === value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>{label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Language */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Language</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.map(({ value, label }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setLanguage(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                language === value
                  ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-800/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/[0.07] hover:border-primary-300 dark:hover:border-primary-500/30'
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1">
          <Info className="w-3 h-3" /> Multi-language support is under development.
        </p>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notifications ? <Bell className="w-4 h-4 text-blue-500" /> : <BellOff className="w-4 h-4 text-gray-400" />}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setNotifications(!notifications); notify.info(notifications ? 'Notifications disabled' : 'Notifications enabled'); }}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${notifications ? 'bg-primary-500' : 'bg-gray-300 dark:bg-slate-600'}`}>
            <motion.span animate={{ x: notifications ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
          </motion.button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Show toast notifications for AI responses and status updates.</p>
      </motion.div>

      {/* Reset Demo Data */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Demo Data</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Reset all demo complaints and restore default campus data.</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border bg-white dark:bg-slate-800/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all duration-200">
          <RefreshCw className="w-4 h-4" /> Reset Demo Data
        </motion.button>
      </motion.div>

      {/* Chat History */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Trash2 className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Chat History</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Clear all chat conversations across agents. This action cannot be undone.</p>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleClear}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
            cleared
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
              : 'bg-white dark:bg-slate-800/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10'
          }`}
        >
          {cleared ? <CheckCircle2 className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
          {cleared ? 'Chat History Cleared' : 'Clear Chat History'}
        </motion.button>
      </motion.div>

      {/* Platform Info */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Platform Information</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Build', value: '2026.07.28' },
            { label: 'Environment', value: 'Production' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
