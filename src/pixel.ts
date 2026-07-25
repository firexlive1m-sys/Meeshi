// Facebook Pixel Utility for React SPA (Single Page Application)
// This prevents duplicate firing and ensures accurate tracking.

export const PIXEL_ID = "1019973664292439"; // New Pixel ID

export const initPixel = () => {
  if (!PIXEL_ID) return;
  
  // Prevent duplicate initialization
  if ((window as any).fbq) return;

  // Standard Facebook Pixel Snippet
  !(function (f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
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
    'https://connect.facebook.net/en_US/fbevents.js'
  );

  (window as any).fbq('init', PIXEL_ID);
};

export const trackPageView = () => {
  if (!PIXEL_ID || !(window as any).fbq) return;
  // Ensure we only fire PageView when intentionally called
  (window as any).fbq('track', 'PageView');
};

export const trackInitiateCheckout = (value: number, currency: string = 'INR') => {
  if (!PIXEL_ID || !(window as any).fbq) return;
  (window as any).fbq('track', 'InitiateCheckout', {
    value: value,
    currency: currency,
  });
};

export const trackPurchase = (value: number, currency: string = 'INR', transactionId?: string) => {
  if (!PIXEL_ID || !(window as any).fbq) return;
  (window as any).fbq('track', 'Purchase', {
    value: value,
    currency: currency,
    content_name: 'Meesho Auto Listing Tool',
    ...(transactionId && { transaction_id: transactionId }),
  });
};
