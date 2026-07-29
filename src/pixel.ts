export const PIXEL_ID = '1752414386118648';

export const initPixel = () => {
  if (typeof window === 'undefined') return;
  if ((window as any).fbq) return;

  const w = window as any;
  const fbq = (w.fbq = function () {
    fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
  });
  if (!w._fbq) w._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  fbq('init', PIXEL_ID);
};

export const trackPageView = () => {
  if (typeof window === 'undefined') return;
  const fbq = (window as any).fbq;
  if (fbq) {
    fbq('track', 'PageView');
  }
};

export const trackViewContent = () => {
  if (typeof window === 'undefined') return;
  const fbq = (window as any).fbq;
  if (fbq) {
    fbq('track', 'ViewContent');
  }
};

export const trackInitiateCheckout = (value: number, currency: string = 'INR', eventId?: string) => {
  if (typeof window === 'undefined') return;
  const fbq = (window as any).fbq;
  if (fbq) {
    fbq('track', 'InitiateCheckout', {
      value,
      currency,
    }, { eventID: eventId });
  }
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
