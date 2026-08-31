'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Sparkles, History, Briefcase, Building2, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { JDMatchResponse } from '@/types';
import JDMatcherForm from '@/components/JDMatcher/JDMatcherForm';
import JDMatchResult from '@/components/JDMatcher/JDMatchResult';
import FloatingChat from '@/components/Chatbot/FloatingChat';
import UserProfileMenu from '@/components/Profile/UserProfileMenu';
import TokenInfoModal from '@/components/Profile/TokenInfoModal';

export default function JDMatcherPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [matches, setMatches] = useState<JDMatchResponse[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<JDMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  // ==============================
  // 🔥 TOKEN BALANCE STATE ADDED
  // ==============================
  const [tokenBalance, setTokenBalance] = useState({ tokens: 100, resetDate: '' });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadMatches();
  }, []);

  useEffect(() => {
    loadTokenBalance();
  }, []);

  useEffect(() => {
    const handleRefreshTokens = async () => {
      await loadTokenBalance();
    };

    window.addEventListener('refreshTokens', handleRefreshTokens);
    return () => window.removeEventListener('refreshTokens', handleRefreshTokens);
  }, []);

  const loadTokenBalance = async () => {
    try {
      const data = await api.getTokenBalance();
      setTokenBalance(data);
    } catch (error) {
      console.error('Failed to load tokens');
    }
  };

  const loadMatches = async () => {
    try {
      const data = await api.getJDMatches();
      const recentMatches = data
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);
      setMatches(recentMatches);
    } catch (error) {
      console.error('Failed to load JD matches', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleMatchComplete = (newMatch: JDMatchResponse) => {
    setMatches([newMatch, ...matches].slice(0, 6));
    setSelectedMatch(newMatch);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    if (score >= 40) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-8">
            
            {/* Logo */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-12 h-12 text-purple-400" />
              </motion.div>

              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  NextStep AI
                </h1>
                <p className="text-gray-400 mt-1">Welcome back, {user?.fullName}!</p>
              </div>
            </div>

            {/* RIGHT SIDE BUTTONS */}
            <div className="flex gap-3 items-center">

              {/* 🔥 TOKEN DISPLAY - ADDED */}
              <button
                onClick={() => setShowTokenInfo(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">{tokenBalance.tokens} tokens</span>
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="btn-secondary py-2 px-4"
              >
                Dashboard
              </button>

              <UserProfileMenu />
            </div>
          </div>
        </motion.div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <JDMatcherForm onMatchComplete={handleMatchComplete} />
        </motion.div>

        {/* HISTORY */}
        {!loading && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <History className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-bold">Previous Matches</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <motion.div
                  key={match.id}
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => setSelectedMatch(match)}
                  className="glass-card p-6 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-xl font-bold mb-1 truncate">
                        {match.jobTitle || 'Job Match Analysis'}
                      </h3>
                      {match.companyName && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{match.companyName}</span>
                        </div>
                      )}
                    </div>

                    <div 
                      className={`flex-shrink-0 w-20 h-20 rounded-xl ${getScoreBgColor(match.overallMatchScore)} flex items-center justify-center`}
                    >
                      <div className="flex items-end justify-center gap-0.5 leading-none">
                        <span className={`text-3xl font-bold leading-none ${getScoreColor(match.overallMatchScore)}`}>
                          {match.overallMatchScore}
                        </span>
                        <span className={`text-sm leading-none ${getScoreColor(match.overallMatchScore)}`}>%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className={`text-sm font-semibold ${getScoreColor(match.overallMatchScore)}`}>
                      {match.overallMatchScore >= 80 ? 'Excellent Match' :
                       match.overallMatchScore >= 60 ? 'Good Match' :
                       match.overallMatchScore >= 40 ? 'Fair Match' : 'Poor Match'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    {new Date(match.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* MATCH RESULT MODAL */}
      <AnimatePresence>
        {selectedMatch && (
          <JDMatchResult
            match={selectedMatch}
            onClose={() => setSelectedMatch(null)}
          />
        )}
      </AnimatePresence>

      <FloatingChat />
      <TokenInfoModal
        isOpen={showTokenInfo}
        onClose={() => setShowTokenInfo(false)}
        tokenBalance={tokenBalance}
      />
    </div>
  );
}
