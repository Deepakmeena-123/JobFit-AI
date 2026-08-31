'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Briefcase, Building2, Target, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { JDMatchResponse } from '@/types';

interface JDMatcherFormProps {
  onMatchComplete: (match: JDMatchResponse) => void;
}

export default function JDMatcherForm({ onMatchComplete }: JDMatcherFormProps) {
  const [jdInputMode, setJdInputMode] = useState<'text' | 'file'>('text');
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (jdInputMode === 'text' && !jdText.trim()) {
      setError('Please enter job description text');
      return;
    }
    if (jdInputMode === 'file' && !jdFile) {
      setError('Please upload job description file');
      return;
    }
    if (!resumeFile) {
      setError('Please upload your resume');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let response: JDMatchResponse;

      if (jdInputMode === 'text') {
        response = await api.analyzeJDMatchText(jdText, resumeFile, jobTitle, companyName);
      } else {
        response = await api.analyzeJDMatchFile(jdFile!, resumeFile, jobTitle, companyName);
      }

      onMatchComplete(response);
      window.dispatchEvent(new Event('refreshTokens'));
      // Reset form
      setJdText('');
      setJdFile(null);
      setResumeFile(null);
      setJobTitle('');
      setCompanyName('');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze JD match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-3 mb-8">
        <Target className="w-8 h-8 text-purple-400" />
        <h2 className="text-3xl font-bold">Job Description Matcher</h2>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Optional Job Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-lg font-semibold mb-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              Job Title (Optional)
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="glass-input"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-lg font-semibold mb-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Company Name (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Google"
              className="glass-input"
            />
          </div>
        </div>

        {/* JD Input Mode Toggle */}
        <div>
          <label className="block text-lg font-semibold mb-3">Job Description Input Method</label>
          <div className="flex gap-4">
            <button
              onClick={() => setJdInputMode('text')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                jdInputMode === 'text'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => setJdInputMode('file')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                jdInputMode === 'file'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Upload File
            </button>
          </div>
        </div>

        {/* JD Text Input */}
        {jdInputMode === 'text' && (
          <div>
            <label className="flex items-center gap-2 text-lg font-semibold mb-3">
              <FileText className="w-6 h-6 text-purple-400" />
              Job Description Text
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the complete job description here..."
              className="glass-input min-h-[200px] resize-y font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              Include all details: responsibilities, requirements, qualifications, etc.
            </p>
          </div>
        )}

        {/* JD File Upload */}
        {jdInputMode === 'file' && (
          <div>
            <label className="flex items-center gap-2 text-lg font-semibold mb-3">
              <FileText className="w-6 h-6 text-purple-400" />
              Job Description File
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setJdFile(e.target.files?.[0] || null)}
              className="glass-input text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
            />
            {jdFile && (
              <p className="text-xs text-gray-400 mt-2">
                {jdFile.name} ({(jdFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        {/* Resume Upload */}
        <div>
          <label className="flex items-center gap-2 text-lg font-semibold mb-3">
            <Upload className="w-6 h-6 text-pink-400" />
            Your Resume
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            className="glass-input text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-600 file:text-white hover:file:bg-pink-700 file:cursor-pointer"
          />
          {resumeFile && (
            <p className="text-xs text-gray-400 mt-2">
              {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || (!jdText && !jdFile) || !resumeFile}
          className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Analyzing Match...</span>
            </>
          ) : (
            <>
              <Target className="w-6 h-6" />
              <span>Analyze Resume Match</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}