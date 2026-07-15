import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Lock, CreditCard, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
// @ts-ignore
import { load } from '@cashfreepayments/cashfree-js';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
}

export default function PaymentFormModal({ isOpen, onClose, planName, planPrice }: PaymentFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupInstruction, setSetupInstruction] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSetupInstruction(null);

    // Validate inputs
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!phone.trim() || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on Express backend
      const response = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: planPrice,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          planName: planName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        setError(data.error || 'Failed to create payment checkout session.');
        if (data.setupInstruction) {
          setSetupInstruction(data.setupInstruction);
        }
        return;
      }

      const { payment_session_id, env } = data;

      if (!payment_session_id) {
        setLoading(false);
        setError('Payment Gateway returned an empty session ID. Please configure credentials properly.');
        return;
      }

      // 2. Load Cashfree Web SDK
      const cashfree = await load({
        mode: env === 'production' ? 'production' : 'sandbox',
      });

      // 3. Initiate checkout (V3 Web Checkout)
      await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: '_self', // Best practices for reliable redirects across all webviews & browsers
      });

    } catch (err: any) {
      console.error('Checkout error:', err);
      setLoading(false);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#1E293B] border border-blue-500/30 shadow-2xl z-10"
          >
            {/* Top color bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-sky-400" />

            {/* Header */}
            <div className="p-6 pb-0 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">Secure Checkout</span>
                <h3 className="text-xl font-bold text-white mt-1">Complete Your Payment</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Plan Box */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex justify-between items-center">
                <div className="text-left">
                  <p className="text-xs text-gray-400">Selected Product:</p>
                  <p className="text-sm font-bold text-white mt-0.5">{planName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block line-through">₹1,999</span>
                  <span className="text-xl font-black text-blue-400 font-display">₹{planPrice}</span>
                </div>
              </div>

              {/* Error messages */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs space-y-1">
                  <div className="flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <div>
                      <p className="font-bold">{error}</p>
                      {setupInstruction && (
                        <p className="mt-1 text-gray-400 font-mono text-[10px] bg-black/30 p-2 rounded">{setupInstruction}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="customerName" className="text-xs font-bold text-gray-300 block uppercase tracking-wider font-mono">
                    Full Name / पूरा नाम
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="customerEmail" className="text-xs font-bold text-gray-300 block uppercase tracking-wider font-mono">
                    Email Address / ईमेल आईडी
                  </label>
                  <input
                    id="customerEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label htmlFor="customerPhone" className="text-xs font-bold text-gray-300 block uppercase tracking-wider font-mono">
                    WhatsApp Number / मोबाइल नंबर
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono font-bold">+91</span>
                    <input
                      id="customerPhone"
                      type="tel"
                      required
                      pattern="\d{10}"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10 digit phone number"
                      className="w-full h-11 pl-14 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                    * isi number par script backup links and direct tutorials update send honge.
                  </p>
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-extrabold text-sm flex justify-center items-center gap-2 cursor-pointer shadow-lg transition-all duration-200 uppercase tracking-wider font-display disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 shrink-0" />
                      <span>Proceed to Pay ₹{planPrice}</span>
                      <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer trust badge */}
            <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex items-center justify-center gap-2 text-gray-400 text-[11px] font-mono select-none">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>UPI, Cards & Net Banking Secured by Cashfree Payments</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
