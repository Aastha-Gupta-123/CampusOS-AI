import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Building2, MapPin, ClipboardCheck, Users, CheckCircle2,
  AlertCircle, Loader2, Map, Sparkles, ArrowRight, Clock,
  Wifi, Database, Server, Activity, RefreshCw, TrendingUp,
  BarChart3, Calendar, BrainCircuit,
} from 'lucide-react';
import AgentCard from '../components/AgentCard';
import StatCard from '../components/StatCard';
import { getDashboardStats, getSystemHealth, listComplaints } from '../services/api';
import notify from '../services/toast';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const statusConfig = {
  Pending:      { color: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400', icon: Clock },
  'In Progress':{ color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400',    icon: Loader2 },
  Resolved:     { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400', icon: CheckCircle2 },
  Closed:       { color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',    icon: CheckCircle2 },
};

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-700" />
      </div>
      <div className="h-7 w-16 bg-gray-200 dark:bg-slate-700 rounded mb-1" />
      <div className="h-3 w-24 bg-gray-100 dark:bg-slate-800 rounded" />
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [health, setHealth]       = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [s, h, c] = await Promise.allSettled([
        getDashboardStats(),
        getSystemHealth(),
        listComplaints(),
      ]);
      if (s.status === 'fulfilled') setStats(s.value);
      if (h.status === 'fulfilled') setHealth(h.value);
      if (c.status === 'fulfilled') setComplaints(c.value.complaints || []);
      setLastUpdated(new Date());
    } catch {
      notify.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(true), 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const statCards = stats ? [
    { icon: MapPin,         label: 'Campus Locations',  value: stats.campus_locations,    color: 'bg-blue-50 dark:bg-blue-500/10',    iconColor: 'text-blue-500',    trend: 'Live' },
    { icon: ClipboardCheck, label: 'Complaints Today',  value: stats.complaints_today,    color: 'bg-amber-50 dark:bg-amber-500/10',  iconColor: 'text-amber-500' },
    { icon: CheckCircle2,   label: 'Resolved',          value: stats.resolved_complaints, color: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-500', trend: '+5%' },
    { icon: Users,          label: 'Active Users',      value: stats.active_users,        color: 'bg-purple-50 dark:bg-purple-500/10', iconColor: 'text-purple-500',  trend: '+12' },
  ] : [];

  const recent = [...complaints].slice(0, 5);

  const healthServices = health ? [
    { label: 'Backend API',       ok: health.services?.backend?.status === 'online',   icon: Server,   detail: `${health.services?.backend?.response_ms ?? '—'}ms` },
    { label: 'SQLite Database',   ok: health.services?.database?.status === 'online',  icon: Database, detail: health.services?.database?.type },
    { label: 'AI Model',          ok: health.services?.ai_model?.status === 'online',  icon: Wifi,     detail: health.services?.ai_model?.status },
    { label: 'Navigation Agent',  ok: true,                                             icon: Compass,  detail: `${health.services?.navigation_agent?.locations ?? '—'} locations` },
  ] : [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

      {/* Hero */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 p-7 lg:p-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="absolute top-1/2 right-16 -translate-y-1/2 hidden lg:block pointer-events-none">
          <motion.div animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-white/60" />
          </motion.div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge bg-white/20 text-white border-white/20 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" /> AI-Powered Campus Platform
            </span>
            {lastUpdated && (
              <span className="badge bg-white/10 text-white/70 border-white/10 text-[10px]">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
            Welcome to <span className="text-primary-200">CampusMate AI</span>
          </h1>
          <p className="text-primary-100/80 text-sm lg:text-base leading-relaxed mb-6 max-w-lg">
            Your intelligent campus assistant. Navigate facilities, report hostel issues, and track complaints — all powered by multi-agent AI.
          </p>
          <div className="flex flex-wrap gap-3">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/navigation')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary-700 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200">
              <Compass className="w-4 h-4" /> Navigate Campus
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/hostel')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 text-white font-semibold text-sm border border-white/20 hover:bg-white/25 transition-all duration-200">
              <Building2 className="w-4 h-4" /> Report Issue
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/map')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 text-white font-semibold text-sm border border-white/20 hover:bg-white/25 transition-all duration-200">
              <Map className="w-4 h-4" /> Campus Map
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Platform Overview</h2>
          <button onClick={() => fetchAll(true)} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-500 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {loading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) :
            statCards.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      </motion.div>

      {/* AI Agent Cards */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">AI Agents</h2>
          <span className="badge bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400 border border-accent-200 dark:border-accent-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" /> 4 Active
          </span>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <AgentCard icon={Compass} title="Campus Navigation AI"
            description="Locate classrooms, labs, offices and campus facilities with step-by-step directions powered by AI."
            route="/navigation" gradient="from-blue-500 to-blue-600" badge="Live"
            stats={[{ value: stats?.campus_locations ?? '—', label: 'Locations' }, { value: '<1s', label: 'Response' }]} />
          <AgentCard icon={Building2} title="Hostel Complaint AI"
            description="Report and track hostel maintenance issues using AI-powered classification and priority assignment."
            route="/hostel" gradient="from-emerald-500 to-teal-600" badge="Live"
            stats={[{ value: stats?.resolved_complaints ?? '—', label: 'Resolved' }, { value: stats?.pending_complaints ?? '—', label: 'Pending' }]} />
          <AgentCard icon={BarChart3} title="Attendance AI"
            description="Track your academic attendance, check exam eligibility, and analyze subject-wise performance."
            route="/attendance" gradient="from-emerald-500 to-teal-600" badge="Live"
            stats={[{ value: stats?.overall_attendance ?? '—', label: 'Attendance' }, { value: stats?.total_subjects ?? '—', label: 'Subjects' }]} />
          <AgentCard icon={Calendar} title="Timetable AI"
            description="View your class schedule, check today's timetable, and plan your academic week."
            route="/timetable" gradient="from-violet-500 to-purple-600" badge="Live"
            stats={[{ value: stats?.classes_per_week ?? '—', label: 'Classes/Week' }, { value: '6', label: 'Days' }]} />
          <AgentCard icon={BrainCircuit} title="CampusOS AI"
            description="Generate study plans or placement roadmaps through the unified CampusOS agent included in the platform."
            route="/campusos" gradient="from-indigo-500 to-violet-600" badge="New"
            stats={[{ value: '2', label: 'Modes' }, { value: 'AI', label: 'Powered' }]} />
        </div>
      </motion.div>

      {/* Bottom row */}
      <motion.div variants={itemVariants} className="grid gap-5 lg:grid-cols-5">

        {/* Recent Complaints */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Complaints</h3>
              <span className="badge bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 text-[10px]">
                Auto-refresh 30s
              </span>
            </div>
            <button onClick={() => navigate('/tracker')} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardCheck className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">No complaints yet.</p>
              <button onClick={() => navigate('/hostel')} className="mt-3 btn-primary text-xs px-4 py-2">
                Report First Issue
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((c, i) => {
                const cfg = statusConfig[c.status] || statusConfig.Pending;
                const StatusIcon = cfg.icon;
                return (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }} onClick={() => navigate('/tracker')}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center shrink-0">
                      <StatusIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{c.student_name} · Room {c.room_number}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{c.description}</p>
                    </div>
                    <span className={`badge shrink-0 ${cfg.color}`}>{c.status}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">System Health</h3>
            {health && (
              <span className={`badge text-[10px] ${health.status === 'healthy' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'}`}>
                {health.status === 'healthy' ? '● All Systems Go' : '● Degraded'}
              </span>
            )}
          </div>
          <div className="flex-1 space-y-2.5">
            {loading ? [...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-gray-100 dark:bg-slate-800/50 animate-pulse" />
            )) : healthServices.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400">Backend offline. Start the server.</p>
              </div>
            ) : healthServices.map((svc, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${svc.ok ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                  <svc.icon className={`w-3.5 h-3.5 ${svc.ok ? 'text-emerald-500' : 'text-red-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{svc.label}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{svc.detail}</p>
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 ${svc.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </motion.div>
            ))}
          </div>
          <button onClick={() => navigate('/map')} className="mt-4 btn-secondary text-xs w-full justify-center">
            <Map className="w-3.5 h-3.5" /> Open Campus Map
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
