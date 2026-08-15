import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface PasswordSetupModalProps {
  isOpen: boolean;
  email: string;
  onComplete: () => void;
}

export default function PasswordSetupModal({ isOpen, email, onComplete }: PasswordSetupModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setSuccess(false);
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 5
  };

  const strength = calculateStrength(password);
  
  const getStrengthColor = () => {
    if (password.length === 0) return 'bg-slate-700';
    if (strength <= 2) return 'bg-red-500';
    if (strength === 3 || strength === 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (password.length === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength === 3 || strength === 4) return 'Good';
    return 'Strong';
  };

  const isMatching = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const isLengthValid = password.length >= 8;
  const isFormValid = isLengthValid && isMatching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setError(null);
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "purchases", email.toLowerCase()), { hasPassword: true }, { merge: true });
      
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        // Account already exists, update flag and proceed
        await setDoc(doc(db, "purchases", email.toLowerCase()), { hasPassword: true }, { merge: true });
        setSuccess(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setError(err.message || "Failed to set password. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-[420px] bg-[#1E293B] rounded-[24px] shadow-2xl border border-slate-700/60 z-10 overflow-hidden my-8 flex flex-col"
          >
            {/* Top Highlight */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            
            {success ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-10 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">Password Saved!</h3>
                <p className="text-slate-400">Taking you to your downloads...</p>
              </motion.div>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Lock className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Secure Your Purchase</h3>
                    <p className="text-xs text-slate-400 leading-tight mt-1">Create a password to access your files later.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-[#0F172A] border border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-4 pr-12 py-3 text-white text-base outline-none transition-all placeholder:text-slate-500"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Strength Indicator */}
                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex gap-1.5 w-full mr-4">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level} 
                            className={`h-1.5 w-full rounded-full transition-colors duration-300 ${password.length > 0 && strength >= level ? getStrengthColor() : 'bg-slate-700'}`} 
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium w-12 text-right ${password.length === 0 ? 'text-transparent' : 'text-slate-400'}`}>
                        {getStrengthText()}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`w-full bg-[#0F172A] border ${confirmPassword.length > 0 ? (isMatching ? 'border-emerald-500/50' : 'border-red-500/50') : 'border-slate-600'} focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-4 pr-12 py-3 text-white text-base outline-none transition-all placeholder:text-slate-500`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Requirements List */}
                  <div className="bg-[#0F172A] rounded-xl p-4 border border-slate-700/50 space-y-2">
                    <div className="flex items-center gap-2">
                      {isLengthValid ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-500" />}
                      <span className={`text-xs ${isLengthValid ? 'text-emerald-400' : 'text-slate-400'}`}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isMatching ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-500" />}
                      <span className={`text-xs ${isMatching ? 'text-emerald-400' : 'text-slate-400'}`}>Passwords must match</span>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex justify-center items-center mt-2 shadow-lg shadow-emerald-900/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                      </span>
                    ) : (
                      "Set Password & Continue"
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
