'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, RefreshCw, Info } from 'lucide-react';

interface TokenInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenBalance: { tokens: number; resetDate: string };
}

export default function TokenInfoModal({ isOpen, onClose, tokenBalance }: TokenInfoModalProps) {
  const resetDate = new Date(tokenBalance.resetDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[200] flex justify-center items-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-md glass-card rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Token Balance</h3>
                    <p className="text-gray-400 text-sm">Analysis Credits</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Balance */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-2">Available Tokens</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-5xl font-bold text-yellow-400">
                      {tokenBalance.tokens}
                    </span>
                    <span className="text-2xl text-gray-400">/</span>
                    <span className="text-2xl text-gray-400">100</span>
                  </div>
                </div>
              </div>

              {/* Info Sections */}
              <div className="space-y-4 mb-6">
                {/* What are tokens */}
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">What are tokens?</h4>
                    <p className="text-sm text-gray-300">
                      Tokens are credits used for AI-powered analyses. Each analysis consumes tokens based on complexity.
                    </p>
                  </div>
                </div>

                {/* Token costs */}
                <div className="flex gap-3">
                  <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Token Costs</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Profile Analysis (GitHub/LinkedIn/Resume): <span className="text-yellow-400 font-semibold">1 token</span></li>
                      <li>• JD Matcher Analysis: <span className="text-yellow-400 font-semibold">2 tokens</span></li>
                      <li>• Chat Messages: <span className="text-green-400 font-semibold">Free</span></li>
                    </ul>
                  </div>
                </div>

                {/* Reset info */}
                <div className="flex gap-3">
                  <RefreshCw className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Monthly Reset</h4>
                    <p className="text-sm text-gray-300">
                      Your tokens automatically refresh to <span className="text-yellow-400 font-semibold">100</span> every month.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Next reset: <span className="text-purple-400 font-semibold">{resetDate}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-full btn-primary"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}