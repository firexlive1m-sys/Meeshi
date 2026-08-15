import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Lock } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "purchases", email.toLowerCase()), { hasPassword: true }, { merge: true });
      onComplete();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        // Account already exists (maybe via Google Auth), just mark as completed and proceed
        await setDoc(doc(db, "purchases", email.toLowerCase()), { hasPassword: true }, { merge: true });
        onComplete();
      } else {
        setError(err.message || "Failed to set password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-[#1E293B] rounded-3xl shadow-2xl p-8 border border-slate-700/50 z-10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-emerald-500" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Secure Your Purchase</h3>
            <p className="text-sm text-slate-400 mb-8">
              Your payment has been verified successfully. Set a password now to access your purchase later using Email + Phone.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Confirm your password"
                />
              </div>

              {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex justify-center items-center mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Set Password & Continue"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
