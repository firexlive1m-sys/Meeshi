import { Testimonial, VideoReview, FAQItem, ScreenshotSlide, FeatureItem } from './types';

// ==========================================
// GLOBAL CONFIGURATION (EASY TO EDIT)
// ==========================================
export const CONFIG = {
  // Global CTA Redirect URL
  // Just change this once to update all buttons on the page!
  ctaRedirectUrl: "https://superprofile.bio/vp/meesho-auto-listing---low-shipping-tool?checkout=true", 

  // Support details
  whatsappNumber: "6295429762",
  supportEmail: "ska80ali@gmail.com",

  // Pricing details
  originalPrice: 1999,
  discountedPrice: 199,
  currency: "₹",
  
  // Hero Video URL (Direct MP4 URL or embedded looping content)
  // We provide a premium fallback background loop by default, but it can be changed to any MP4 link.
  heroVideoUrl: "https://res.cloudinary.com/dutdmkrhc/video/upload/v1781288334/InShot_20260525_212334170_de2rkp_kdf2ho.mp4",
  
  // YouTube Backup ID if they want to use a YouTube embed instead of HTML5 video
  youtubeId: "", // e.g. "dQw4w9WgXcQ"
};

// ==========================================
// LANDING PAGE SECTIONS CONTENT
// ==========================================

export const TRUST_BADGES = [
  { id: '1', title: "Instant Access", desc: "Get your download link immediately after purchase", icon: "Zap" },
  { id: '2', title: "Secure Payment", desc: "Supports UPI, Cards, and Net Banking", icon: "ShieldCheck" },
  { id: '3', title: "Lifetime Access", desc: "One-time purchase, no monthly subscription", icon: "Award" },
  { id: '4', title: "Mobile Friendly", desc: "Works seamlessly on phones and laptops", icon: "Smartphone" }
];

export const STATS = [
  { id: '1', value: 14200, suffix: "+", label: "Total Listings Uploaded", icon: "Layers" },
  { id: '2', value: 1850, suffix: "+", label: "Active Meesho Sellers Using This Tool", icon: "Users" },
  { id: '3', value: 98, suffix: "%", label: "Seller Satisfaction Rate", icon: "TrendingUp" },
  { id: '4', value: 4.5, suffix: " Hrs", label: "Daily Time Saved Per Seller", icon: "Clock" }
];

export const SCREENSHOT_SLIDES: ScreenshotSlide[] = [
  {
    id: "slide-1",
    title: "1-Click Bulk Auto Listing Panel",
    description: "Upload up to 500 catalog items simultaneously. Automatically pre-fills product descriptions, dimensions, GST rates, and optimized search keywords.",
    imageUrl: "https://i.ibb.co/jZ44n77q/6091285828404448992.jpg"
  },
  {
    id: "slide-2",
    title: "Low Shipping Pricing Custom Engine",
    description: "Our optimization formula in action. It sets Meesho weight parameters accurately to secure the lowest possible shipping tier legally.",
    imageUrl: "https://i.ibb.co/k6DY8KSJ/6091285828404448990.jpg"
  },
  {
    id: "slide-3",
    title: "Dynamic Smart Orders Monitor Dashboard",
    description: "Track the immediate boost in listings impressions. Watch traffic and orders grow steadily inside your official seller panel.",
    imageUrl: "https://i.ibb.co/dqq928L/6091285828404448991.jpg"
  }
];

export const COMPARISONS = [
  {
    criteria: "Listings per Day",
    withoutTool: "Max 5 - 10 Listings (Manual)",
    withTool: "Unlimited (500+ in 1-Click)",
    highlight: true
  },
  {
    criteria: "Average Time Required",
    withoutTool: "3 to 4 hours of tedious manual typing",
    withTool: "Less than 5 minutes",
    highlight: true
  },
  {
    criteria: "Shipping Rates Slab",
    withoutTool: "₹79 - ₹120 standard rates",
    withTool: "₹35 - ₹45 (Reduce Shipping Charges Applied)",
    highlight: true
  },
  {
    criteria: "Device Compatibility",
    withoutTool: "Desktop computer required for templates",
    withTool: "Works on both Mobile & Laptop",
    highlight: false
  },
  {
    criteria: "Tech Knowledge",
    withoutTool: "Requires advanced Excel & listing skills",
    withTool: "Simple copy-paste (100% Beginner Friendly)",
    highlight: false
  },
  {
    criteria: "Software Updates",
    withoutTool: "Extra fees whenever regulations change",
    withTool: "Lifetime free automated updates",
    highlight: false
  }
];

export const PROBLEMS_SOLUTIONS = {
  title: "Overcome Common Seller Pitfalls and Maximize Your Growth",
  problems: [
    { title: "Manual Listing Burnout", desc: "Manually typing titles, tags, and uploading photos for multiple colors and sizes takes hours of effort." },
    { title: "High Shipping Charges", desc: "Inaccurate package weights increase shipping rates, leading to abandoned carts and low conversions." },
    { title: "Low Catalog Visibility", desc: "Creating a few manual listings makes it difficult to get noticed by the Meesho recommendation algorithm." }
  ],
  solutions: [
    { title: "1-Click Auto Listing Tool", desc: "Our bulk tool automatically processes catalog directories and uploads listings in seconds, saving you days of work." },
    { title: "Optimized Weight Slabs", desc: "Accurately calibrate package weights and dimensional parameters to trigger Meesho's lowest local shipping slabs (₹35-₹45)." },
    { title: "Algorithmic Visibility Boost", desc: "Consistently scale your catalog volume to trigger algorithmic recommendation points and boost organic search ranking." }
  ]
};

