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
      setPromoError('Invalid coupon code. Try SKALI or SAVE20!');
      setIsPromoApplied(false);
      setAppliedPromo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSetupInstruction(null);

    // Validate inputs
    if (!name.trim()) {
      setError('Please enter your full name (Apna poora naam daalein)');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address (Sahi email ID daalein)');
      return;
    }
    if (!phone.trim() || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number (10-digit mobile number daalein)');
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
          amount: finalTotal,
          customerName: name,
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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
            {/* Backdrop with a dark blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, y: '100%', scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="relative w-full max-w-lg bg-[#FCFCFD] text-slate-800 shadow-2xl z-50 rounded-t-[28px] sm:rounded-[28px] overflow-hidden flex flex-col max-h-[96dvh] sm:max-h-[92vh] border-t sm:border border-white/20"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                    SECURE CHECKOUT
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto p-5 space-y-5 flex-1">
                
                {/* Visual Trust Indicator Bar */}
                <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 rounded-2xl text-[11px] font-bold text-emerald-800 border border-emerald-100/70 text-center select-none font-sans">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Your Connection is 256-Bit SSL Secured & Encrypted</span>
                </div>

                {/* Main Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-4">
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

                  {/* Full Name */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="customerName" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-sans">
                      Full Name (Apna Naam) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Asgar Ali"
                      className="w-full h-11 px-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white text-slate-900 text-sm font-semibold focus:outline-none transition-all placeholder-slate-400"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="customerEmail" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-sans">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customerEmail"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full h-11 px-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white text-slate-900 text-sm font-semibold focus:outline-none transition-all placeholder-slate-400"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">Digital access and receipt will be sent to this email instantly</p>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="customerPhone" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-sans">
                      WhatsApp Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {/* Interactive Country Selector Flag/Code */}
                      <div className="flex items-center gap-1.5 px-3 rounded-xl bg-slate-100 border border-slate-200/40 text-slate-700 font-bold text-sm select-none shrink-0">
                        <span className="text-base">🇮🇳</span>
                        <span className="font-sans text-xs">+91</span>
                        <ChevronDown className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                      </div>
                      
                      {/* Actual Input Field */}
                      <input
                        id="customerPhone"
                        type="tel"
                        required
                        pattern="\d{10}"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="7365890209"
                        className="flex-1 h-11 px-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white text-slate-900 text-sm font-semibold focus:outline-none transition-all placeholder-slate-400 font-sans"
                      />
                    </div>
                  </div>

                  {/* Flipkart Tool Dotted/Dashed Blue Addon Card */}
                  <div 
                    className={`p-3.5 rounded-2xl border-2 border-dashed transition-all duration-300 relative text-left select-none ${
                      isAddonChecked 
                        ? 'border-blue-500 bg-blue-50/40 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    {/* Addon details click triggers drawer */}
                    <div className="flex gap-3 cursor-pointer" onClick={() => setIsDetailOpen(true)}>
                      {/* Image Thumbnail - FULLY VISIBLE & PREVENT CROP FIX */}
                      <div className="relative w-28 h-16 rounded-xl overflow-hidden bg-[#0A192F] border border-slate-200/80 shrink-0 shadow-sm flex items-center justify-center p-0.5">
                        <img 
                          src="https://media-cdn.cosmofeed.com/chat/1000055066-2026-27-05-04-34-47.png" 
                          alt="Flipkart Auto Listing Tool" 
                          className="w-full h-full object-contain rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 right-1 bg-blue-600 text-white p-0.5 rounded-full shadow z-10">
                          <Info className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      </div>

                      {/* Description Panel */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="text-[13px] font-black text-slate-950 leading-tight font-display">
                          Flipkart Auto Listing Tool + AI SEO Generator
                        </h4>
                        
                        <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-amber-600">
                          <span>Flipkart Auto Listing Tool ⚡ Extra ₹50 OFF 💸</span>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-tight">
                          Ab products manually upload karne ka jhanjhat khatam 😟... Click to see demo video!
                        </p>

                        {/* Prices */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-sm font-black text-slate-950">₹149</span>
                          <span className="text-xs text-slate-400 line-through">₹{originalAddonPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Checkbox add/remove option button */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Click above image to watch demo
                      </span>

                      <button
                        type="button"
                        onClick={() => setIsAddonChecked(!isAddonChecked)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all duration-150 ${
                          isAddonChecked 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10 hover:bg-blue-700' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isAddonChecked ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Added to Order</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 stroke-[3]" />
                            <span>Add Tool (₹149)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Promo Code Row */}
                  <div className="border-t border-b border-slate-100 py-2 text-left">
                    {!showPromoInput && !isPromoApplied ? (
                      <button
                        type="button"
                        onClick={() => setShowPromoInput(true)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Have a Discount Coupon?</span>
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter Code (e.g. SAVE20)"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            disabled={isPromoApplied}
                            className="flex-1 h-9 px-3 rounded-lg bg-slate-100 text-xs font-bold uppercase border border-transparent focus:border-blue-500 focus:bg-white text-slate-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            disabled={isPromoApplied}
                            className="h-9 px-4 rounded-lg bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 disabled:bg-emerald-500 shrink-0"
                          >
                            {isPromoApplied ? 'Applied' : 'Apply'}
                          </button>
                        </div>
                        {promoError && <p className="text-[10px] text-red-500 font-bold">{promoError}</p>}
                        {isPromoApplied && (
                          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> 
                            {appliedPromo === 'SKALI' 
                              ? `Mega Coupon SKALI Applied! Saved 99.9% (-₹${discountAmount})! 🎉`
                              : 'Coupon applied! Saved ₹20.'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Pricing Breakdown Summary */}
                  <div className="space-y-2 text-xs font-sans text-slate-600 font-semibold pt-1 text-left">
                    <div className="flex justify-between items-center">
                      <span>Meesho Suite License</span>
                      <span className="text-slate-900 font-bold">₹{basePrice}</span>
                    </div>

                    {isAddonChecked && (
                      <div className="flex justify-between items-center text-blue-600">
                        <span>Flipkart Automation Addon</span>
                        <span className="font-bold">₹{addonPrice}</span>
                      </div>
                    )}

                    {isPromoApplied && (
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>Promo Code applied</span>
                        <span className="font-bold">-₹{discountAmount}</span>
                      </div>
                    )}

                    {/* Final Bold Total */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-slate-950 font-black">
                      <span className="text-xs font-extrabold uppercase tracking-wide">Final Payable Amount</span>
                      <span className="text-2xl font-display text-slate-950">₹{finalTotal}</span>
                    </div>
                  </div>

                  {/* Pay Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-13 rounded-xl bg-black hover:bg-slate-900 text-white font-extrabold text-xs flex justify-center items-center gap-2 cursor-pointer shadow-xl hover:shadow-slate-950/10 transition-all duration-200 uppercase tracking-wider font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Secure Checkout...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 stroke-[2.5]" />
                        <span>Pay & Get Instant Access on WhatsApp</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </form>

                {/* Secure Trust Badge Footer */}
                <div className="pt-1 flex flex-col items-center gap-1 select-none">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                    <span>UPI, Cards & Net Banking Secured by Cashfree Payments</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold max-w-xs text-center leading-normal">
                    Secure checkout. Your billing data is protected. Dispatch links will arrive via Email & WhatsApp instantly.
                  </p>
                </div>
              </div>
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
                <span className="text-xs font-black text-slate-950 uppercase tracking-tight font-display flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 stroke-[2.5]" />
                  Flipkart Auto Listing Tool Demo
                </span>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Scrollable details body */}
              <div className="overflow-y-auto flex-1">
                {/* Banner Image - FULLY VISIBLE & PREVENT CROP FIX */}
                <div className="w-full bg-[#0A192F] flex items-center justify-center p-3 border-b border-slate-100/50">
                  <img 
                    src="https://media-cdn.cosmofeed.com/chat/1000055066-2026-27-05-04-34-47.png" 
                    alt="Flipkart Auto Listing Banner"
                    className="w-full h-auto object-contain rounded-xl shadow-lg border border-slate-700/30"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-5 space-y-5 text-left">
                  {/* Highlight text details */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-black text-slate-950 font-display flex items-center gap-1 flex-wrap">
                      <span>Flipkart Auto Listing Tool ⚡ Extra ₹50 OFF 💸</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-600 leading-normal">
                      Ab products manually upload karne ka jhanjhat khatam 😟
                    </p>
                  </div>

                  {/* Features List with beautiful checkmarks */}
                  <div className="space-y-2.5 pt-1">
                    {[
                      { text: '1-Click Bulk Listing', emoji: '🚀' },
                      { text: 'AI SEO Title Generator', emoji: '🤖' },
                      { text: 'AI Product Description Generator', emoji: '✍️' },
                      { text: 'Smart Keyword Suggestions', emoji: '🔍' },
                      { text: 'Faster Product Upload', emoji: '📈' },
                      { text: 'Save Time & Increase Orders', emoji: '💰' },
                      { text: 'Beginner Friendly + Mobile Supported', emoji: '📱' },
                    ].map((feat, index) => (
                      <div key={index} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-[13px] font-extrabold text-slate-900 font-sans">
                          {feat.text} {feat.emoji}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Callout box text */}
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/60 space-y-1.5">
                    <p className="text-xs font-bold text-amber-800 leading-relaxed flex gap-1.5 items-start">
                      <span>Thousands of sellers already using automation to scale faster 💰</span>
                    </p>
                    <p className="text-xs font-black text-slate-900 leading-normal">
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
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 uppercase tracking-wider"
                >
                  Close Demo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddonChecked(true);
                    setIsDetailOpen(false);
                  }}
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/15 uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add to Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
