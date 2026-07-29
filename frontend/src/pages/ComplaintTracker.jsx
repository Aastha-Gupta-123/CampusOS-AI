import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, ClipboardList, AlertCircle, CheckCircle2,
  Clock, ChevronRight, RefreshCw, Edit3, X, Check,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { getComplaintById, listComplaints, updateComplaintStatus } from '../services/api';
import notify from '../services/toast';

const statusConfig = {
  Pending:      { color: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',    icon: Clock },
  'In Progress':{ color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',          icon: Loader2 },
  Resolved:     { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2 },
  Closed:       { color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border-gray-200 dark:border-gray-500/20',          icon: CheckCircle2 },
};

const priorityConfig = {
  High:   'text-red-600 dark:text-red-400 font-semibold',
  Medium: 'text-amber-600 dark:text-amber-400 font-semibold',
  Low:    'text-emerald-600 dark:text-emerald-400 font-semibold',
};

const ALL_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Closed'];

function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ComplaintDetail({ complaint, onStatusUpdate }) {
  const [editing, setEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [saving, setSaving] = useState(false);
  const cfg = statusConfig[complaint.status] || statusConfig.Pending;
  const StatusIcon = cfg.icon;

  const handleSave = async () => {
    if (newStatus === complaint.status) { setEditing(false); return; }
    setSaving(true);
    try {
      await updateComplaintStatus(complaint.complaint_id, newStatus);
      notify.success(`Status updated to "${newStatus}"`);
      onStatusUpdate(complaint.complaint_id, newStatus);
      setEditing(false);
    } catch {
      notify.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="mt-5 p-5 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-800/80 dark:to-slate-900/80 border border-primary-200/50 dark:border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 uppercase tracking-wider">Complaint ID</p>
          <h4 className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{complaint.complaint_id}</h4>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-2">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="text-xs border border-gray-200 dark:border-white/[0.08] rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleSave} disabled={saving}
                className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setEditing(false)}
                className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`badge border ${cfg.color}`}><StatusIcon className="w-3 h-3" /> {complaint.status}</span>
              <button onClick={() => setEditing(true)} title="Update status"
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                <Edit3 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        {[
          { label: 'Category',  value: complaint.category },
          { label: 'Priority',  value: complaint.priority, className: priorityConfig[complaint.priority] },
          { label: 'Student',   value: complaint.student_name },
          { label: 'Room',      value: complaint.room_number },
          { label: 'Created',   value: formatDate(complaint.created_at) },
          { label: 'ETA',       value: complaint.status === 'Pending' ? '3–5 days' : complaint.status === 'In Progress' ? '1–2 days' : 'Completed' },
        ].map((f, i) => (
          <div key={i}>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{f.label}</p>
            <p className={`text-sm font-medium text-gray-900 dark:text-white ${f.className || ''}`}>{f.value}</p>
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-gray-200/60 dark:border-white/[0.05]">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Description</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{complaint.description}</p>
      </div>
    </motion.div>
  );
}

export default function ComplaintTracker() {
  const [searchId, setSearchId]           = useState('');
  const [complaint, setComplaint]         = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError]                 = useState('');
  const [showAll, setShowAll]             = useState(false);
  const [filterStatus, setFilterStatus]   = useState('all');

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const d = await listComplaints();
      setAllComplaints(d.complaints || []);
      if (!silent) setShowAll(true);
    } catch {
      notify.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load all on mount
  useEffect(() => { loadAll(true); }, [loadAll]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(() => loadAll(true), 30000);
    return () => clearInterval(t);
  }, [loadAll]);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearchLoading(true);
    setError('');
    setComplaint(null);
    try {
      const data = await getComplaintById(searchId.trim());
      setComplaint(data);
    } catch {
      setError('Complaint not found. Please check the ID and try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStatusUpdate = (id, newStatus) => {
    setAllComplaints(prev => prev.map(c => c.complaint_id === id ? { ...c, status: newStatus } : c));
    if (complaint?.complaint_id === id) setComplaint(prev => ({ ...prev, status: newStatus }));
  };

  const filtered = filterStatus === 'all'
    ? allComplaints
    : allComplaints.filter(c => c.status === filterStatus);

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = allComplaints.filter(c => c.status === s).length;
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <PageHeader icon={ClipboardList} title="Complaint Tracker"
        description="Search by complaint ID or browse all registered complaints. Update status in real-time."
        gradient="from-violet-600 via-purple-700 to-indigo-800" />

      {/* Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ALL_STATUSES.map(s => {
          const cfg = statusConfig[s];
          const StatusIcon = cfg.icon;
          return (
            <motion.button key={s} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setFilterStatus(s === filterStatus ? 'all' : s); setShowAll(true); }}
              className={`glass-card rounded-xl p-3 text-left transition-all duration-200 ${filterStatus === s ? 'ring-2 ring-primary-500/50' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <StatusIcon className="w-4 h-4 text-gray-400" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">{counts[s] ?? 0}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Search */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" /> Search by Complaint ID
        </h3>
        <div className="flex gap-3">
          <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter Complaint ID (e.g., CMP-20260727165030)"
            className="input-field flex-1" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSearch} disabled={searchLoading || !searchId.trim()} className="btn-primary shrink-0">
            {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {searchLoading ? 'Searching…' : 'Search'}
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {complaint && (
            <ComplaintDetail complaint={complaint} onStatusUpdate={handleStatusUpdate} />
          )}
        </AnimatePresence>
      </div>

      {/* All Complaints */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All Complaints</h3>
            <span className="badge bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="text-xs border border-gray-200 dark:border-white/[0.08] rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30">
              <option value="all">All Status</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => loadAll()} disabled={loading} className="btn-ghost p-2" title="Refresh">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading && allComplaints.length === 0 ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-slate-800/50 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <ClipboardList className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No complaints found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c, i) => {
              const cfg = statusConfig[c.status] || statusConfig.Pending;
              const StatusIcon = cfg.icon;
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-white/[0.04] bg-white/60 dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:border-primary-200 dark:hover:border-primary-500/20 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center shrink-0">
                    <StatusIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{c.complaint_id}</span>
                      <span className={`badge border text-[10px] ${cfg.color}`}>{c.status}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{c.student_name} · Room {c.room_number}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{c.description}</p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className={`text-xs ${priorityConfig[c.priority] || ''}`}>{c.priority}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{c.category}</p>
                  </div>
                  {/* Quick status update */}
                  <select
                    value={c.status}
                    onChange={async (e) => {
                      const newSt = e.target.value;
                      try {
                        await updateComplaintStatus(c.complaint_id, newSt);
                        handleStatusUpdate(c.complaint_id, newSt);
                        notify.success(`Status → ${newSt}`);
                      } catch {
                        notify.error('Update failed');
                      }
                    }}
                    onClick={e => e.stopPropagation()}
                    className="text-[10px] border border-gray-200 dark:border-white/[0.08] rounded-lg px-1.5 py-1 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500/30 shrink-0 hidden sm:block"
                  >
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors shrink-0" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
