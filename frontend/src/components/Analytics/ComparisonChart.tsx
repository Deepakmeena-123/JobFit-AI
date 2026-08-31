'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Analysis, AnalysisType } from '@/types';
import { BarChart3 } from 'lucide-react';

interface ComparisonChartProps {
  analyses: Analysis[];
}

export default function ComparisonChart({ analyses }: ComparisonChartProps) {
  // Get latest score for each type
  const getLatestScores = () => {
    const latestByType: Record<string, number> = {};

    Object.values(AnalysisType).forEach(type => {
      const typeAnalyses = analyses
        .filter(a => a.analysisType === type)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      if (typeAnalyses.length > 0) {
        latestByType[type] = typeAnalyses[0].overallScore;
      }
    });

    return [
      {
        name: 'GitHub',
        score: latestByType[AnalysisType.GITHUB] || 0,
        fill: '#a855f7',
      },
      {
        name: 'LinkedIn',
        score: latestByType[AnalysisType.LINKEDIN] || 0,
        fill: '#3b82f6',
      },
      {
        name: 'Resume',
        score: latestByType[AnalysisType.RESUME] || 0,
        fill: '#ec4899',
      },
    ].filter(item => item.score > 0);
  };

  const data = getLatestScores();

  if (data.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="solid-card p-4">
          <p className="font-semibold mb-2">{payload[0].payload.name}</p>
          <p className="text-purple-400 font-bold text-lg">
            Score: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  const averageScore = Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold">Current Score Comparison</h3>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Average Score</p>
          <p className="text-3xl font-bold text-purple-400">{averageScore}%</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af"
            style={{ fontSize: '14px' }}
          />
          <YAxis 
            domain={[0, 100]}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="score" 
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div 
              className="w-full h-2 rounded-full mb-2"
              style={{ 
                background: `linear-gradient(to right, ${item.fill}, ${item.fill}88)`,
                width: `${item.score}%`,
                margin: '0 auto'
              }}
            />
            <p className="text-sm text-gray-400">{item.name}</p>
            <p className="text-xl font-bold">{item.score}%</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}