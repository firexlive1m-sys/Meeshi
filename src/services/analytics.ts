export const initMetaPixel = () => {
  const pixelId = "1752414386118648";
  if (!pixelId) return;

  if (typeof window !== 'undefined') {
    const w = window as any;
    if (w.fbq) return;
    const n = w.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!w._fbq) w._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    const t = document.createElement('script');
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    
    t.onload = () => console.log("✅ Meta Pixel Script Loaded Successfully.");
    t.onerror = () => console.error("❌ Meta Pixel Script Failed to Load. Please disable Adblockers (Brave Shields, uBlock, etc).");
    
    document.head.appendChild(t);

    w.fbq('init', pixelId);
    console.log("✅ Meta Pixel Initialized with ID:", pixelId);
  }
};

export const trackPageView = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
    console.log("✅ Fired Meta Pixel PageView");
  } else {
    console.warn("⚠️ Meta Pixel not ready for PageView (Adblocker active?)");
  }
};

export const trackInitiateCheckout = (value: number, currency: string = 'INR') => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'InitiateCheckout', {
      value,
      currency
    });
    console.log("✅ Fired Meta Pixel InitiateCheckout:", value, currency);
  }
};

export const trackPurchase = (data: {
  value: number;
  currency: string;
  email: string;
  phone: string;
  first_name: string;
  external_id: string; // order_id
  event_id: string; // same order_id
}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('init', "1752414386118648", {
      em: data.email.toLowerCase(),
      ph: data.phone,
      fn: data.first_name,
      external_id: data.external_id
    });
    
    (window as any).fbq('track', 'Purchase', {
      value: data.value,
      currency: data.currency,
      content_type: 'product',
      content_name: 'Meesho AutoListing Automation Suite'
    }, {
      eventID: data.event_id
    });
    console.log("✅ Fired Meta Pixel Purchase:", data.value, data.currency);
  }
};