export const FEATURES: FeatureItem[] = [
  {
    id: "f1",
    title: "Automated Bulk Listing",
    description: "Upload hundreds of products in minutes. Eliminate manual data entry and list entire collections with ease.",
    icon: "Cpu"
  },
  {
    id: "f2",
    title: "Pre-Configured Smart Spreadsheet",
    description: "A highly intuitive, fully set up template. Simply enter your product details and let the automation handle the rest.",
    icon: "Table"
  },
  {
    id: "f3",
    title: "Reduce Shipping Charges",
    description: "Apply correct weight and dimension adjustments to legally classify your parcels under the lowest available delivery rate slabs.",
    icon: "TrendingDown"
  },
  {
    id: "f4",
    title: "100% Mobile-Friendly Setup",
    description: "No computer? No problem. Use our specialized mobile bypass template to upload directly from your Android or iOS device.",
    icon: "Smartphone"
  },
  {
    id: "f5",
    title: "Step-by-Step Video Guide",
    description: "Includes a simple 7-minute video tutorial in Hinglish. Absolutely no coding or technical background required.",
    icon: "Sparkles"
  },
  {
    id: "f6",
    title: "Maximize Time & Exposure",
    description: "Save up to 25+ hours of work every week while improving your store's search presence and organic order volume.",
    icon: "Clock"
  }
];

export const REVIEWS: Testimonial[] = [
  {
    id: "r1",
    name: "Sunil Sharma",
    location: "Surat, Gujarat",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    date: "2 Days ago",
    review: "Surat cloth seller hu aur pehle manual catalog dalte sir dard ho jata tha. This tool is life saving! Ek click me automatic listings create ho jati hai. Best part is the low shipping method - delivery rates ₹41 per piece ho gye!",
    verified: true
  },
  {
    id: "r2",
    name: "Pooja Mehta",
    location: "Jaipur, Rajasthan",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    date: "Yesterday",
    review: "Actually skeptical thi but ₹199 value is nothing compared to daily time savings. Mobile me setup clear hai, videos simplified hai. Highly recommended to beginners who don't want to hire listing managers.",
    verified: true
  },
  {
    id: "r3",
    name: "Mohammad Yusuf",
    location: "Mumbai, Maharashtra",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    date: "4 Days ago",
    review: "Ordered more than 50 catalogs listings using the bulk script in 15 minutes. Low shipping formula actually worked. My listing shipping cost dropped from ₹85 to ₹39. Conversions increase 3x times next week itself! Value for money.",
    verified: true
  },
  {
    id: "r4",
    name: "Anjali Verma",
    location: "New Delhi, Delhi",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    date: "1 Week ago",
    review: "Outstanding customer service as well! I messaged them on WhatsApp via the button and got support setup help within 10 minutes. Extremely trustworthy brand, do not hesitate 🌟",
    verified: true
  }
];

export const VIDEO_REVIEWS: VideoReview[] = [
  {
    id: "v1",
    name: "Rahul Verma (Meesho Master)",
    role: "Rs. 4.5 Lakhs Monthly Profit Seller",
    thumbnail: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=600&q=80",
    videoUrl: "https://res.cloudinary.com/ddkdxc1lj/video/upload/v1779724680/InShot_20260525_211127373_wjvbit.mp4"
  },
  {
    id: "v2",
    name: "Simran K. (Handicraft Vendor)",
    role: "Jaipur Boutique Owner",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80",
    videoUrl: "https://res.cloudinary.com/ddkdxc1lj/video/upload/v1779724689/InShot_20260525_211250193_qokyly.mp4"
  }
];

export const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "Is this tool suitable for beginners?",
    answer: "Absolutely! The tool is designed to be highly intuitive, and the video guides explain everything step-by-step in easy Hinglish. You don't need any coding experience, complex Excel skills, or technical knowledge. It is as simple as copying and pasting."
  },
  {
    id: "faq-2",
    question: "Does it work on Android and iOS mobile phones?",
    answer: "Yes! While many high-volume sellers prefer using a computer, we have created a specialized mobile-optimized template for Google Sheets. This allows you to set up and manage your bulk auto listings directly from your smartphone."
  },
  {
    id: "faq-3",
    question: "How do I access the tool after payment?",
    answer: "Immediately after your payment is completed, you will be automatically redirected to a secure download page in under 2 seconds. From there, you can download the tool with a single click and watch the step-by-step Hinglish video guide instantly. Additionally, we will instantly send backup download links and support info to your email address and WhatsApp number."
  },
  {
    id: "faq-4",
    question: "Are updates included, or is there a monthly subscription fee?",
    answer: "There are absolutely no monthly subscription fees or recurring costs. Your one-time purchase of ₹199 unlocks lifetime access, which includes all future optimization updates and versions free of charge."
  },
  {
    id: "faq-5",
    question: "How does the Shipping Charge Reduction method work?",
    answer: "This method is 100% compliant and safe. It does not violate any Meesho Vendor Terms of Service. It adjusts specific catalog packing weights and dimensional parameters within official rules to ensure Meesho automatically places your listings into the lowest shipping weight slabs (saving you ₹40-₹70 per parcel)."
  },
  {
    id: "faq-6",
    question: "How long does it take to see results?",
    answer: "Most sellers set up and launch their first bulk catalog within 25 minutes of downloading the tool. Because Meesho's algorithm favors consistent product volume, sellers typically see a noticeable rise in listing impressions and initial orders within 24 to 48 hours."
  },
  {
    id: "faq-7",
    question: "Which payment methods are supported?",
    answer: "We support all major payment methods, including Google Pay, PhonePe, Paytm, other UPI apps, Net Banking, and Debit/Credit cards. All transactions are handled securely and instantly."
  }
];
