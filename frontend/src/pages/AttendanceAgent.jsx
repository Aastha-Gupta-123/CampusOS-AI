import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, BookOpen, GraduationCap, AlertTriangle, CheckCircle2, Send, Bot, User, Sparkles, Loader2, PieChart, TrendingUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import { attendanceChat, getAttendanceSummary } from '../services/api';

export default function AttendanceAgent() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "👋 Hi! I'm your Attendance Assistant. Ask me about your attendance, exam eligibility, or subject-wise performance!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    getAttendanceSummary()
      .then(setSummary)
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const res = await attendanceChat(question);
      setMessages(prev => [...prev, { role: 'bot', text: res.message || 'No response' }]);
      if (res.data?.summary) setSummary(res.data.summary);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Attendance Agent"
        subtitle="Track your academic attendance, check exam eligibility, and analyze subject-wise performance"
        gradient="from-emerald-500 to-teal-600"
      />

      {/* Stats Cards */}
      {summary && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-emerald-500" />
              </div>
              <span className={`badge ${summary.eligible ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
                {summary.eligible ? 'Eligible' : 'Shortage'}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.overall_attendance}%</p>
            <p className="text-xs text-gray-400 mt-1">Overall Attendance</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_subjects}</p>
            <p className="text-xs text-gray-400 mt-1">Subjects</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.subjects?.filter(s => s.status === 'excellent').length || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Excellent (≥90%)</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.defaulters?.length || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Shortage Subjects</p>
          </div>
        </motion.div>
      )}

      {/* Subject Breakdown */}
      {summary?.subjects && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-gray-400" /> Subject-wise Attendance
          </h3>
          <div className="space-y-3">
            {summary.subjects.map((subject, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{subject.name}</span>
                    <span className={`text-xs font-semibold ${subject.status === 'excellent' ? 'text-emerald-500' : subject.status === 'good' ? 'text-blue-500' : 'text-red-500'}`}>
                      {subject.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(subject.percentage, 100)}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full rounded-full ${subject.status === 'excellent' ? 'bg-emerald-500' : subject.status === 'good' ? 'bg-blue-500' : 'bg-red-500'}`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{subject.attended}/{subject.total} classes · {subject.faculty}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat Interface */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ask About Attendance</h3>
          <p className="text-xs text-gray-400 mt-0.5">Ask questions like "What's my overall attendance?" or "Am I eligible for exams?"</p>
        </div>
        <ChatWindow messages={messages} chatEndRef={chatEndRef} loading={loading} />
        {loading && <TypingIndicator />}
        <MessageInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Ask about your attendance..."
          loading={loading}
        />
      </div>

      {/* Suggested Queries */}
      <div className="flex flex-wrap gap-2">
        {[
          "What's my overall attendance?",
          "Am I eligible for exams?",
          "How is my attendance in Machine Learning?",
          "Which subjects have shortage?",
        ].map((q, i) => (
          <button
            key={i}
            onClick={() => { setInput(q); }}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 transition-colors border border-gray-200 dark:border-white/[0.08]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}