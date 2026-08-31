'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, BarChart, Target, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Analysis, AnalysisType } from '@/types';
import ProfileSubmission from '@/components/Dashboard/ProfileSubmission';
import CircularProgress from '@/components/Analysis/CircularProgress';
import ComparisonChart from '@/components/Analytics/ComparisonChart';
import ProgressionTrend from '@/components/Analytics/ProgressionTrend';
import FloatingChat from '@/components/Chatbot/FloatingChat';
import UserProfileMenu from '@/components/Profile/UserProfileMenu';
import { AnalysisGridSkeleton } from '@/components/common/SkeletonLoading';
import TokenInfoModal from '@/components/Profile/TokenInfoModal';
import ProfileCompletionBanner from '@/components/Profile/ProfileCompletionBanner';


export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  // ==========================
  // TOKEN BALANCE
  // ==========================
  const [tokenBalance, setTokenBalance] = useState({ tokens: 100, resetDate: '' });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadAnalyses();
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

  const loadAnalyses = async () => {
    try {
      const data = await api.getAnalyses();
      setAnalyses(data);
    } catch (error) {
      console.error('Failed to load analyses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = () => {
    loadAnalyses();
  };

  // Get latest per type
  const getLatestAnalyses = () => {
    const latestByType: Record<string, Analysis> = {};
    analyses.forEach((analysis) => {
      const existing = latestByType[analysis.analysisType];
      if (!existing || new Date(analysis.createdAt) > new Date(existing.createdAt)) {
        latestByType[analysis.analysisType] = analysis;
      }
    });
    return Object.values(latestByType);
  };

  const latestAnalyses = getLatestAnalyses();

  // Display order
  const DESIRED_ORDER = [
    AnalysisType.GITHUB,
    AnalysisType.LINKEDIN,
    AnalysisType.RESUME
  ];

  const sortedLatestAnalyses = latestAnalyses.sort((a, b) => {
    return DESIRED_ORDER.indexOf(a.analysisType) - DESIRED_ORDER.indexOf(b.analysisType);
  });

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
            
            {/* Logo & Welcome */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
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

              {/* TOKEN DISPLAY */}
              <button
                onClick={() => setShowTokenInfo(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">{tokenBalance.tokens} tokens</span>
              </button>

              {/* JD MATCHER BUTTON */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/jd-matcher')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                <span className="hidden sm:inline">JD Matcher</span>
              </motion.button>

              {/* REPLACED LOGOUT BUTTON WITH JUST PROFILE MENU */}
              <UserProfileMenu />
            </div>
          </div>
        </motion.div>
        <ProfileCompletionBanner />
        {/* SUBMISSION SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <ProfileSubmission onAnalysisComplete={handleAnalysisComplete} />
        </motion.div>

        {/* ANALYSIS RESULTS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <BarChart className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl md:text-4xl font-bold">Latest Scores</h2>
          </div>

          
          {loading ? (
            <AnalysisGridSkeleton />
          ) : latestAnalyses.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <BarChart className="w-20 h-20 mx-auto mb-6 text-gray-500" />
              <h3 className="text-2xl font-bold mb-3">No Analysis Yet</h3>
              <p className="text-gray-400 text-lg">
                Submit your profiles above to get started with AI-powered insights
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {sortedLatestAnalyses.map((analysis) => (
                <CircularProgress key={analysis.id} analysis={analysis} />
              ))}
            </div>
          )}
        </motion.div>

        {/* ANALYTICS */}
        {!loading && analyses.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <ComparisonChart analyses={analyses} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ProgressionTrend analyses={analyses} />
            </motion.div>
          </>
        )}
      </div>

      <FloatingChat />
      <TokenInfoModal
        isOpen={showTokenInfo}
        onClose={() => setShowTokenInfo(false)}
        tokenBalance={tokenBalance}
      />
    </div>
  );
}
