import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  Award, 
  Smartphone, 
  Sparkles, 
  Clock, 
  Cpu, 
  Table, 
  TrendingDown, 
  CheckCircle, 
  Play, 
  Pause, 
  Star, 
  Phone, 
  Lock, 
  Layers, 
  Share2, 
  MessageSquare,
  ArrowRight,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX
} from 'lucide-react';

// Data configs
import { CONFIG, FEATURES, REVIEWS } from './data';

// Custom sub-components
import TrustBadges from './components/TrustBadges';
import StatsCounter from './components/StatsCounter';
import ProofSlider from './components/ProofSlider';
import ComparisonTable from './components/ComparisonTable';
import ProblemSolution from './components/ProblemSolution';
import VideoReviews from './components/VideoReviews';
import FAQSection from './components/FAQSection';
import PricingCard from './components/PricingCard';
import LiveSalesNotification from './components/LiveSalesNotification';
import PaymentFormModal from './components/PaymentFormModal';

export default function App() {
  // Global CTA Variable
  const globalCtaUrl = CONFIG.ctaRedirectUrl;
  const whatsappNumber = CONFIG.whatsappNumber;

  // Payment Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState({ name: 'Meesho Instant Listing Pack', price: 199 });

  // Payment Status State from URL Query Parameters
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<string>('');

  // Device Selection Popup States
  const [isDevicePopupOpen, setIsDevicePopupOpen] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('Mobile');

  // Stored Customer details state for WhatsApp confirmation message
  const [customerDetails, setCustomerDetails] = useState({
    name: 'Customer',
    email: '',
    phone: '',
    planName: 'Meesho Instant Listing Pack',
    price: 199
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payment_status');
    const orderId = params.get('order_id');
    
    if (status === 'success') {
      setPaymentSuccess(true);
      if (orderId) setPaymentOrderId(orderId);

      // Load initial info from localStorage
      const storedName = localStorage.getItem('pending_purchase_name') || 'Customer';
      const storedEmail = localStorage.getItem('pending_purchase_email') || '';
      const storedPhone = localStorage.getItem('pending_purchase_phone') || '';
      const storedPlan = localStorage.getItem('pending_purchase_plan') || 'Meesho Instant Listing Pack';
      const storedPrice = localStorage.getItem('pending_purchase_price') ? Number(localStorage.getItem('pending_purchase_price')) : 199;

      setCustomerDetails({
        name: storedName,
        email: storedEmail,
        phone: storedPhone,
        planName: storedPlan,
        price: storedPrice
      });

      // Fire Purchase event on Facebook Pixel with deduplication (eventID)
      try {
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Purchase', {
            value: storedPrice,
            currency: 'INR',
            content_name: storedPlan
          }, {
            eventID: orderId || undefined
          });
          console.log('FB Pixel Purchase event fired. eventID/orderID:', orderId);
        }
      } catch (pxErr) {
        console.warn('Pixel Purchase tracking failed:', pxErr);
      }

      // Backup fetch from endpoint in case localStorage was cleared/not-present
      if (orderId) {
        fetch(`/api/get-cashfree-order/${orderId}`)
          .then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch details');
          })
          .then(data => {
            if (data && data.customer_details) {
              setCustomerDetails(prev => ({
                ...prev,
                name: data.customer_details.customer_name || prev.name,
                email: data.customer_details.customer_email || prev.email,
                phone: data.customer_details.customer_phone || prev.phone,
                price: data.order_amount || prev.price
              }));
            }
          })
          .catch(err => console.warn('Backup fetch order details failed:', err));
      }

      // Clean up URL parameters so refresh doesn't trigger it again
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'failed') {
      setPaymentSuccess(false);
      if (orderId) setPaymentOrderId(orderId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Hero Video Control States
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [heroMuted, setHeroMuted] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [heroCurrentTime, setHeroCurrentTime] = useState(0);
  const [heroDuration, setHeroDuration] = useState(0);

  // Compliance Modals State
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'support' | 'refund' | 'shipping' | null>(null);

  // Track Hero main button visibility to conditionally show sticky bar on mobile
  const [isHeroButtonVisible, setIsHeroButtonVisible] = useState(true);
  const heroButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only set up observer on client-side
    if (typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroButtonVisible(entry.isIntersecting);
      },
      { threshold: 0.05 } // Triggers when at least 5% is visible
    );

    if (heroButtonRef.current) {
      observer.observe(heroButtonRef.current);
    }

    return () => {
      if (heroButtonRef.current) {
        observer.unobserve(heroButtonRef.current);
      }
    };
  }, []);

  // Time Countdown state for Sticky Buy Bar
  const [stickyTimeLeft, setStickyTimeLeft] = useState(898);

  useEffect(() => {
    const interval = setInterval(() => {
      setStickyTimeLeft((prev) => {
        if (prev <= 1) return 898;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize player options
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    // Enforce initial attributes
    video.playsInline = true;
    video.loop = true;

    // Start unmuted but paused
    video.muted = false;
    setHeroMuted(false);
    setHeroPlaying(false);
  }, []);

  // Listen to other video plays to pause when another starts
  useEffect(() => {
    const handleOtherVideoPlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail && customEvent.detail.id !== 'hero') {
        if (heroVideoRef.current && !heroVideoRef.current.paused) {
          heroVideoRef.current.pause();
          setHeroPlaying(false);
        }
      }
    };
    window.addEventListener('app-video-play', handleOtherVideoPlay);
    return () => {
      window.removeEventListener('app-video-play', handleOtherVideoPlay);
    };
  }, []);

  const formatStickyTime = (secondsTotal: number) => {
    const mins = Math.floor(secondsTotal / 60);
    const secs = secondsTotal % 60;
    return `${mins.toString().padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`;
  };

  const formatVideoTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkipHero = (e: React.MouseEvent, seconds: number) => {
    e.stopPropagation();
    if (!heroVideoRef.current) return;
    const newTime = Math.max(0, Math.min(heroVideoRef.current.duration || 0, heroVideoRef.current.currentTime + seconds));
    heroVideoRef.current.currentTime = newTime;
    setHeroCurrentTime(newTime);
  };

  const handleProgressClickHero = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!heroVideoRef.current || !heroDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * heroDuration;
    heroVideoRef.current.currentTime = newTime;
    setHeroCurrentTime(newTime);
  };

  // Hero Video Playback Toggles (stop propagation to prevent global gesture handlers)
  const handleToggleHeroPlay = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!heroVideoRef.current) return;
    if (heroPlaying) {
      heroVideoRef.current.pause();
      setHeroPlaying(false);
    } else {
      // Force physical unmute so video sound triggers immediately on user tap
      heroVideoRef.current.muted = false;
      setHeroMuted(false);
      heroVideoRef.current.play().then(() => {
        setHeroPlaying(true);
        window.dispatchEvent(new CustomEvent('app-video-play', { detail: { id: 'hero' } }));
      }).catch((err) => {
        console.log("Hero playback interrupted:", err);
      });
    }
  };

  const handleRedirectToWhatsapp = (device: string) => {
    const isCombo = customerDetails.planName.toLowerCase().includes('combo');
    const planTypeText = isCombo ? "Combo" : "Single";
    
    const message = `👋 Hello Auto Listing Team

Maine aapka Automated Tool successfully purchase kar liya hai.

📋 Purchase Information
━━━━━━━━━━━━━━━━━━━━
👤 Customer Name: ${customerDetails.name}
📱 Mobile Number: ${customerDetails.phone || 'N/A'}
💻 Device: ${device}
📦 Purchased Plan: ${planTypeText}
💰 Amount Paid: ₹${customerDetails.price}
━━━━━━━━━━━━━━━━━━━━

Kindly meri payment verify kar dijiye. Verification complete hone ke baad tool & setup and how to use video bhej dijiye

Agar kisi aur information ki zarurat ho to mujhe batayiye.

Dhanyavaad! 🙏`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodedText}`;
    
    // Redirect current window to WhatsApp
    window.location.href = whatsappUrl;
  };

  if (paymentSuccess) {
    return (
      <div id="download-panel-root" className="min-h-screen w-full relative overflow-x-hidden bg-[#0F172A] text-[#F8FAFC] font-sans selection:bg-[#3B82F6] selection:text-white py-12 md:py-20 flex items-center justify-center animate-fade-in">
        {/* Modern glowing background accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-emerald-950/20 via-slate-900/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full bg-[#1E293B] border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(16,185,129,0.15)] text-center font-sans space-y-6"
          >
            {/* Success badge */}
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-bold text-emerald-400 uppercase tracking-wider mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Purchase Successful</span>
            </motion.div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-snug animate-fade-in">
                Aap Kis Device Me Use Karenge?
              </h3>
              <p className="text-emerald-400 font-mono text-[11px] font-semibold tracking-wider uppercase">
                Device Selection / Device Select Karein
              </p>
              <div className="h-px bg-slate-800 my-1" />
              
              {/* Professional Warning/Info Callout */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-left space-y-2 text-xs">
                <p className="text-amber-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Important Note / ज़रूरी सूचना:
                </p>
                <div className="space-y-1.5 text-gray-300 leading-relaxed font-medium">
                  <p>
                    Aap jis device me tool chalana chahte hain, <span className="text-white font-bold underline decoration-amber-400/50">usi device ko select karein</span>. Har purchase par sirf <span className="text-amber-300 font-bold">1 Single Device</span> ka access generate hoga aur aap kisi doosre device me isse nahi chala payenge.
                  </p>
                  <p className="text-[11px] text-gray-400 italic">
                    (Please select the exact device you will use. Access is limited to only 1 device per purchase and cannot be transferred later.)
                  </p>
                </div>
              </div>

              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed pt-1">
                Device select karke niche green button par click karein aur WhatsApp par code & direct download files lein.
              </p>
            </div>

            {/* Options list */}
            <div className="space-y-3 pt-1">
              {[
                { 
                  id: 'Mobile', 
                  label: '📱 Mobile (Smartphone)', 
                  sub: 'Android ya iPhone par chalane ke liye (To run on smartphone)' 
                },
                { 
                  id: 'PC', 
                  label: '🖥️ PC (Desktop Computer)', 
                  sub: 'Computer me setup karne ke liye (To run on desktop PC)' 
                },
                { 
                  id: 'Laptop', 
                  label: '💻 Laptop', 
                  sub: 'Laptop par extension run karne ke liye (To run on laptop)' 
                }
              ].map((opt, idx) => {
                const isSelected = selectedDevice === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.08, duration: 0.3 }}
                    onClick={() => setSelectedDevice(opt.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
                        : 'bg-slate-900/40 border-slate-800 text-gray-300 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1 leading-normal transition-colors">
                        {opt.sub}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-500' 
                        : 'border-slate-600 bg-transparent'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  handleRedirectToWhatsapp(selectedDevice);
                }}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 border border-emerald-400/20 shadow-lg cursor-pointer transition-all duration-150"
              >
                <MessageSquare className="w-5 h-5 fill-current text-white animate-pulse" />
                <span>Confirm & Get Access on WhatsApp</span>
              </motion.button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-mono">
                <Lock className="w-3.5 h-3.5 text-gray-600" />
                <span>Secure Billing & Verification ID: {paymentOrderId || 'Pending'}</span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div id="landing-page-root" className="min-h-screen w-full relative overflow-x-hidden bg-[#0F172A] text-[#F8FAFC] font-sans selection:bg-[#3B82F6] selection:text-white">
      
      {/* 1. TOP HERO SECTION (MOST IMPORTANT) */}
      <header className="relative pt-2 pb-16 md:pt-4 md:pb-24 overflow-hidden">
        {/* Ambient color blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-900/10 via-sky-900/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-64 right-10 w-80 h-80 bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* Hero Main Grid/Column content */}
          <div className="text-center max-w-4xl mx-auto space-y-6 pt-2">
            
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155] bg-[#1E293B] text-[10px] md:text-xs font-semibold text-[#94A3B8] uppercase tracking-widest font-mono"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6] animate-pulse" />
              Meesho Sellers Special Formula
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-display"
            >
              1-Click <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-400 glow-text-purple">Meesho Auto Listing</span> Tool & Reduce Shipping Charges
            </motion.h1>

            {/* FULL WIDTH CINEMATIC VIDEO PLAYER (16:9) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              onClick={handleToggleHeroPlay}
              className="relative w-full max-w-4xl mx-auto rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_15px_60px_rgba(59,130,246,0.25)] border-2 border-[#334155] bg-[#1E293B] aspect-video group cursor-pointer"
            >
              <video
                ref={heroVideoRef}
                src={`${CONFIG.heroVideoUrl}#t=0.1`}
                poster={CONFIG.heroVideoUrl.replace(/\.mp4$/, '.jpg')}
                preload="auto"
                muted={heroMuted}
                loop
                playsInline
                onTimeUpdate={(e) => setHeroCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setHeroDuration(e.currentTarget.duration)}
                className="w-full h-full object-cover opacity-95 transition-transform duration-500"
              />

              {/* Real-Video highlighted overlay on center play when NOT playing or first loading */}
              {!heroPlaying && (
                <div 
                  onClick={handleToggleHeroPlay}
                  className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-all flex flex-col items-center justify-center gap-3.5 z-25 cursor-pointer animate-fade-in"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] flex items-center justify-center border-2 border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:shadow-[0_0_55px_rgba(59,130,246,0.8)] transition-shadow duration-300 pointer-events-auto"
                  >
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1.5" />
                  </motion.div>
                  <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest font-mono bg-[#1E293B]/95 border border-[#334155] px-4.5 py-2 rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.8)] glow-purple">
                    Click to play tutorial
                  </span>
                </div>
              )}

              {/* Bottom Real Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent z-20 flex flex-col gap-2.5 opacity-100 md:opacity-40 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-300">
                
                {/* 1. Timeline Progress Bar */}
                <div 
                  onClick={handleProgressClickHero}
                  className="relative w-full h-1.5 bg-gray-800/80 rounded-full cursor-pointer group/progress transition-all"
                >
                  {/* Active fill of the timeline */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#3B82F6] via-blue-400 to-[#2563EB] rounded-full"
                    style={{ width: `${heroDuration ? (heroCurrentTime / heroDuration) * 100 : 0}%` }}
                  />
                  {/* Indicator handle */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-400 border border-white shadow-xl transition-all scale-0 group-hover/progress:scale-100"
                    style={{ left: `${heroDuration ? (heroCurrentTime / heroDuration) * 100 : 0}%`, transform: 'translate(-50%, -50%)' }}
                  />
                </div>

                {/* 2. Control Row Buttons */}
                <div className="flex items-center justify-between gap-3 text-white pointer-events-auto">
                  
                  {/* Left controls: Play/Pause, Skip Back, Skip Forward */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    {/* Play/Pause icon button */}
                    <button
                      onClick={handleToggleHeroPlay}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white cursor-pointer hover:scale-105 active:scale-95 duration-150 transition-all shrink-0"
                      title={heroPlaying ? "Pause Video" : "Play Video"}
                    >
                      {heroPlaying ? <Pause className="w-4.5 h-4.5 text-blue-400" /> : <Play className="w-4.5 h-4.5 text-emerald-400 fill-emerald-400" />}
                    </button>

                    {/* Skip -10s */}
                    <button
                      onClick={(e) => handleSkipHero(e, -10)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E293B]/80 hover:bg-[#1E293B] border border-[#334155] text-[10px] md:text-xs font-mono font-bold text-gray-200 cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0"
                      title="Rewind 10s"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>-10s</span>
                    </button>

                    {/* Skip +10s */}
                    <button
                      onClick={(e) => handleSkipHero(e, 10)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E293B]/80 hover:bg-[#1E293B] border border-[#334155] text-[10px] md:text-xs font-mono font-bold text-gray-200 cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0"
                      title="Forward 10s"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>+10s</span>
                    </button>

                    {/* Timer text display */}
                    <div className="text-[10px] sm:text-xs font-mono text-gray-400 font-bold select-none ml-2 shrink-0">
                      {formatVideoTime(heroCurrentTime)} <span className="text-gray-650">/</span> {formatVideoTime(heroDuration)}
                    </div>
                  </div>

                  {/* Right controls: Mute/Unmute toggle */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!heroVideoRef.current) return;
                        const targetMute = !heroMuted;
                        heroVideoRef.current.muted = targetMute;
                        setHeroMuted(targetMute);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white cursor-pointer duration-150 transition-colors"
                      title={heroMuted ? "Unmute" : "Mute"}
                    >
                      {heroMuted ? <VolumeX className="w-4.5 h-4.5 text-red-400 animate-pulse" /> : <Volume2 className="w-4.5 h-4.5 text-emerald-400" />}
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>

            {/* Small Trust Text below Video - Beautifully Placed & Spaced */}
            <div className="flex items-center justify-center gap-2 text-center text-[11px] md:text-sm text-[#94A3B8] font-sans max-w-sm md:max-w-xl mx-auto bg-[#1E293B] border border-[#334155] px-4 py-2 rounded-xl md:rounded-full">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span className="font-medium">Rated <span className="text-[#3B82F6] font-bold">4.9/5</span> stars by active Meesho wholesalers of Surat & Jaipur</span>
            </div>

            {/* Primary Action Call to Action (Instant purchase trigger) */}
            <div ref={heroButtonRef} className="pt-4 max-w-md sm:max-w-lg mx-auto px-1 sm:px-0">
              <motion.button 
                onClick={() => {
                  setPaymentPlan({ name: 'Meesho Instant Listing Pack', price: 199 });
                  setIsPaymentModalOpen(true);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="buy-btn-effect flex w-full h-16 px-4 sm:px-8 rounded-2xl bg-gradient-to-r from-[#3B82F6] via-blue-500 to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-extrabold items-center justify-between gap-3 border border-blue-400/20 cursor-pointer shadow-[0_12px_40px_rgba(59,130,246,0.45)] uppercase tracking-wider font-sans"
              >
                <Zap className="w-5.5 h-5.5 text-yellow-300 animate-pulse fill-yellow-300 shrink-0" />
                <span className="font-extrabold text-center tracking-wide leading-none flex-1 whitespace-nowrap text-[13px] min-[360px]:text-[14px] min-[380px]:text-[15.5px] sm:text-[17px] md:text-lg">BUY TOOL NOW FOR ₹199 ONLY</span>
                <ArrowRight className="w-5.5 h-5.5 text-white/90 shrink-0" />
              </motion.button>
              
              <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-3 mt-5 text-center text-[12px] sm:text-[13px] md:text-sm font-semibold font-sans select-none">
                {/* Badge 1: No Monthly Charges */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 blur-[1px]"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>
                  </span>
                  <span className="text-emerald-400 tracking-wide drop-shadow-[0_0_6px_rgba(16,185,129,0.35)]">No Monthly Charges</span>
                </div>

                <span className="hidden sm:inline text-white/10 select-none font-light">|</span>

                {/* Badge 2: One-Time Payment */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75 blur-[1px]"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fuchsia-400 shadow-[0_0_10px_#e879f9]"></span>
                  </span>
                  <span className="text-fuchsia-400 tracking-wide drop-shadow-[0_0_6px_rgba(232,121,249,0.35)]">One-Time Payment</span>
                </div>

                <span className="hidden sm:inline text-white/10 select-none font-light">|</span>

                {/* Badge 3: Lifetime Access */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 blur-[1px]"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_10px_#f59e0b]"></span>
                  </span>
                  <span className="text-amber-400 tracking-wide drop-shadow-[0_0_6px_rgba(245,158,11,0.35)]">Lifetime Access</span>
                </div>

                <span className="hidden sm:inline text-white/10 select-none font-light">|</span>

                {/* Badge 4: Unlimited Use */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 blur-[1px]"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400 shadow-[0_0_10px_#38bdf8]"></span>
                  </span>
                  <span className="text-sky-400 tracking-wide drop-shadow-[0_0_6px_rgba(56,189,248,0.35)]">Unlimited Use</span>
                </div>

                <span className="hidden sm:inline text-white/10 select-none font-light">|</span>

                {/* Badge 5: Use on Mobile, PC & Laptop */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 blur-[1px]"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-400 shadow-[0_0_10px_#fb923c]"></span>
                  </span>
                  <span className="text-orange-400 tracking-wide drop-shadow-[0_0_6px_rgba(251,146,60,0.35)]">Use on Mobile, PC & Laptop</span>
                </div>

                <span className="hidden sm:inline text-white/10 select-none font-light">|</span>

                {/* Badge 6: 24/7 Support */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 blur-[1px]"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400 shadow-[0_0_10px_#818cf8]"></span>
                  </span>
                  <span className="text-indigo-400 tracking-wide drop-shadow-[0_0_6px_rgba(129,140,248,0.35)]">24/7 Support</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* 2. TRUST BADGES ROW (2x2 on Mobile, Horizontal on Desktop) */}
      <TrustBadges />

      {/* 3. LIVE STATS SECTION ("Numbers Jo Jhooth Nahi Bolte") */}
      <StatsCounter />

      {/* 4. SCREENSHOT / PROOF SLIDER */}
      <ProofSlider />

      {/* 5. BEFORE VS AFTER COMPARISON */}
      <ComparisonTable />

      {/* 6. PROBLEM + SOLUTION SPLIT PANEL */}
      <ProblemSolution />

      {/* 7. REDUCED FEATURES GRID (6 maximum) */}
      <section id="features-section" className="py-20 relative bg-[#0F172A]">
        {/* Glow circle overlay */}
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold text-[#3B82F6] uppercase tracking-widest block mb-2">Core Product Highlights</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white font-display">
              Built to Force <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-400 glow-text-purple">Maximum Sales</span>
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1.5 max-w-md mx-auto">
              Our lightweight script bypasses daily listing constraints and triggers Meesho's lowest delivery weight thresholds.
            </p>
          </div>

          {/* Features Grid */}
          {/* Desktop: 3-column | Tablet: 2-column | Mobile: single-column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/25 transition-all"
            >
              <div className="p-3 rounded-xl bg-[#1E293B] text-[#3B82F6] w-fit mb-4 border border-[#334155]">
                <Cpu className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-bold text-white font-display group-hover:text-[#3B82F6] transition-colors">
                Automated Bulk Listing
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-2 font-sans">
                Upload hundreds of products in minutes. Eliminate manual data entry and list entire collections with ease.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/25 transition-all"
            >
              <div className="p-3 rounded-xl bg-[#1E293B] text-[#3B82F6] w-fit mb-4 border border-[#334155]">
                <Table className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-bold text-white font-display group-hover:text-[#3B82F6] transition-colors">
                Pre-Configured Smart Spreadsheet
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-2 font-sans">
                A highly intuitive, fully set up template. Simply enter your product details and let the automation handle the rest.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/25 transition-all"
            >
              <div className="p-3 rounded-xl bg-[#1E293B] text-[#3B82F6] w-fit mb-4 border border-[#334155]">
                <TrendingDown className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-bold text-white font-display group-hover:text-[#3B82F6] transition-colors">
                Reduce Shipping Charges
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-2 font-sans">
                Apply correct weight and dimension adjustments to legally classify your parcels under the lowest available delivery rate slabs.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/25 transition-all"
            >
              <div className="p-3 rounded-xl bg-[#1E293B] text-[#3B82F6] w-fit mb-4 border border-[#334155]">
                <Smartphone className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-bold text-white font-display group-hover:text-[#3B82F6] transition-colors">
                100% Mobile-Friendly Setup
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-2 font-sans">
                No computer? No problem. Use our specialized mobile bypass template to upload directly from your Android or iOS device.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/25 transition-all"
            >
              <div className="p-3 rounded-xl bg-[#1E293B] text-[#3B82F6] w-fit mb-4 border border-[#334155]">
                <Sparkles className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white font-display group-hover:text-[#3B82F6] transition-colors">
                Step-by-Step Video Guide
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-2 font-sans">
                Includes a simple 7-minute video tutorial in Hindi. Absolutely no coding or technical background required.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/25 transition-all"
            >
              <div className="p-3 rounded-xl bg-[#1E293B] text-[#3B82F6] w-fit mb-4 border border-[#334155]">
                <Clock className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-bold text-white font-display group-hover:text-[#3B82F6] transition-colors">
                Maximize Time & Exposure
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-2 font-sans">
                Save up to 25+ hours of work every week while improving your store's search presence and organic order volume.
              </p>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 8. REVIEWS SECTION (Brought HIGHER on page for high trust conversions) */}
      <section id="reviews-section" className="py-16 relative bg-[#0F172A]">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-900/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-xs font-mono font-bold text-[#3B82F6] uppercase tracking-widest block mb-1">Authentic Seller Feedback</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-display">
              Reviews That Inspire <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 glow-text-purple">Trust</span>
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-sm mx-auto">
              Only 4 real, believable customer quotes with physical verified locations.
            </p>
          </div>

          {/* Reviews Grid (Max 4 reviews) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {REVIEWS.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-panel p-5.5 rounded-2xl relative border-[#334155]/40 hover:border-blue-500/25 duration-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Rating Stars Row */}
                  <div className="flex gap-1 mb-3 text-amber-400">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  {/* Body translation */}
                  <p className="text-xs md:text-sm text-gray-300 font-sans italic leading-relaxed mb-4">
                    "{review.review}"
                  </p>
                </div>

                {/* User avatar / Metadata footer */}
                <div className="flex justify-between items-center pt-3 border-t border-[#334155]">
                  <div className="flex items-center gap-3">
                    <img 
                      src={review.avatar} 
                      alt={review.name} 
                      className="w-10 h-10 rounded-full object-cover border border-[#334155] referrerPolicy shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white font-display">{review.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono">{review.location}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 font-mono">
                    <span className="text-[9px] text-[#22c55e] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      ✓ VERIFIED ORDER
                    </span>
                    <span className="text-[9px] text-gray-500">{review.date}</span>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. COMPACT VIDEO TESTIMONIALS */}
      <VideoReviews />

      {/* 10. SHORT ACCORDION FAQ (Max 6 FAQs) */}
      <FAQSection />

      {/* 11. FINAL PRICING CARD */}
      <PricingCard onBuyClick={(planName, planPrice) => {
        setPaymentPlan({ name: planName, price: planPrice });
        setIsPaymentModalOpen(true);
      }} />

      {/* 12. FOOTER */}
      <footer className="bg-[#0F172A] border-t border-[#334155] py-12 pb-28 md:pb-20 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: Info */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center border border-blue-400/20">
                  <Cpu className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="font-extrabold text-base tracking-tight font-display text-white">
                  Meesho<span className="text-[#3B82F6]">AutoListing</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                The absolute premium digitool automated suite built strictly for smart Meesho vendors wishing to build systematic catalog pipelines and drop delivery slabs legally.
              </p>
            </div>

            {/* Column 2: Quick trust highlights */}
            <div className="space-y-2 text-left">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] font-mono mb-2">Legal Disclaimer</h4>
              <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                This digital tool is designed for optimization and efficiency. We are an independent software helper and are NOT officially endorsed by, affiliated with, or partnered with Meesho Pvt. Ltd. Vendor results vary based on marketplace trends and catalogs content.
              </p>
            </div>

            {/* Column 3: Contact support details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] font-mono">Instant Support</h4>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Need manual setting assistance or direct billing files? Send an email or message on WhatsApp.
              </p>
              
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#3B82F6]">
                  <MessageSquare className="w-4 h-4" />
                  <a href={`https://wa.me/91${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    WhatsApp: +91 {whatsappNumber}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-[#3B82F6]">
                  <Layers className="w-4 h-4" />
                  <span>Support: {CONFIG.supportEmail}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Copyright bar */}
          <div className="mt-8 pt-6 border-t border-[#334155]/40 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 font-mono">
            <span>© 2026 Meesho AutoListing Automation Suites. All Rights Saved.</span>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => setActiveModal('privacy')}
                className="hover:text-[#3B82F6] transition-colors cursor-pointer bg-transparent border-none text-[10px] font-mono text-gray-400 font-medium"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button 
                onClick={() => setActiveModal('terms')}
                className="hover:text-[#3B82F6] transition-colors cursor-pointer bg-transparent border-none text-[10px] font-mono text-gray-400 font-medium"
              >
                Terms of Service
              </button>
              <span>•</span>
              <button 
                onClick={() => setActiveModal('refund')}
                className="hover:text-[#3B82F6] transition-colors cursor-pointer bg-transparent border-none text-[10px] font-mono text-gray-400 font-medium"
              >
                Refund Policy
              </button>
              <span>•</span>
              <button 
                onClick={() => setActiveModal('shipping')}
                className="hover:text-[#3B82F6] transition-colors cursor-pointer bg-transparent border-none text-[10px] font-mono text-gray-400 font-medium"
              >
                Shipping & Delivery
              </button>
              <span>•</span>
              <button 
                onClick={() => setActiveModal('support')}
                className="hover:text-[#3B82F6] transition-colors cursor-pointer bg-transparent border-none text-[10px] font-mono text-gray-400 font-medium"
              >
                Contact Support Help
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* 13. STICKY BUY BAR (Bottom centered glass bar desktop, pill mobile) */}
      <div 
        className={`fixed bottom-4 left-0 right-0 mx-auto z-45 w-[92%] max-w-sm sm:max-w-lg md:max-w-xl px-1 transition-all duration-300 ${!isHeroButtonVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-10 pointer-events-none"}`}
      >
        <div className="w-full glass-panel-heavy p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-blue-500/20 flex items-center justify-between gap-3 sm:gap-4 pointer-events-auto">
          
          {/* Left info */}
          <div className="text-left font-sans pl-1 sm:pl-2 select-none min-w-0 flex-1">
            <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-red-400 tracking-wider font-mono animate-pulse uppercase flex items-center gap-1 sm:gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping shrink-0" />
              <span className="truncate">OFFER Closes: {formatStickyTime(stickyTimeLeft)}</span>
            </div>
            
            <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg md:text-2xl font-black text-white font-display">
                {CONFIG.currency}{CONFIG.discountedPrice}
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 line-through font-mono">
                {CONFIG.currency}{CONFIG.originalPrice}
              </span>
            </div>
          </div>

          {/* Right Action CTA Button */}
          <button
            onClick={() => {
              setPaymentPlan({ name: 'Meesho Instant Listing Pack', price: 199 });
              setIsPaymentModalOpen(true);
            }}
            className="buy-btn-effect h-10 sm:h-11 md:h-13 px-3 sm:px-5 md:px-6 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-extrabold text-[10px] sm:text-xs md:text-sm flex items-center gap-1.5 sm:gap-2 border border-blue-400/20 shadow-md cursor-pointer uppercase tracking-wider font-display shrink-0 transition-transform hover:scale-[1.02]"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse shrink-0" />
            <span>Buy Now</span>
            <ArrowRight className="w-4 h-4 hidden sm:inline shrink-0" />
          </button>

        </div>
      </div>

      {/* Live Sales Social Proof Toast Notification Component */}
      <LiveSalesNotification isStickyVisible={!isHeroButtonVisible} />

      {/* 15. COMPLIANCE MODALS (PRIVACY, TERMS, SUPPORT HELP) */}
      <AnimatePresence>
        {activeModal && (
          <div id="compliance-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-panel-heavy rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(59,130,246,0.25)] border border-[#334155] text-left font-sans"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-[#1E293B] border border-[#334155] text-gray-400 hover:text-white hover:bg-[#3B82F6] transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <span className="text-sm font-bold font-mono">✕</span>
              </button>

              {activeModal === 'privacy' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-white font-display flex items-center gap-2 border-b border-[#334155] pb-3">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                    Privacy Policy
                  </h3>
                  <div className="text-xs md:text-sm text-gray-300 space-y-3.5 leading-relaxed">
                    <p>
                      <strong>Effective Date:</strong> July 6, 2026
                    </p>
                    <p>
                      Welcome to Meesho AutoListing Automation Suites (operated by <strong>Sk Ali Asgar</strong>). We respect your privacy and are committed to protecting your personal data. This privacy policy outlines how we handle information to make your automation experience fast, safe, and secure.
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      1. Information We Collect
                    </p>
                    <p>
                      We collect basic personal information to handle your registration and transaction through our partner Cashfree:
                      <br />• <strong>Personal Information:</strong> Name, Email Address, Contact/WhatsApp Phone Number, and Billing Details.
                      <br />• <strong>Non-Personal Data:</strong> IP Address, browser type, cookies, and standard session details.
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      2. Client Data Security (Absolute Local Sandbox)
                    </p>
                    <p>
                      Our 1-Click Excel script and bulk automation tools run strictly local inside your own browser tab or secure sheets. 
                      We <strong>DO NOT</strong> collect, store, transmit, or share your Meesho Seller credentials, catalog descriptions, passwords, shop keys, or invoice details. All automation processes are 100% server-isolated and client-confined.
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      3. Secured Payment Processing (Cashfree Gateway)
                    </p>
                    <p>
                      All checkout transactions are processed via our verified secure payment partner gateway, <strong>Cashfree Payments</strong>. Your transaction, card details, or UPI information are fully encrypted using SSL with AES-256 standards. We never store credit cards, UPI codes, or bank passwords inside our server environments.
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      4. WhatsApp & Customer Support Interactions
                    </p>
                    <p>
                      When you contact our active customer help hotline, we use your phone number and name solely to dispatch setup credentials, manual backup templates, and offer troubleshooting guides. We strictly never sell or rent your contact details to third parties.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === 'terms' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-white font-display flex items-center gap-2 border-b border-[#334155] pb-3">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                    Terms of Service / Conditions of Use
                  </h3>
                  <div className="text-xs md:text-sm text-gray-300 space-y-3.5 leading-relaxed">
                    <p>
                      <strong>Effective Date:</strong> July 6, 2026
                    </p>
                    <p>
                      This website is owned and operated by <strong>Sk Ali Asgar</strong>, Haldia, Purba Medinipur, West Bengal, India, PIN: 721628. By browsing or purchasing from our platform, you agree to comply with the following simple terms and conditions of use.
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      1. Lifetime Personal Use License
                    </p>
                    <p>
                      Your one-time fee of ₹199 entitles you to a single-seat personal license for your designated seller accounts. You are strictly forbidden from copying, distributing, cracking, selling, or modifying the sheets code or automation binaries to secondary users.
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      2. Companion Productivity Tool Disclaimer
                    </p>
                    <p>
                      This automation tool serves strictly as a high-speed productivity helper to compile and submit catalogs faster. High-volume uploads should be supervised closely by vendor operators. We make every effort to optimize code algorithms, but the ultimate marketplace sales performance relies on your product quality, trends, and compliance with respective marketplace terms. The tool is provided "as is" without warranty of any kind.
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      3. Instant Digital Fulfilment & Payments
                    </p>
                    <p>
                      All prices listed on our platform are in Indian Rupees (INR). Payments must be cleared via our secure gateway Cashfree. Because our product is fully electronic (Google Sheets templates, coding macros, and video guides), links are dispatched instantly upon successful payment.
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      4. Governing Law & Jurisdiction
                    </p>
                    <p>
                      These Terms of Service and any separate agreements shall be governed by and construed in accordance with the laws of India. Any disputes or claims arising out of this website shall be subject to the exclusive jurisdiction of the competent courts in <strong>Haldia, West Bengal, India</strong>.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === 'refund' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-white font-display flex items-center gap-2 border-b border-[#334155] pb-3">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                    Refund, Cancellation & Return Policy
                  </h3>
                  <div className="text-xs md:text-sm text-gray-300 space-y-3.5 leading-relaxed">
                    <p>
                      <strong>Effective Date:</strong> July 6, 2026
                    </p>
                    <p>
                      At Meesho AutoListing Automation Suites, we strive to maintain transparency. Since our product suite is 100% digital, we have designed the following balanced refund policy:
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      1. Cancellation Policy
                    </p>
                    <p>
                      Cancellations are accepted only prior to downloading or receiving the files on your email or phone. Once the digital download link is clicked or files are generated and dispatched to your email, the transaction cannot be cancelled.
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      2. Refund Eligibility & Support Guarantee
                    </p>
                    <p>
                      We want you to be fully successful. If you face any technical difficulties, setup lags, or device compatibility errors after purchase:
                      <br />• You must contact our customer support desk on WhatsApp (<strong>+91 6295429762</strong>) or email (<strong>ska80ali@gmail.com</strong>).
                      <br />• Our engineering team will assist you to set up the tool or provide manual customized configuration sheets matching your device within 24-48 hours.
                      <br />• In the rare scenario that our support specialists cannot resolve the technical problem and the tool remains completely unusable on your specified device, a <strong>full refund of ₹199</strong> will be approved immediately.
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      3. Refund Processing & Timelines
                    </p>
                    <p>
                      Once approved, refund transactions are processed back to the original source of payment (UPI, Netbanking, or Debit/Credit Card) through our payment processor Cashfree.
                      <br />• The refunded amount will typically reflect in your bank account or card statement within <strong>5 to 7 working days</strong>, as per standard banking channel settlement times.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === 'shipping' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-white font-display flex items-center gap-2 border-b border-[#334155] pb-3">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                    Shipping & Delivery Policy
                  </h3>
                  <div className="text-xs md:text-sm text-gray-300 space-y-3.5 leading-relaxed">
                    <p>
                      <strong>Effective Date:</strong> July 6, 2026
                    </p>
                    <p>
                      All products and services sold on Meesho AutoListing Automation Suites are 100% digital, virtual software sheets, instructions, and video packages. <strong>No physical delivery or courier shipment is required.</strong>
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      1. Delivery Mechanism
                    </p>
                    <p>
                      • <strong>Instant Web Redirect:</strong> Immediately after completing payment via Cashfree, our secure billing system will redirect you automatically to our high-speed secure download page inside 2 seconds.
                      <br />• <strong>Automatic Email Delivery:</strong> A confirmation email enclosing download credentials, setup files, and video tutorial links is dispatched to your registered billing email within <strong>5 to 10 minutes</strong>.
                      <br />• <strong>WhatsApp Backup:</strong> A backup link with manual templates is also sent to your registered billing WhatsApp contact number automatically.
                    </p>
                    <p className="font-bold text-[#3B82F6]">
                      2. Delayed Delivery Handling
                    </p>
                    <p>
                      If you do not receive the email or WhatsApp message within 10 minutes due to unexpected network congestion or incorrect email/phone entry, please contact us at <strong>ska80ali@gmail.com</strong> or WhatsApp us directly at <strong>+91 6295429762</strong>. Our specialized support operator will manually handload and send the files to you directly within 1 hour.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === 'support' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-white font-display flex items-center gap-2 border-b border-[#334155] pb-3">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                    Contact Us / Help Center
                  </h3>
                  <div className="text-xs md:text-sm text-gray-300 space-y-4 leading-relaxed">
                    <p>
                      Need immediate help, customized sheets, or have any pre-purchase billing questions? Our helpdesk is active to serve you inside 15 minutes!
                    </p>
                    
                    <div className="glass-panel p-4 rounded-xl border-[#334155] space-y-3 bg-[#1E293B]">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <MessageSquare className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-mono">Immediate WhatsApp Support</p>
                          <a href={`https://wa.me/91${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-bold text-white hover:underline hover:text-emerald-300 transition-colors break-all">
                            WhatsApp: +91 {whatsappNumber}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-500/20 text-[#3B82F6]">
                          <Layers className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-mono">Support Email ID</p>
                          <a href={`mailto:${CONFIG.supportEmail}`} className="text-xs sm:text-sm font-bold text-white hover:underline hover:text-blue-300 transition-colors break-all">
                            {CONFIG.supportEmail}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-500/20 text-[#3B82F6] mt-0.5">
                          <Lock className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-mono">Full Business Address</p>
                          <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                            Sk Ali Asgar, Haldia, Purba Medinipur, West Bengal, PIN: 721628, India
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 font-mono">
                      *Operating Support Hours: <strong>Daily 09:00 AM to 10:00 PM (IST)</strong>. Standard response time is under 15 minutes.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-[#334155] text-center">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2 rounded-xl bg-[#3B82F6] text-white font-bold text-xs hover:bg-[#2563EB] cursor-pointer"
                >
                  Close Window
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment gateway Form Modal Overlay */}
      <PaymentFormModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        planName={paymentPlan.name}
        planPrice={paymentPlan.price}
      />

      {/* Payment Failure Toast Indicator */}
      <AnimatePresence>
        {paymentSuccess === false && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 z-50 max-w-md p-4 rounded-2xl bg-red-950 border-2 border-red-500/40 shadow-2xl flex gap-3.5 items-start text-left"
          >
            <div className="p-2 rounded-full bg-red-500/10 text-red-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">Payment Cancelled or Failed</h4>
              <p className="text-xs text-gray-300 leading-normal">
                Koi baat nahi! Aap fir se try kar sakte hain. Agar transaction cancel hua ya failure dikha rha h, to direct WhatsApp par connect karke UPI QR code through direct safe list update buy kar sakte hain.
              </p>
              <div className="flex gap-3 pt-1.5">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#3B82F6] text-white font-bold text-[10px] uppercase tracking-wider transition-all duration-150"
                >
                  Retry Payment
                </button>
                <button
                  onClick={() => setPaymentSuccess(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-gray-400 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all duration-150"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
