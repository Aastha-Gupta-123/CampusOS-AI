import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, color, iconColor, trend }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-accent-600 dark:text-accent-400">
            <TrendingUp className="w-3 h-3" />
            <span className="text-[10px] font-semibold">{trend}</span>
          </div>
        )}
      </div>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5"
      >
        {value}
      </motion.p>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
    </motion.div>
  );
}
