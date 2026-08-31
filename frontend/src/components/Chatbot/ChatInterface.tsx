'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot } from 'lucide-react';
import { api } from '@/lib/api';
import { ChatMessage as ChatMessageType } from '@/types';
import MarkdownContent from '@/components/common/MarkdownContent';

interface ChatInterfaceProps {
  analysisContext: {
    type: string;
    score: number;
    analysis: string;
    suggestions: string;
  };
  onClose: () => void;
}

export default function ChatInterface({ analysisContext, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState('PROFILE_IMPROVEMENT');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await api.getChatHistory();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage({
        message: userMessage,
        messageType,     // ✅ ONLY these two fields
      });

      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[200] flex justify-center items-center p-6"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="w-full max-w-3xl h-[600px] glass-card rounded-2xl flex flex-col relative"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8" />
              <div>
                <h3 className="font-bold">AI Assistant</h3>
                <p className="text-xs opacity-90">
                  {analysisContext.type} | Score: {analysisContext.score}%
                </p>
              </div>
            </div>

            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start a conversation!</p>
              </div>
            )}

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

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask something..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading}
                className="bg-purple-600 text-white rounded-xl p-2 hover:bg-purple-700 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
