import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Shield, 
  Lock, 
  CreditCard, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  Plus, 
  Check, 
  Info,
  Tag,
  Sparkles,
  Gift,
  ShieldCheck
} from 'lucide-react';
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
  const [isAddonChecked, setIsAddonChecked] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupInstruction, setSetupInstruction] = useState<string | null>(null);

  // Lock background body scroll when checkout modal or demo modal is open
  React.useEffect(() => {
    if (isOpen || isDetailOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isDetailOpen]);

  // Dynamic pricing calculation
  const basePrice = planPrice; // ₹199
  const addonPrice = 149;
  const originalAddonPrice = 199;
  
  const subTotal = basePrice + (isAddonChecked ? addonPrice : 0);
  const discountAmount = isPromoApplied 
    ? (appliedPromo === 'SKALI' ? Math.floor(subTotal * 0.999) : 20)
    : 0;
  const finalTotal = subTotal - discountAmount;
  const finalPlanName = isAddonChecked 
    ? `${planName} + Flipkart Auto Listing Combo` 
    : planName;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    if (!promoCode.trim()) return;

    // Simulated discount codes
    const code = promoCode.trim().toUpperCase();
    if (code === 'SKALI') {
      setIsPromoApplied(true);
      setAppliedPromo('SKALI');
      setPromoError(null);
    } else if (code === 'SAVE20' || code === 'MEESHO20' || code === 'DISCOUNT') {
      setIsPromoApplied(true);
      setAppliedPromo(code);
      setPromoError(null);
    } else {
      setPromoError('Invalid coupon code.');
      setIsPromoApplied(false);
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setIsPromoApplied(false);
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSetupInstruction(null);

    const isEmailInvalid = !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneInvalid = !phone.trim() || !/^\d{10}$/.test(phone);

    setEmailTouched(true);
    setPhoneTouched(true);
    setEmailError(isEmailInvalid);
    setPhoneError(isPhoneInvalid);

    // Validate inputs
    if (isEmailInvalid) {
      setError('Please enter a valid email address (Sahi email ID daalein)');
      return;
    }
    if (isPhoneInvalid) {
      setError('Please enter a valid 10-digit mobile number (10-digit mobile number daalein)');
      return;
    }

    setLoading(true);

    const computedName = email.split('@')[0] || 'Customer';

    try {
      // 1. Create order on Express backend
      const response = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotal,
          customerName: computedName,
          customerEmail: email,
          customerPhone: phone,
          planName: finalPlanName
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
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-[#FCFCFD] overflow-hidden flex flex-col">
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full h-full flex-1 flex flex-col bg-[#FCFCFD] text-slate-800 overflow-hidden"
            >
              {/* Form wrapping the entire remaining content to support independent scrolling and sticky bottom footer */}
              <form onSubmit={handleSubmit} className="w-full flex-1 flex flex-col overflow-hidden">
                {/* Scrollable Body Content Wrapper */}
                <div className="w-full flex-1 overflow-y-auto p-5 pb-6 flex justify-center">
                  <div className="max-w-lg w-full space-y-5 relative">
                    {/* Floating Close Button at top-right corner with spacing and shadow highlight */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg border border-slate-100 flex items-center justify-center"
                        title="Close"
                      >
                        <X className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Subtitle message */}
                    <p className="text-[13px] text-slate-800 font-medium text-left">
                      Access to this purchase will be sent to this email
                    </p>

                    {/* Error Message Panel if exists */}
                    {error && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1 animate-fade-in text-left">
                        <div className="flex gap-2 items-start">
                          <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
                          <div>
                            <p className="font-bold">{error}</p>
                            {setupInstruction && (
                              <p className="mt-1.5 text-slate-600 font-mono text-[10px] bg-white p-2 rounded border border-slate-200">
                                {setupInstruction}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email Address Input Container */}
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="customerEmail" className="block text-[13px] font-semibold text-slate-700">
                        Email Address
                      </label>
                      <div className={`border rounded-xl p-3 bg-white transition-all duration-150 ${
                        emailTouched && emailError
                          ? 'border-red-500 ring-1 ring-red-500 bg-red-50/10'
                          : 'border-slate-200 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600'
                      }`}>
                        <input
                          id="customerEmail"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailTouched) {
                              setEmailError(!e.target.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value));
                            }
                          }}
                          onBlur={() => {
                            setEmailTouched(true);
                            setEmailError(!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
                          }}
                          placeholder="Enter your email address"
                          className="block w-full bg-transparent text-slate-800 font-medium text-sm focus:outline-none border-0 p-0"
                        />
                      </div>
                      {emailTouched && emailError && (
                        <p className="text-[11px] font-semibold text-red-500 animate-fade-in text-left">
                          Please enter a valid email address
                        </p>
                      )}
                    </div>

                    {/* Phone Number Input Container */}
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="customerPhone" className="block text-[13px] font-semibold text-slate-700">
                        Phone number *
                      </label>
                      <div className={`border rounded-xl p-3 bg-white transition-all duration-150 ${
                        phoneTouched && phoneError
                          ? 'border-red-500 ring-1 ring-red-500 bg-red-50/10'
                          : 'border-slate-200 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600'
                      }`}>
                        <input
                          id="customerPhone"
                          type="tel"
                          required
                          pattern="\d{10}"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setPhone(val);
                            if (phoneTouched) {
                              setPhoneError(!val.trim() || !/^\d{10}$/.test(val));
                            }
                          }}
                          onBlur={() => {
                            setPhoneTouched(true);
                            setPhoneError(!phone.trim() || !/^\d{10}$/.test(phone));
                          }}
                          placeholder="Enter your phone number"
                          className="block w-full bg-transparent text-slate-800 font-medium text-sm focus:outline-none border-0 p-0 font-sans"
                        />
                      </div>
                      {phoneTouched && phoneError && (
                        <p className="text-[11px] font-semibold text-red-500 animate-fade-in text-left">
                          Please enter a valid 10-digit phone number
                        </p>
                      )}
                    </div>

                    {/* Flipkart Tool Dotted/Dashed Blue Addon Card */}
                    <div 
                      className="p-4 rounded-2xl border-dashed border-[1.5px] border-blue-400 bg-[#F0F7FF] hover:bg-[#EBF5FF] transition-all text-left shadow-sm"
                    >
                      {/* Addon details click triggers drawer */}
                      <div className="space-y-3 cursor-pointer" onClick={() => setIsDetailOpen(true)}>
                        
                        {/* Top Row: Image & Title Side-by-Side */}
                        <div className="flex gap-4 items-start">
                          {/* Image Thumbnail */}
                          <div className="relative w-[100px] h-[75px] rounded-lg overflow-hidden bg-[#0A192F] border border-slate-200/50 shrink-0 shadow-sm flex items-center justify-center p-0.5">
                            <img 
                              src="https://media-cdn.cosmofeed.com/chat/1000055066-2026-27-05-04-34-47.png" 
                              alt="Flipkart Auto Listing Tool" 
                              className="w-full h-full object-cover rounded"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Title Column */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[14px] font-bold text-slate-900 leading-snug font-sans">
                              Flipkart Auto Listing Tool + AI SEO Generator
                            </h4>
                          </div>
                        </div>

                        {/* Content spanning full-width underneath */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                            <span>Flipkart Auto Listing Tool ⚡ Extra ₹50 OFF 💸</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                            Ab products manually upload karne ka jhanjhat khatam 😟...
                          </p>
                          
                          {/* Prices */}
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-sm font-bold text-slate-900">₹{addonPrice}</span>
                            <span className="text-xs text-slate-400 line-through">₹{originalAddonPrice}</span>
                          </div>
                        </div>

                      </div>

                      {/* Checkbox button exactly like screenshot */}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddonChecked(!isAddonChecked)}
                          className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all duration-150 shrink-0 shadow-sm cursor-pointer"
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-150 ${
                            isAddonChecked 
                              ? 'bg-[#0F172A] border-[#0F172A] text-white' 
                              : 'bg-white border-slate-300 text-transparent'
                          }`}>
                            {isAddonChecked && <Check className="w-3 h-3 stroke-[4]" />}
                          </div>
                          <span>Add Flipkart Tool</span>
                        </button>
                      </div>
                    </div>

                    {/* Promo Code Row (Exactly like screenshots, whole card is clickable) */}
                    <div 
                      onClick={() => {
                        if (!showPromoInput) {
                          setShowPromoInput(true);
                        }
                      }}
                      className={`border border-slate-200 rounded-xl p-3 bg-white shadow-sm text-left transition-all ${
                        !showPromoInput ? 'cursor-pointer hover:border-slate-300' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Tag className={`w-4 h-4 ${isPromoApplied ? 'text-emerald-500' : 'text-slate-500'}`} />
                          {isPromoApplied ? (
                            <span className="text-emerald-600 font-bold">
                              Discount Applied: <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-mono text-[10px] ml-1">{appliedPromo}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 font-medium">Have a Discount Code?</span>
                          )}
                        </div>
                        {isPromoApplied ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePromo();
                            }}
                            className="text-red-500 hover:text-red-600 font-bold cursor-pointer px-1 text-xs"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPromoInput(!showPromoInput);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer px-1 text-xs"
                          >
                            {showPromoInput ? 'Cancel' : 'Add'}
                          </button>
                        )}
                      </div>

                      {showPromoInput && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-fade-in text-left"
                        >
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter Coupon Code"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              disabled={isPromoApplied}
                              className="flex-1 h-9 px-3 rounded-lg bg-slate-50 text-xs font-bold uppercase border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 focus:outline-none"
                            />
                            {isPromoApplied ? (
                              <button
                                type="button"
                                onClick={handleRemovePromo}
                                className="h-9 px-4 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold shrink-0 cursor-pointer transition-colors"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={handleApplyPromo}
                                className="h-9 px-4 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                          {promoError && <p className="text-[10px] text-red-500 font-bold mt-1">{promoError}</p>}
                          {isPromoApplied && (
                            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                              <Check className="w-3 h-3 stroke-[3]" /> 
                              {appliedPromo === 'SKALI' 
                                ? `Mega Coupon SKALI Applied! Saved 99.9% (-₹${discountAmount})! 🎉`
                                : `Coupon ${appliedPromo} Applied! Saved ₹20.`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Order Pricing Breakdown Summary (Exactly like screenshots) */}
                    <div className="space-y-3 text-xs text-slate-500 font-semibold pt-1 text-left">
                      <div className="flex justify-between items-center">
                        <span>Sub Total</span>
                        <span className="text-slate-800 font-bold">₹{basePrice}</span>
                      </div>

                      {isAddonChecked && (
                        <div className="flex justify-between items-center">
                          <span>Add On</span>
                          <span className="text-slate-800 font-bold">₹{addonPrice}</span>
                        </div>
                      )}

                      {isPromoApplied && (
                        <div className="flex justify-between items-center text-emerald-600">
                          <span>Discount</span>
                          <span className="font-bold">-₹{discountAmount}</span>
                        </div>
                      )}

                      {/* Final Bold Total */}
                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-slate-950 font-black">
                        <span className="text-sm font-bold text-slate-800">Total</span>
                        <span className="text-base text-slate-950 font-bold">₹{finalTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Bottom Footer Area with Shadow */}
                <div className="w-full border-t border-slate-100 bg-white p-5 shrink-0 flex justify-center sticky bottom-0 z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
                  <div className="max-w-lg w-full space-y-4">
                    {/* Pay Action Button (Exactly like screenshots) */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="relative w-full h-14 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-[15px] flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Creating Secure Checkout...</span>
                        </div>
                      ) : (
                        <>
                          <span>Pay Now & Unlock Access</span>
                          <span className="absolute right-5 text-base">→</span>
                        </>
                      )}
                    </button>

                    {/* Secure Trust Badge Footer */}
                    <div className="flex flex-col items-center gap-1 select-none">
                      <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                        <Shield className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                        <span>UPI, Cards & Net Banking Secured by Cashfree Payments</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flipkart Tool Details Drawer/Sheet Modal (Slide 3 & 4) */}
      <AnimatePresence>
        {isDetailOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm z-45"
            />

            {/* Details Content Container */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="relative w-full max-w-lg bg-[#FCFCFD] text-slate-800 shadow-2xl z-50 rounded-t-[28px] sm:rounded-[28px] overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[92vh]"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                <span className="text-[14px] font-bold text-slate-900 tracking-tight font-sans">
                  Flipkart Auto Listing Tool + AI SEO Generator
                </span>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable details body */}
              <div className="overflow-y-auto flex-1">
                {/* Banner Image - PERFECT 16:9 LANDSCAPE RATIO WITH ZERO BLACK GAPS */}
                <div className="w-full aspect-[1.78] overflow-hidden bg-[#0A192F] border-b border-slate-100 flex items-center justify-center">
                  <img 
                    src="https://media-cdn.cosmofeed.com/chat/1000055066-2026-27-05-04-34-47.png" 
                    alt="Flipkart Auto Listing Banner"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-5 space-y-5 text-left">
                  {/* Highlight text details */}
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-bold text-slate-900 font-sans flex items-center gap-1 flex-wrap">
                      <span>Flipkart Auto Listing Tool ⚡ Extra ₹50 OFF 💸</span>
                    </h3>
                    <p className="text-[14px] font-bold text-slate-900 leading-normal">
                      Ab products manually upload karne ka jhanjhat khatam 😟
                    </p>
                  </div>

                  {/* Features List with beautiful checkmarks */}
                  <div className="space-y-3 pt-1">
                    {[
                      { text: '1-Click Bulk Listing', emoji: '' },
                      { text: 'AI SEO Title Generator', emoji: '🤖' },
                      { text: 'AI Product Description Generator', emoji: '✍️' },
                      { text: 'Smart Keyword Suggestions', emoji: '🔍' },
                      { text: 'Faster Product Upload', emoji: '🚀' },
                      { text: 'Save Time & Increase Orders', emoji: '📈' },
                      { text: 'Beginner Friendly + Mobile Supported', emoji: '📱' },
                    ].map((feat, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#22C55E] flex items-center justify-center text-white shrink-0 shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[4.5]" />
                        </div>
                        <span className="text-[14px] font-bold text-slate-900 font-sans">
                          {feat.text}{feat.emoji && ' '}{feat.emoji}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Callout box text */}
                  <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] space-y-1.5 text-left">
                    <p className="text-[13px] font-bold text-amber-800 leading-relaxed">
                      Thousands of sellers already using automation to scale faster 💰
                    </p>
                    <p className="text-[13px] font-bold text-slate-900 leading-normal">
                      Ab tum bhi smarter way mein Flipkart selling start karo 🔥
                    </p>
                  </div>
                </div>
              </div>

              {/* Action bar sticky footer */}
              <div className="p-5 border-t border-slate-100 bg-white flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="flex-1 h-11 rounded-lg border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 uppercase tracking-wider cursor-pointer"
                >
                  Close Demo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddonChecked(true);
                    setIsDetailOpen(false);
                  }}
                  className="flex-1 h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                >
                  Add Flipkart Tool
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
