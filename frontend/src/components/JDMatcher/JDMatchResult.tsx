'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import {
  Target, X, CheckCircle, XCircle, AlertTriangle,
  Briefcase, Building2, TrendingUp, TrendingDown, Download,
  MessageCircle
} from 'lucide-react';
import { JDMatchResponse } from '@/types';
import { exportJDMatchToPDF } from '@/lib/pdfExport';
import MarkdownContent from '@/components/common/MarkdownContent';

// ⬇️ NEW IMPORT ADDED
import ChatInterface from '@/components/Chatbot/ChatInterface';

interface JDMatchResultProps {
  match: JDMatchResponse;
  onClose: () => void;
}

export default function JDMatchResult({ match, onClose }: JDMatchResultProps) {

  // ⬇️ NEW STATE ADDED
  const [showChat, setShowChat] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return TrendingUp;
    if (score >= 60) return Target;
    return TrendingDown;
  };

  const formatAsPoints = (text: string) => {
    return text
      .split(/\.\s+|\n+|\d+\.\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
  };

  const formatCommaSeparatedList = (text: string) => {
    return text
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const ScoreIcon = getScoreIcon(match.overallMatchScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[100] overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen p-4 md:p-8">
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="max-w-7xl mx-auto solid-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 md:p-10">

            {/* HEADER */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
              <div className="flex-1">
                <h2 className="text-3xl md:text-5xl font-bold mb-3">
                  Job Description Match Results
                </h2>

                {match.jobTitle && (
                  <div className="flex items-center gap-2 text-xl text-gray-300 mb-2">
                    <Briefcase className="w-5 h-5 text-purple-400" />
                    <span>{match.jobTitle}</span>
                  </div>
                )}

                {match.companyName && (
                  <div className="flex items-center gap-2 text-lg text-gray-400">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span>{match.companyName}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">

                {/* ⬇️ Ask AI BUTTON UPDATED */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChat(true);
                  }}
                  className="btn-primary py-3 px-5 flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Ask AI</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>

            {/* OVERALL SCORE */}
            <div className="glass-card p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-48 h-48 flex-shrink-0">
                  <CircularProgressbar
                    value={match.overallMatchScore}
                    text={`${match.overallMatchScore}%`}
                    styles={buildStyles({
                      textSize: '24px',
                      pathColor: getScoreColor(match.overallMatchScore),
                      textColor: '#fff',
                      trailColor: 'rgba(255, 255, 255, 0.1)',
                      pathTransitionDuration: 1.5,
                    })}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <ScoreIcon
                      className="w-8 h-8"
                      style={{ color: getScoreColor(match.overallMatchScore) }}
                    />
                    <h3
                      className="text-3xl font-bold"
                      style={{ color: getScoreColor(match.overallMatchScore) }}
                    >
                      {getScoreLabel(match.overallMatchScore)}
                    </h3>
                  </div>
                  <p className="text-lg text-gray-300">
                    Your resume matches{' '}
                    <span className="font-bold">{match.overallMatchScore}%</span> of the job
                    requirements.
                    {match.overallMatchScore >= 70
                      ? ' You are a strong candidate!'
                      : ' Consider improving your resume with the suggestions below.'}
                  </p>
                </div>
              </div>
            </div>

            {/* CATEGORY SCORES */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6">Category Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {match.matchCategories.map((category) => (
                  <div key={category.id} className="solid-card p-4">
                    <div className="w-20 h-20 mx-auto mb-3">
                      <CircularProgressbar
                        value={category.categoryScore}
                        text={`${category.categoryScore}`}
                        styles={buildStyles({
                          textSize: '28px',
                          pathColor: getScoreColor(category.categoryScore),
                          textColor: '#fff',
                          trailColor: 'rgba(255, 255, 255, 0.1)',
                        })}
                      />
                    </div>
                    <p className="text-sm text-center font-semibold leading-tight mb-2">
                      {category.categoryName}
                    </p>
                    <p className="text-xs text-center text-gray-400">
                      {category.categoryDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Skills + Keywords */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {match.missingSkills && (
                <div className="solid-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-7 h-7 text-orange-500 flex-shrink-0" />
                    <h3 className="text-2xl font-bold">Missing Skills</h3>
                  </div>

                  <div className="space-y-2">
                    {formatCommaSeparatedList(match.missingSkills).map((skill, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-orange-400 mt-1">•</span>
                        <span className="text-gray-300">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {match.missingKeywords && (
                <div className="solid-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-7 h-7 text-yellow-500 flex-shrink-0" />
                    <h3 className="text-2xl font-bold">Missing Keywords</h3>
                  </div>

                  <div className="space-y-2">
                    {formatCommaSeparatedList(match.missingKeywords).map((keyword, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span className="text-gray-300">{keyword}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* MATCH ANALYSIS + SUGGESTIONS */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="solid-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-7 h-7 text-green-500 flex-shrink-0" />
                  <h3 className="text-2xl font-bold">Match Analysis</h3>
                </div>

                <div className="text-gray-300 space-y-3">
                  {formatAsPoints(match.matchAnalysis).map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1 text-lg">•</span>
                      <div className="leading-relaxed">
                        <MarkdownContent content={point} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="solid-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="w-7 h-7 text-purple-500 flex-shrink-0" />
                  <h3 className="text-2xl font-bold">Improvement Suggestions</h3>
                </div>

                <div className="text-gray-300 space-y-3">
                  {formatAsPoints(match.suggestions).map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-purple-400 mt-1 text-lg">•</span>
                      <div className="leading-relaxed">
                        <MarkdownContent content={point} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* EXPORT PDF BUTTON */}
            <div className="flex justify-center mt-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  exportJDMatchToPDF(match);
                }}
                className="btn-secondary py-3 px-6 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span>Export PDF</span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>

      {/* ⬇️ CHAT MODAL ADDED */}
      <AnimatePresence>
        {showChat && (
          <ChatInterface
            analysisContext={{
              type: `JD Match - ${match.jobTitle || 'Job Analysis'}`,
              score: match.overallMatchScore,
              analysis: match.matchAnalysis,
              suggestions: match.suggestions,
            }}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
}
