'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Analysis, AnalysisType } from '@/types';
import { useState } from 'react';
import { X, CheckCircle, XCircle, MessageCircle, Download } from 'lucide-react';
import ChatInterface from '../Chatbot/ChatInterface';
import { exportAnalysisToPDF } from '@/lib/pdfExport';
import MarkdownContent from '@/components/common/MarkdownContent';

interface CircularProgressProps {
  analysis: Analysis;
}

export default function CircularProgress({ analysis }: CircularProgressProps) {
  const [expanded, setExpanded] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const getPathColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getTypeLabel = (type: AnalysisType) => {
    const labels = {
      [AnalysisType.GITHUB]: 'GitHub',
      [AnalysisType.LINKEDIN]: 'LinkedIn',
      [AnalysisType.RESUME]: 'Resume',
    };
    return labels[type] || type;
  };

  const getGradient = (type: AnalysisType) => {
    const gradients = {
      [AnalysisType.GITHUB]: 'from-purple-600 to-purple-400',
      [AnalysisType.LINKEDIN]: 'from-blue-600 to-blue-400',
      [AnalysisType.RESUME]: 'from-pink-600 to-pink-400',
    };
    return gradients[type] || 'from-purple-600 to-pink-600';
  };

  const formatAsPoints = (text: string) => {
    return text
      .split(/\.\s+|\n+|\d+\.\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setExpanded(true)}
        className="glass-card p-8 cursor-pointer"
      >
        <div className={`bg-gradient-to-br ${getGradient(analysis.analysisType)} rounded-xl p-4 mb-6`}>
          <h3 className="text-2xl font-bold text-center text-white">
            {getTypeLabel(analysis.analysisType)}
          </h3>
        </div>

        <div className="w-48 h-48 mx-auto mb-6">
          <CircularProgressbar
            value={analysis.overallScore}
            text={`${analysis.overallScore}%`}
            styles={buildStyles({
              textSize: '24px',
              pathColor: getPathColor(analysis.overallScore),
              textColor: '#fff',
              trailColor: 'rgba(255, 255, 255, 0.1)',
              pathTransitionDuration: 1.5,
            })}
          />
        </div>

        <p className="text-center text-gray-400">Click for detailed analysis</p>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] overflow-y-auto"
            onClick={() => {
              setExpanded(false);
              setShowChat(false);
            }}
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
                        {getTypeLabel(analysis.analysisType)} Analysis
                      </h2>
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold">
                          Overall Score:{' '}
                          <span
                            className={
                              analysis.overallScore >= 80
                                ? 'text-green-500'
                                : analysis.overallScore >= 60
                                  ? 'text-yellow-500'
                                  : analysis.overallScore >= 40
                                    ? 'text-orange-500'
                                    : 'text-red-500'
                            }
                          >
                            {analysis.overallScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
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
                        onClick={() => {
                          setExpanded(false);
                          setShowChat(false);
                        }}
                        className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <X className="w-7 h-7" />
                      </button>
                    </div>
                  </div>

                  {/* CATEGORY SCORES */}
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold mb-6">Category Breakdown</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {analysis.microCategories.map((category) => (
                        <div key={category.id} className="solid-card p-4">
                          <div className="w-20 h-20 mx-auto mb-3">
                            <CircularProgressbar
                              value={category.categoryScore}
                              text={`${category.categoryScore}`}
                              styles={buildStyles({
                                textSize: '28px',
                                pathColor: getPathColor(category.categoryScore),
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

                  {/* BULLET POINT ANALYSIS */}
                  <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="solid-card p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-7 h-7 text-green-500 flex-shrink-0" />
                        <h3 className="text-2xl font-bold">Analysis Findings</h3>
                      </div>
                      <div className="text-gray-300 space-y-3">
                        {formatAsPoints(analysis.analysisText).map((point, idx) => (
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
                        <XCircle className="w-7 h-7 text-orange-500 flex-shrink-0" />
                        <h3 className="text-2xl font-bold">Improvement Suggestions</h3>
                      </div>
                      <div className="text-gray-300 space-y-3">
                        {formatAsPoints(analysis.suggestions).map((point, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="text-orange-400 mt-1 text-lg">•</span>
                            <div className="leading-relaxed">
                              <MarkdownContent content={point} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ==================================== */}
                  {/* 📄 EXPORT PDF BUTTON — AT THE BOTTOM */}
                  {/* ==================================== */}
                  <div className="flex justify-center mt-10 mb-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportAnalysisToPDF(analysis);
                      }}
                      className="btn-secondary py-3 px-5 flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Export PDF</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <ChatInterface
            analysisContext={{
              type: getTypeLabel(analysis.analysisType),
              score: analysis.overallScore,
              analysis: analysis.analysisText,
              suggestions: analysis.suggestions,
            }}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
