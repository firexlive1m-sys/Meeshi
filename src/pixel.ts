export const PIXEL_ID = '1752414386118648';

let pixelInitialized = false;

export const initPixel = () => {
  if (typeof window === 'undefined') return;
  if (pixelInitialized) return;

  const w = window as any;
  if (!w.fbq) {
    const n = (w.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!w._fbq) w._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
  }

  if (!document.getElementById('fb-pixel-script')) {
    const script = document.createElement('script');
    script.id = 'fb-pixel-script';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  w.fbq('init', PIXEL_ID);
  pixelInitialized = true;
};

const safeTrack = (eventName: string, data?: any, eventData?: any) => {
  if (typeof window === 'undefined') return;
  try {
    initPixel(); // Guarantee it's initialized before tracking
    const w = window as any;
    if (w.fbq) {
      if (data && eventData) {
        w.fbq('track', eventName, data, eventData);
      } else if (data) {
        w.fbq('track', eventName, data);
      } else {
        w.fbq('track', eventName);
      }
      console.log(`[Meta Pixel] Fired ${eventName}`, data || '');
    }
  } catch (err) {
    console.warn(`[Meta Pixel] Failed to fire ${eventName}:`, err);
  }
};

export const trackPageView = () => {
  safeTrack('PageView');
};

export const trackViewContent = () => {
  safeTrack('ViewContent');
};

export const trackInitiateCheckout = (value: number, currency: string = 'INR', eventId?: string) => {
  safeTrack('InitiateCheckout', {
    value,
    currency,
  }, eventId ? { eventID: eventId } : undefined);
};

export const getFbp = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(^| )_fbp=([^;]+)/);
  return match ? match[2] : null;
};

export const getFbc = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(^| )_fbc=([^;]+)/);
  return match ? match[2] : null;
};
