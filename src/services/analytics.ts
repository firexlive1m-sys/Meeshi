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
    t.async = !0;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const s = document.getElementsByTagName('script')[0];
    if (s && s.parentNode) s.parentNode.insertBefore(t, s);

    w.fbq('init', pixelId);
  }
};

export const trackPageView = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

export const trackInitiateCheckout = (value: number, currency: string = 'INR') => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'InitiateCheckout', {
      value,
      currency
    });
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
    // We can also set advanced matching right before firing the event
    // To help with deduplication, pass the eventID in the third argument
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
  }
};
