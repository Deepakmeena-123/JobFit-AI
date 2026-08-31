'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function ProfileCompletionBanner() {
  const { user } = useAuthStore();
  const [showBanner, setShowBanner] = useState(false);
  const [temporarilyDismissed, setTemporarilyDismissed] = useState(false);

  useEffect(() => {
    // Check if profile is incomplete
    const isIncomplete = !user?.experience || !user?.designation;
    
    // Show banner if profile is incomplete AND not temporarily dismissed
    setShowBanner(isIncomplete && !temporarilyDismissed);
  }, [user?.experience, user?.designation, temporarilyDismissed]);

  const handleDismiss = () => {
    // Temporarily dismiss - will show again on reload if still incomplete
    setTemporarilyDismissed(true);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/50 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Complete Your Profile for Better Analysis</h3>
            <p className="text-sm text-gray-300 mb-2">
              Add your experience, job role, and company details to get more personalized insights and recommendations.
            </p>
            <button
              onClick={() => {
                window.dispatchEvent(new Event('openProfileEdit'));
              }}
              className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              Complete Profile →
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            title="Dismiss for now"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}