'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Trash2, Edit, X, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Briefcase, Building2, Clock } from 'lucide-react';

export default function UserProfileMenu() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ======================================================
  // 🔹 NEW EDIT PROFILE STATES
  // ======================================================
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    experience: user?.experience || '',
    designation: user?.designation || '',
    currentCompany: user?.currentCompany || ''
  });

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const response = await api.updateProfile(profileData);
      
      // Update auth store with new user data
      updateUser(response.user);
      
      setIsEditingProfile(false);
      
      // Show success toast (add react-hot-toast)
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // ======================================================
  // DELETE ACCOUNT STATES
  // ======================================================
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'otp'>('confirm');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Export a method to open profile edit
useEffect(() => {
  // Listen for custom event to open profile editor
  const handleOpenProfile = () => {
    setIsEditingProfile(true);
  };

  window.addEventListener('openProfileEdit', handleOpenProfile);
  return () => window.removeEventListener('openProfileEdit', handleOpenProfile);
}, []);


  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        experience: user.experience || '',
        designation: user.designation || '',
        currentCompany: user.currentCompany || ''
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSendDeleteOTP = async () => {
    setIsLoading(true);
    try {
      await api.sendDeleteAccountOTP(user!.email);
      setDeleteStep('otp');
    } catch (err) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await api.deleteAccount(user!.email, otp);
      logout();
      router.push('/');
    } catch (error) {
      toast.error('Account deletion failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Experience options
const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher (0 years)' },
  { value: '0-1', label: '0-1 years' },
  { value: '1-2', label: '1-2 years' },
  { value: '2-3', label: '2-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-7', label: '5-7 years' },
  { value: '7-10', label: '7-10 years' },
  { value: '10+', label: '10+ years' }
];

// Job role options
const JOB_ROLE_OPTIONS = [
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'fullstack', label: 'Full Stack Developer' },
  { value: 'mobile', label: 'Mobile Developer' },
  { value: 'devops', label: 'DevOps Engineer' },
  { value: 'data-scientist', label: 'Data Scientist' },
  { value: 'data-analyst', label: 'Data Analyst' },
  { value: 'ml-engineer', label: 'ML Engineer' },
  { value: 'cloud-engineer', label: 'Cloud Engineer' },
  { value: 'sre', label: 'Site Reliability Engineer' },
  { value: 'qa-engineer', label: 'QA Engineer' },
  { value: 'security-engineer', label: 'Security Engineer' },
  { value: 'product-manager', label: 'Product Manager' },
  { value: 'project-manager', label: 'Project Manager' },
  { value: 'ui-ux', label: 'UI/UX Designer' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'business-analyst', label: 'Business Analyst' },
  { value: 'other', label: 'Other' }
];


  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold shadow-lg"
      >
        {user ? getInitials(user.fullName) : <User className="w-5 h-5" />}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-64 glass-card p-4 shadow-xl z-50"
          >
            <div className="border-b border-white/10 pb-3 mb-3">
              <p className="font-semibold text-white">{user?.fullName}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>

            {/* EDIT PROFILE BUTTON — UPDATED */}
            <button
              onClick={() => {
                setIsEditingProfile(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            <button
              onClick={() => {
                setShowDeleteModal(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Edit Modal */}
<AnimatePresence>
  {isEditingProfile && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
      onClick={() => setIsEditingProfile(false)}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Completion Notice */}
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-200">
              <strong>💡 Tip:</strong> Complete your profile to receive more personalized and accurate analysis results. These details help our AI understand your background better.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="glass-input"
                required
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Experience Level
                <span className="text-xs text-gray-400">(Optional)</span>
              </label>

              <select
                value={profileData.experience}
                onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                className="glass-input"
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-400 mt-1">
                Helps us tailor career guidance to your experience level
              </p>
            </div>

            {/* Job Role */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-400" />
                Job Role/Designation
                <span className="text-xs text-gray-400">(Optional)</span>
              </label>

              <select
                value={profileData.designation}
                onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                className="glass-input"
              >
                <option value="">Select your role</option>
                {JOB_ROLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-400 mt-1">
                Enables role-specific recommendations and insights
              </p>
            </div>

            {/* Current Company */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Current Company
                <span className="text-xs text-gray-400">(Optional)</span>
              </label>

              <input
                type="text"
                value={profileData.currentCompany}
                onChange={(e) => setProfileData({ ...profileData, currentCompany: e.target.value })}
                placeholder="e.g., Google, Microsoft, or 'None'"
                className="glass-input"
              />

              <p className="text-xs text-gray-400 mt-1">
                Enter company name or leave blank if not currently employed
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile || !profileData.fullName}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingProfile ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>

            <button
              onClick={() => setIsEditingProfile(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      {/* ====================================================== */}
      {/* DELETE ACCOUNT MODAL (UNCHANGED) */}
      {/* ====================================================== */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteStep('confirm');
              setOtp('');
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md glass-card p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-red-400">Delete Account</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteStep('confirm');
                    setOtp('');
                  }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {deleteStep === 'confirm' ? (
                <div className="space-y-4">
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                    <p className="text-red-200 text-sm">
                      ⚠️ This action cannot be undone. All your data will be permanently
                      deleted.
                    </p>
                  </div>

                  <p className="text-gray-300">
                    We'll send a verification code to <strong>{user?.email}</strong>
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSendDeleteOTP}
                      disabled={isLoading}
                      className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Sending…' : 'Send Code'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <Mail className="w-4 h-4" />
                    <span>Code sent to {user?.email}</span>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="glass-input text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setDeleteStep('confirm');
                        setOtp('');
                      }}
                      className="flex-1 btn-secondary"
                    >
                      Back
                    </button>

                    <button
                      onClick={handleDeleteAccount}
                      disabled={isLoading || otp.length !== 6}
                      className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Deleting…' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
