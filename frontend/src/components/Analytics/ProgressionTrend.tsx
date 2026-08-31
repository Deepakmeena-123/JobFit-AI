'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Analysis, AnalysisType } from '@/types';
import { Github, Linkedin, FileText, TrendingUp, Calendar } from 'lucide-react';

interface ProgressionTrendProps {
  analyses: Analysis[];
}

export default function ProgressionTrend({ analyses }: ProgressionTrendProps) {
  // Group analyses by type and sort by date
  const getProgressionData = (type: AnalysisType) => {
    return analyses
      .filter(a => a.analysisType === type)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((analysis, index) => ({
        submission: `#${index + 1}`,
        score: analysis.overallScore,
        date: new Date(analysis.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: new Date(analysis.createdAt).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        }),
      }));
  };

  const githubData = getProgressionData(AnalysisType.GITHUB);
  const linkedinData = getProgressionData(AnalysisType.LINKEDIN);
  const resumeData = getProgressionData(AnalysisType.RESUME);

  const hasData = githubData.length > 0 || linkedinData.length > 0 || resumeData.length > 0;

  if (!hasData) {
    return null;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="solid-card p-4">
          <p className="font-semibold mb-2">{payload[0].payload.fullDate}</p>
          <p className="text-purple-400 font-bold text-lg">
            Score: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = (data: any[], title: string, icon: any, color: string) => {
    if (data.length === 0) return null;

    const Icon = icon;
    const improvement = data.length > 1 
      ? data[data.length - 1].score - data[0].score 
      : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${color}`} />
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {improvement !== 0 && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                improvement > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <TrendingUp className={`w-4 h-4 ${improvement < 0 ? 'rotate-180' : ''}`} />
                <span className="text-sm font-semibold">
                  {improvement > 0 ? '+' : ''}{improvement}%
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{data.length} submission{data.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke={color.replace('text-', '#')} 
              strokeWidth={3}
              dot={{ fill: color.replace('text-', '#'), r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 flex justify-between text-sm">
          <div>
            <p className="text-gray-400">First Score</p>
            <p className="text-2xl font-bold">{data[0].score}%</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Latest Score</p>
            <p className="text-2xl font-bold">{data[data.length - 1].score}%</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="w-8 h-8 text-purple-400" />
        <h2 className="text-3xl md:text-4xl font-bold">Progress Over Time</h2>
      </div>

      <div className="grid gap-6">
        {renderChart(githubData, 'GitHub Progress', Github, 'text-purple-400')}
        {renderChart(linkedinData, 'LinkedIn Progress', Linkedin, 'text-blue-400')}
        {renderChart(resumeData, 'Resume Progress', FileText, 'text-pink-400')}
      </div>
    </div>
  );
}