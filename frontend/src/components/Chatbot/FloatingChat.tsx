'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot } from 'lucide-react';
import { api } from '@/lib/api';
import { ChatMessage as ChatMessageType } from '@/types';
import MarkdownContent from '@/components/common/MarkdownContent';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState('CAREER_GUIDANCE');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) loadChatHistory();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await api.getChatHistory();
      setMessages(history);
    } catch {
      console.error('Failed to load chat history');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage({ message: userMessage, messageType });
      setMessages((prev) => [...prev, response]);
    } catch {
      console.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-2xl z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] glass-card z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Bot className="w-8 h-8" />
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-xs opacity-90">Ask me anything</p>
                </div>
              </div>

              <div className="flex gap-2">
                {['CAREER_GUIDANCE', 'CODING_HELP', 'PROFILE_IMPROVEMENT'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setMessageType(type)}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      messageType === type
                        ? 'bg-white text-purple-700 font-semibold'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {type.split('_')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="bg-purple-600 text-white rounded-2xl px-4 py-2 max-w-[80%]">
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white rounded-2xl px-4 py-2 max-w-[80%]">
                      <MarkdownContent content={msg.response} className="text-sm" />
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading}
                  className="bg-purple-600 text-white rounded-xl p-2 hover:bg-purple-700"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
