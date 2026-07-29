import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

export default function AgentCard({ icon: Icon, title, description, route, gradient, badge, stats }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => navigate(route)}
      className="agent-card group relative overflow-hidden cursor-pointer"
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className="badge bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400 border border-accent-200 dark:border-accent-500/20">
                <Zap className="w-3 h-3" />
                {badge}
              </span>
            )}
            <motion.div
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-gray-400 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300"
              whileHover={{ rotate: -45 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>

        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{description}</p>

        {stats && (
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <span className="btn-primary text-xs px-4 py-2 w-full justify-center">
            Launch Agent
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
