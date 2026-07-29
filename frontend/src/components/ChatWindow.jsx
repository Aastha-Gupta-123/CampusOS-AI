import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Sparkles, User, Lightbulb } from 'lucide-react';
import TypingIndicator from './TypingIndicator';

const msgVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 28 } },
};

function formatTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow({ messages, typing, suggestions, onSuggestionClick, agentColor = 'from-primary-500 to-secondary-600' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, typing]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-16 px-4"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agentColor} flex items-center justify-center shadow-xl shadow-primary-500/25 mb-5`}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">How can I help you today?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                Ask me anything or pick a suggestion below to get started.
              </p>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                variants={msgVariants}
                initial="hidden"
                animate="visible"
                className={`flex gap-3 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.from === 'bot' && (
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${agentColor} flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20 mt-0.5`}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`max-w-[78%] lg:max-w-[68%] ${msg.from === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={msg.from === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                    {msg.from === 'bot' ? (
                      <div className="prose-chat text-sm leading-relaxed">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                            code: ({ inline, children }) =>
                              inline
                                ? <code className="bg-gray-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                                : <pre className="bg-gray-900 dark:bg-black/60 rounded-xl p-3 overflow-x-auto text-xs border border-gray-700/50 my-2"><code>{children}</code></pre>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
                    {msg.from === 'user' ? 'You' : 'CampusMate AI'} · {formatTime()}
                  </span>
                </div>

                {msg.from === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center shrink-0 shadow-md mt-0.5">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              key="typing"
              variants={msgVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-3 justify-start"
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${agentColor} flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20`}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="chat-bubble-bot">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestion chips */}
      <AnimatePresence>
        {suggestions && suggestions.length > 0 && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="px-4 pb-4"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Try asking
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSuggestionClick(s)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium
                             bg-white dark:bg-slate-800/60
                             border border-gray-200 dark:border-white/[0.07]
                             text-gray-700 dark:text-gray-300
                             hover:border-primary-300 dark:hover:border-primary-500/40
                             hover:text-primary-600 dark:hover:text-primary-400
                             hover:bg-primary-50 dark:hover:bg-primary-500/10
                             shadow-sm transition-all duration-200"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
