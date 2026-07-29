import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Compass } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import { navigationChat } from '../services/api';
import notify from '../services/toast';

const suggestions = [
  'Where is the Library?',
  'Take me to the Placement Cell',
  'How do I reach the Canteen?',
  'Guide me to the Innovation Center',
  'Where is the Admin Office?',
  'Find the Sports Complex',
  'Where is the AI Lab?',
  'How to reach Boys Hostel?',
];

export default function NavigationAgent() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [searchParams]          = useSearchParams();

  const handleSend = async (text) => {
    setMessages(prev => [...prev, { from: 'user', text }]);
    setLoading(true);
    setTyping(true);
    try {
      const data = await navigationChat(text);
      await new Promise(r => setTimeout(r, 400));
      const botText = data.answer || data.message || "I couldn't find that location. Please try a different name.";
      setMessages(prev => [...prev, { from: 'bot', text: botText }]);
    } catch {
      notify.error('Backend offline. Please start the server.');
      setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, I encountered an error. Please make sure the backend server is running.' }]);
    } finally {
      setTyping(false);
      setLoading(false);
    }
  };

  // Auto-send if navigated from map with ?q=
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) handleSend(q);
  }, []); // eslint-disable-line

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Agent Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 mb-4 shrink-0">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
            <Compass className="w-6 h-6 text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-base font-bold text-white">Campus Navigation AI</h2>
              <span className="badge bg-white/20 text-white border-white/20 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
              </span>
            </div>
            <p className="text-blue-100/70 text-xs">Ask me about any campus location and I'll guide you there with step-by-step directions.</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="text-center"><p className="text-lg font-bold text-white">40+</p><p className="text-[10px] text-blue-200/70">Locations</p></div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center"><p className="text-lg font-bold text-white">&lt;1s</p><p className="text-[10px] text-blue-200/70">Response</p></div>
          </div>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col min-h-0">
        <ChatWindow messages={messages} typing={typing} suggestions={suggestions}
          onSuggestionClick={handleSend} agentColor="from-blue-500 to-indigo-600" />
        <MessageInput onSend={handleSend} loading={loading}
          placeholder="Ask about a campus location… e.g. 'Where is the Library?'" />
      </div>
    </motion.div>
  );
}
