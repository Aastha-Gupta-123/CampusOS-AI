import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, MapPin, User, ChevronRight, GraduationCap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import { timetableChat, getTimetableSummary } from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableAgent() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "📚 Hi! I'm your Timetable Assistant. Ask me about your class schedule, today's classes, or any day's timetable!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    getTimetableSummary()
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
      const res = await timetableChat(question);
      setMessages(prev => [...prev, { role: 'bot', text: res.message || 'No response' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Calendar}
        title="Timetable Agent"
        subtitle="View your class schedule, check today's timetable, and plan your academic week"
        gradient="from-violet-500 to-purple-600"
      />

      {/* Summary Cards */}
      {summary && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5 text-violet-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.class || 'N/A'}</p>
            <p className="text-xs text-gray-400 mt-1">Class</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-violet-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_classes_per_week || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Classes/Week</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-violet-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_days || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Active Days</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-3">
              <User className="w-5 h-5 text-violet-500" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{summary.advisor || 'N/A'}</p>
            <p className="text-xs text-gray-400 mt-1">Class Advisor</p>
          </div>
        </motion.div>
      )}

      {/* Day Cards */}
      {summary?.days && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" /> Weekly Schedule Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {summary.days.map((day, i) => (
              <button
                key={day}
                onClick={() => setInput(`Show me my ${day} timetable`)}
                className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] hover:border-violet-200 dark:hover:border-violet-500/30 hover:bg-violet-50 dark:hover:bg-violet-500/5 transition-all text-center group"
              >
                <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400">{day.slice(0, 3)}</p>
                <p className="text-[10px] text-gray-400 mt-1">Click to view</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat Interface */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ask About Timetable</h3>
          <p className="text-xs text-gray-400 mt-0.5">Ask questions like "What's my timetable today?" or "Show Monday's classes"</p>
        </div>
        <ChatWindow messages={messages} chatEndRef={chatEndRef} loading={loading} />
        {loading && <TypingIndicator />}
        <MessageInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Ask about your timetable..."
          loading={loading}
        />
      </div>

      {/* Suggested Queries */}
      <div className="flex flex-wrap gap-2">
        {[
          "What's my timetable today?",
          "Show Monday timetable",
          "What is my first class tomorrow?",
          "How many classes on Friday?",
        ].map((q, i) => (
          <button
            key={i}
            onClick={() => setInput(q)}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 transition-colors border border-gray-200 dark:border-white/[0.08]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}