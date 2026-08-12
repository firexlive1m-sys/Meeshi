import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
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

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  initialEmail?: string;
  initialName?: string;
  initialPhone?: string;
  isEmailLocked?: boolean;
  isUpgrade?: boolean;
}

export default function PaymentFormModal({ isOpen, onClose, planName, planPrice, initialEmail, initialName, initialPhone, isEmailLocked, isUpgrade }: PaymentFormModalProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const [phone, setPhone] = useState(initialPhone || '');
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

  React.useEffect(() => {
    if (isOpen) {
      if (initialEmail) {
        setEmail(initialEmail);
      } else {
        setEmail('');
      }
      if (initialPhone) {
        setPhone(initialPhone);
      } else {
        setPhone('');
      }
    }
  }, [isOpen, initialEmail, initialPhone]);

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

  // Handle case where user navigates back from the payment gateway using browser back button
  React.useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLoading(false);
        setError('Payment was interrupted or cancelled. Please try again.');
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // Dynamic pricing calculation
  const basePrice = isUpgrade ? 199 : planPrice; 
  const addonPrice = 149;
  const originalAddonPrice = 199;
  
  const subTotal = basePrice + (!isUpgrade && isAddonChecked ? addonPrice : 0);
  const baseDiscount = isUpgrade ? 50 : 0;
  
  const promoDiscount = isPromoApplied 
    ? (appliedPromo === 'SKALI' ? Math.floor((subTotal - baseDiscount) * 0.999) : 20)
    : 0;
    
  const discountAmount = baseDiscount + promoDiscount;
  const finalTotal = subTotal - discountAmount;
  const finalPlanName = !isUpgrade && isAddonChecked 
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSetupInstruction(null);

    const isEmailInvalid = !email.trim() || !/^[^s@]+@[^s@]+.[^s@]+$/.test(email);
    const isPhoneInvalid = !phone.trim() || !/^\d{10}$/.test(phone.replace(/\D/g, ''));

    if (!isUpgrade) {
      setPhoneTouched(true);
      setPhoneError(isPhoneInvalid);
    }
    setEmailTouched(true);
    setEmailError(isEmailInvalid);

    // Validate inputs
    if (isEmailInvalid) {
      setError('Please enter a valid email address (Apna email id daalein)');
      return;
    }
    if (isPhoneInvalid) {
      setError('Please enter a valid 10-digit phone number (Apna 10-digit phone number daalein)');
      return;
    }

    setLoading(true);

    const emailStr = email.trim();
    
    // Auto-generate name from email or use initialName
    let baseName = initialName || 'Customer';
    if (!initialName && emailStr.includes('@')) {
      const prefix = emailStr.split('@')[0];
      baseName = prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[^a-zA-Z]/g, ' ').trim() || 'Customer';
    }

    const computedName = baseName;
    const computedEmail = emailStr;
    const computedPhone = phone.replace(/\D/g, '');

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        setLoading(false);
        setError('Failed to load Razorpay SDK. Please check your internet connection.');
        return;
      }

      // 1. Create order on Express backend
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotal * 100, // amount in paise
          currency: 'INR',
          customerName: computedName,
          customerEmail: computedEmail,
          customerPhone: computedPhone,
          planName: finalPlanName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        setError(data.error || 'Failed to create payment checkout session.');
        return;
      }

      const { order_id, amount, currency } = data;

      if (!order_id) {
        setLoading(false);
        setError('Payment Gateway returned an empty order ID. Please configure credentials properly.');
        return;
      }

      // Save billing credentials to localStorage so they are available upon successful return
      try {
        localStorage.setItem('pending_purchase_name', computedName);
        localStorage.setItem('pending_purchase_phone', computedPhone);
        localStorage.setItem('pending_purchase_email', computedEmail);
        localStorage.setItem('pending_purchase_plan', finalPlanName);
      } catch (e) {
        console.warn("Could not save to localStorage", e);
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // Enter the Key ID generated from the Dashboard
        amount: amount, 
        currency: currency,
        name: 'Auto Listing',
        description: finalPlanName,
        order_id: order_id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment Signature
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                customerEmail: computedEmail,
                customerName: computedName,
                customerPhone: computedPhone,
                planName: finalPlanName,
                amount: amount
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok && verifyData.success) {
              window.location.href = '/?payment_status=success&order_id=' + response.razorpay_order_id;
            } else {
              setError(verifyData.error || 'Payment verification failed.');
              setLoading(false);
            }
          } catch (err) {
            setError('Error verifying payment.');
            setLoading(false);
          }
        },
        prefill: {
          name: computedName,
          email: computedEmail,
          contact: computedPhone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setError('Payment cancelled by user.');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any){
        setLoading(false);
        setError(response.error.description || 'Payment failed.');
      });

      rzp.open();

      // Fire InitiateCheckout Pixel
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'InitiateCheckout', {
          currency: 'INR',
          value: finalTotal,
          content_name: finalPlanName
        });
      }

    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'An unexpected error occurred while initiating checkout.');
      console.error(err);
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
                <div className="w-full flex-1 overflow-y-auto px-4 pt-3 pb-6 flex justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="max-w-lg w-full space-y-3 relative">
                    {/* Top Row: Info Highlight Badge & Close Button */}
                    <div className="flex justify-between items-center gap-3 pt-0.5 pb-1 select-none">
                      <div className="flex-1 bg-emerald-50/70 border border-emerald-100/80 rounded-xl py-1.5 px-2.5 text-left flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] xs:text-[11px] font-bold text-emerald-800 leading-tight">
                          Secure & Instant Download Access
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg border border-slate-200/80 flex items-center justify-center shrink-0"
                        title="Close"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Already Purchased Link */}
                    {!isUpgrade && (
                      <Link to="/download" className="block w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-center text-blue-700 text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
                        <Lock className="w-3.5 h-3.5" />
                        Already Purchased? Login Here
                      </Link>
                    )}

                    {isUpgrade && (
                      <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3 text-left space-y-2">
                        <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          Combo Plan Upgrade (₹50 OFF)
                        </h4>
                        <p className="text-[11px] text-blue-800/80 leading-relaxed font-medium">
                          You currently have the <strong className="text-blue-900">Meesho Auto Listing Tool</strong>. You are upgrading to the <strong className="text-blue-900">Combo Plan (Meesho + Flipkart)</strong>.
                          <br /><br />
                          You only need to pay for the Flipkart tool right now, which includes an exclusive ₹50 discount. After purchase, the Flipkart tool will automatically unlock on your dashboard using this exact same email address!
                        </p>
                      </div>
                    )}

                    {/* Error Message Panel Removed to use Popup Modal instead */}

                    {/* Phone Input Container */}
                    <div className="space-y-1 text-left">
                      <label htmlFor="customerPhone" className="block text-[13px] font-semibold text-slate-700">
                        Phone Number *
                      </label>
                      <div className={`border rounded-xl py-2.5 px-3 transition-all duration-150 ${
                        phoneTouched && phoneError
                          ? 'border-red-500 ring-1 ring-red-500 bg-red-50/10'
                          : isEmailLocked ? 'border-slate-200 bg-slate-100' : 'border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600'
                      }`}>
                        <div className="flex items-center">
                          <span className="text-slate-500 font-medium text-sm mr-2">+91</span>
                          <input
                            id="customerPhone"
                            type="tel"
                            required
                            disabled={isEmailLocked}
                            value={phone}
                            onChange={(e) => {
                              if (isEmailLocked) return;
                              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setPhone(val);
                              if (phoneTouched) {
                                setPhoneError(val.length !== 10);
                              }
                            }}
                            onBlur={() => {
                              if (isEmailLocked) return;
                              setPhoneTouched(true);
                              setPhoneError(phone.length !== 10);
                            }}
                            placeholder="Enter 10-digit mobile number"
                            className={`block w-full bg-transparent text-slate-800 font-medium text-sm focus:outline-none border-0 p-0 font-sans ${isEmailLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                            maxLength={10}
                          />
                        </div>
                      </div>
                      {phoneTouched && phoneError && (
                        <p className="text-[11px] font-semibold text-red-500 animate-fade-in text-left">
                          Please enter a valid 10-digit phone number
                        </p>
                      )}
                    </div>

                    {/* Email Input Container */}
                    <div className="space-y-1 text-left">
                      <label htmlFor="customerEmail" className="block text-[13px] font-semibold text-slate-700">
                        Email Address *
                      </label>
                      <div className={`border rounded-xl py-2.5 px-3 transition-all duration-150 ${
                        emailTouched && emailError
                          ? 'border-red-500 ring-1 ring-red-500 bg-red-50/10'
                          : isEmailLocked ? 'border-slate-200 bg-slate-100' : 'border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600'
                      }`}>
                        <input
                          id="customerEmail"
                          type="email"
                          required
                          disabled={isEmailLocked}
                          value={email}
                          onChange={(e) => {
                            if (isEmailLocked) return;
                            const val = e.target.value;
                            setEmail(val);
                            if (emailTouched) {
                              setEmailError(!val.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
                            }
                          }}
                          onBlur={() => {
                            if (isEmailLocked) return;
                            setEmailTouched(true);
                            setEmailError(!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
                          }}
                          placeholder="Enter your email address"
                          className={`block w-full bg-transparent text-slate-800 font-medium text-sm focus:outline-none border-0 p-0 font-sans ${isEmailLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                        />
                      </div>
                      {emailTouched && emailError && (
                        <p className="text-[11px] font-semibold text-red-500 animate-fade-in text-left">
                          Please enter a valid email address
                        </p>
                      )}
                      <div className="mt-2.5 bg-amber-50/80 border border-amber-200/60 p-2.5 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-snug font-medium text-amber-900 text-left">
                          <strong>Note:</strong> Tool access will be tied to this Gmail address. {isEmailLocked ? 'Since you are upgrading, this cannot be changed.' : 'Please ensure it is correct and you can log into it, as access cannot be transferred.'}
                        </p>
                      </div>
                    </div>

                    {/* Flipkart Tool Dotted/Dashed Blue Addon Card */}
                    {!isUpgrade && (
                      <div 
                        className="p-3 rounded-xl border-dashed border-[1.5px] border-blue-400 bg-[#F0F7FF] hover:bg-[#EBF5FF] transition-all text-left shadow-sm"
                      >
                        {/* Addon details click triggers drawer */}
                        <div className="space-y-2 cursor-pointer" onClick={() => setIsDetailOpen(true)}>
                        
                        {/* Top Row: Image & Title Side-by-Side */}
                        <div className="flex gap-3 items-center">
                          {/* Image Thumbnail */}
                          <div className="relative w-[80px] h-[60px] rounded bg-[#0A192F] border border-slate-200/50 shrink-0 shadow-sm flex items-center justify-center p-0.5">
                            <img 
                              src="https://media-cdn.cosmofeed.com/chat/1000055066-2026-27-05-04-34-47.png" 
                              alt="Flipkart Auto Listing Tool" 
                              className="w-full h-full object-cover rounded"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Title Column */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-bold text-slate-900 leading-snug font-sans">
                              Flipkart Auto Listing Tool + AI SEO Generator
                            </h4>
                          </div>
                        </div>

                        {/* Content spanning full-width underneath */}
                        <div className="space-y-0.5">
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
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddonChecked(!isAddonChecked)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-800 transition-all duration-150 shrink-0 shadow-sm cursor-pointer"
                        >
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all duration-150 ${
                            isAddonChecked 
                              ? 'bg-[#0F172A] border-[#0F172A] text-white' 
                              : 'bg-white border-slate-300 text-transparent'
                          }`}>
                            {isAddonChecked && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                          </div>
                          <span>Add Flipkart Tool</span>
                        </button>
                      </div>
                    </div>
                    )}

                    {/* Promo Code Row (Exactly like screenshots, whole card is clickable) */}
                    <div 
                      onClick={() => {
                        if (!showPromoInput) {
                          setShowPromoInput(true);
                        }
                      }}
                      className={`border border-slate-200 rounded-xl py-2.5 px-3 bg-white shadow-sm text-left transition-all ${
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
                    <div className="space-y-2 text-xs text-slate-500 font-semibold pt-1 text-left">
                      <div className="flex justify-between items-center">
                        <span>Sub Total</span>
                        <span className="text-slate-800 font-bold">₹{basePrice}</span>
                      </div>

                      {isAddonChecked && !isUpgrade && (
                        <div className="flex justify-between items-center">
                          <span>Add On</span>
                          <span className="text-slate-800 font-bold">₹{addonPrice}</span>
                        </div>
                      )}

                      {isUpgrade && (
                        <div className="flex justify-between items-center text-emerald-600">
                          <span>Upgrade Discount</span>
                          <span className="font-bold">-₹50</span>
                        </div>
                      )}

                      {isPromoApplied && (
                        <div className="flex justify-between items-center text-emerald-600">
                          <span>Promo Discount</span>
                          <span className="font-bold">-₹{promoDiscount}</span>
                        </div>
                      )}

                      {/* Final Bold Total */}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-950 font-black">
                        <span className="text-sm font-bold text-slate-800">Total</span>
                        <span className="text-base text-slate-950 font-bold">₹{finalTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Area */}
                <div className="w-full flex justify-center px-4 pb-3 mt-4">
                  <div className="max-w-lg w-full">
                    {/* Pay Action Button */}
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
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative flex flex-col items-center justify-center z-10 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center mb-5 border border-slate-100">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Creating Secure Checkout</h3>
              <p className="text-sm text-slate-600 font-medium max-w-[280px]">
                Please wait a moment while we redirect you to the payment gateway...
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && !loading && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setError(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 text-center z-10"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-[19px] font-black text-slate-900 mb-2 font-sans tracking-tight">Payment Failed</h3>
              <p className="text-[14px] text-slate-600 mb-6 font-medium leading-relaxed">{error}</p>
              {setupInstruction && (
                <p className="mt-2 mb-5 text-slate-600 font-mono text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                  {setupInstruction}
                </p>
              )}
              <button
                type="button"
                onClick={() => setError(null)}
                className="w-full h-13 bg-black text-white font-bold text-[15px] rounded-xl hover:bg-slate-900 transition-colors shadow-md"
              >
                Try Again
              </button>
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
              <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                      { text: '1-Click Auto Listing', emoji: '⚡' },
                      { text: 'Free Image Generator Tool', emoji: '🖼️' },
                      { text: 'Shipping Reduce Method', emoji: '📦' },
                      { text: 'Works on Mobile, PC, Laptop', emoji: '💻' },
                      { text: 'AI SEO Title Generator', emoji: '🤖' },
                      { text: 'AI Product Description Generator', emoji: '✍️' },
                      { text: 'Smart Keyword Suggestions', emoji: '🔍' },
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
