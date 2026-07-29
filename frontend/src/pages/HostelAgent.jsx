import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import { hostelChat } from '../services/api';
import notify from '../services/toast';

const suggestions = [
  'WiFi is not working in my room',
  'Water leakage in bathroom',
  'No electricity since morning',
  'Broken ceiling fan',
  'Pest infestation in room',
  'Clogged drain in washroom',
];

export default function HostelAgent() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async (text) => {
    setMessages((prev) => [...prev, { from: 'user', text }]);
    setLoading(true);
    setTyping(true);
    try {
      const data = await hostelChat(text);
      await new Promise((r) => setTimeout(r, 600));
      setMessages((prev) => [...prev, {
        from: 'bot',
        text: data.answer || data.message || "Your complaint has been registered. We'll look into it shortly.",
      }]);
    } catch {
      notify.error('Backend offline. Please start the server.');
      setMessages((prev) => [...prev, {
        from: 'bot',
        text: 'Sorry, I encountered an error. Please make sure the backend server is running.',
      }]);
    } finally {
      setTyping(false);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-7rem)]"
    >
      {/* Agent Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 mb-4 shrink-0">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0"
          >
            <Building2 className="w-6 h-6 text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-base font-bold text-white">Hostel Complaint AI</h2>
              <span className="badge bg-white/20 text-white border-white/20 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
              </span>
            </div>
            <p className="text-emerald-100/70 text-xs">Describe your hostel issue — I'll classify it, assign priority, and generate a tracking ID.</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="text-center">
              <p className="text-lg font-bold text-white">AI</p>
              <p className="text-[10px] text-emerald-200/70">Classified</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">Auto</p>
              <p className="text-[10px] text-emerald-200/70">Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col min-h-0">
        <ChatWindow
          messages={messages}
          typing={typing}
          suggestions={suggestions}
          onSuggestionClick={handleSend}
          agentColor="from-emerald-500 to-teal-600"
        />
        <MessageInput
          onSend={handleSend}
          loading={loading}
          placeholder="Describe your hostel issue… e.g. 'WiFi not working in room 204'"
        />
      </div>
    </motion.div>
  );
}
