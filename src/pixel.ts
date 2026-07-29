// Facebook Pixel Utility for React SPA (Single Page Application)
// This prevents duplicate firing and ensures accurate tracking.

export const PIXEL_ID = "1752414386118648"; // New Pixel ID

export const generateEventId = () => {
  return 'evt_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
};

export const getFbp = () => {
  const match = document.cookie.match(/(^| )_fbp=([^;]+)/);
  return match ? match[2] : undefined;
};

export const getFbc = () => {
  const match = document.cookie.match(/(^| )_fbc=([^;]+)/);
  return match ? match[2] : undefined;
};

const sendToCAPI = async (eventName: string, eventId: string, customData: any = {}, userData: any = {}) => {
  try {
    await fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        eventUrl: window.location.href,
        userData: {
          fbp: getFbp(),
          fbc: getFbc(),
          ...userData
        },
        customData
      })
    });
  } catch (e) {
    console.error('CAPI fetch failed', e);
  }
};

export const initPixel = () => {
  if (!PIXEL_ID) return;
  
  // Prevent duplicate initialization
  if ((window as any).fbq) return;

  // Standard Facebook Pixel Snippet
  (function (f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js', undefined, undefined, undefined
  );

  (window as any).fbq('init', PIXEL_ID);
};

export const trackPageView = () => {
  if (!PIXEL_ID || !(window as any).fbq) return;
  const eventId = generateEventId();
  // Ensure we only fire PageView when intentionally called
  (window as any).fbq('track', 'PageView', {}, { eventID: eventId });
  sendToCAPI('PageView', eventId);
};

export const trackInitiateCheckout = (value: number, currency: string = 'INR', userData: any = {}) => {
  if (!PIXEL_ID || !(window as any).fbq) return;
  const eventId = generateEventId();
  const customData = { value: value, currency: currency };
  (window as any).fbq('track', 'InitiateCheckout', customData, { eventID: eventId });
  sendToCAPI('InitiateCheckout', eventId, customData, userData);
};

export const trackPurchase = (value: number, currency: string = 'INR', transactionId?: string, userData: any = {}) => {
  if (!PIXEL_ID || !(window as any).fbq) return;
  const eventId = generateEventId();
  const customData = {
    value: value,
    currency: currency,
    content_name: 'Meesho Auto Listing Tool',
    ...(transactionId && { transaction_id: transactionId }),
  };
  (window as any).fbq('track', 'Purchase', customData, { eventID: eventId });
  sendToCAPI('Purchase', eventId, customData, userData);
};
