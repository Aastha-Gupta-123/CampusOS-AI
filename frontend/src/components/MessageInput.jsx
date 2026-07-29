import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Mic } from 'lucide-react';

export default function MessageInput({ onSend, loading, placeholder }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 140) + 'px';
    }
  };

  const canSend = text.trim().length > 0 && !loading;

  return (
    <div className="border-t border-gray-200/50 dark:border-white/[0.05] bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2 p-2 rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-slate-800/60 shadow-lg shadow-gray-200/30 dark:shadow-black/20 focus-within:border-primary-400 dark:focus-within:border-primary-500/50 focus-within:shadow-primary-500/10 transition-all duration-200">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none min-h-[44px] max-h-[140px] leading-relaxed"
            placeholder={placeholder || 'Type your message… (Enter to send, Shift+Enter for new line)'}
            disabled={loading}
          />

          {/* Actions */}
          <div className="flex items-center gap-1.5 pb-1.5 pr-1">
            <button className="btn-ghost p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Voice input (coming soon)">
              <Mic className="w-4 h-4" />
            </button>

            <motion.button
              onClick={handleSubmit}
              disabled={!canSend}
              whileHover={canSend ? { scale: 1.05 } : {}}
              whileTap={canSend ? { scale: 0.95 } : {}}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
                canSend
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40'
                  : 'bg-gray-100 dark:bg-slate-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div key="send" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Send className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2">
          CampusMate AI · Responses may not always be accurate. Verify important information.
        </p>
      </div>
    </div>
  );
}
