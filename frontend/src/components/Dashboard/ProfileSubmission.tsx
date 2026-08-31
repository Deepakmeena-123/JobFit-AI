'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, FileUp, Loader2, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { Analysis } from '@/types';

interface ProfileSubmissionProps {
  onAnalysisComplete: (analyses: Analysis[]) => void;
}

export default function ProfileSubmission({ onAnalysisComplete }: ProfileSubmissionProps) {
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      const analyses: Analysis[] = [];

      if (githubUrl) {
        const githubAnalysis = await api.submitGithub(githubUrl);
        analyses.push(githubAnalysis);
      }

      if (linkedinUrl) {
        const linkedinAnalysis = await api.submitLinkedIn(linkedinUrl);
        analyses.push(linkedinAnalysis);
      }

      if (resumeFile) {
        const resumeAnalysis = await api.submitResume(resumeFile);
        analyses.push(resumeAnalysis);
      }

      onAnalysisComplete(analyses);
      window.dispatchEvent(new Event('refreshTokens'));
      setGithubUrl('');
      setLinkedinUrl('');
      setResumeFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze profiles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-3 mb-8">
        <Upload className="w-8 h-8 text-purple-400" />
        <h2 className="text-3xl font-bold">Submit Your Profiles</h2>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-lg font-semibold">
            <Github className="w-6 h-6 text-purple-400" />
            GitHub
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username"
            className="glass-input"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-lg font-semibold">
            <Linkedin className="w-6 h-6 text-blue-400" />
            LinkedIn
          </label>
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className="glass-input"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-lg font-semibold">
            <FileUp className="w-6 h-6 text-pink-400" />
            Resume
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            className="glass-input text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
          />
          {resumeFile && (
            <p className="text-xs text-gray-400">
              {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || (!githubUrl && !linkedinUrl && !resumeFile)}
        className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Analyzing Your Profiles...</span>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6" />
            <span>Analyze Profiles</span>
          </>
        )}
      </button>
    </div>
  );
}