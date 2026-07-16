/**
 * Meta Pixel Utility for Conversion Tracking
 * Pixel ID: 1752414386118648
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

const PIXEL_ID = "1752414386118648";

/**
 * Dynamically loads and initializes the Meta Pixel script.
 * Fired globally once on application mount.
 */
export const initMetaPixel = () => {
  if (typeof window === "undefined") return;

  // Prevent duplicate load
  if (window.fbq) {
    console.log("Meta Pixel already initialized.");
    return;
  }

  /* eslint-disable */
  // Standard Meta Pixel initialization script
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
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
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  // Initialize
  if (window.fbq) {
    window.fbq("init", PIXEL_ID);
    console.log(`Meta Pixel initialized with ID: ${PIXEL_ID}`);
  }
};

/**
 * Tracks standard PageView event.
 */
export const trackPageView = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
};

/**
 * Tracks ViewContent when the user views the product page.
 */
export const trackViewContent = (productName: string, price: number) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: productName,
      content_category: "Listing Tools",
      content_ids: ["meesho_instant_listing_pack"],
      content_type: "product",
      value: price,
      currency: "INR"
    });
  }
};

/**
 * Tracks InitiateCheckout when user opens the payment modal or starts purchasing.
 */
export const trackInitiateCheckout = (productName: string, price: number) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_name: productName,
      content_ids: ["meesho_instant_listing_pack"],
      content_type: "product",
      value: price,
      currency: "INR",
      num_items: 1
    });
  }
};

/**
 * Tracks Purchase event after a successful payment transaction.
 * Strictly checks localStorage to ensure it is fired EXACTLY once per Order ID.
 */
export const trackPurchase = (orderId: string, productName: string, price: number) => {
  if (typeof window === "undefined" || !window.fbq) return;

  const cleanOrderId = orderId || "unknown_order";
  const storageKey = `fb_pixel_purchase_fired_${cleanOrderId}`;

  // Check if this purchase has already been tracked
  if (localStorage.getItem(storageKey)) {
    console.log(`Purchase event already tracked for Order ID: ${cleanOrderId}. Skipping duplicate.`);
    return;
  }

  // Fire the Purchase event
  window.fbq("track", "Purchase", {
    value: price,
    currency: "INR",
    content_ids: ["meesho_instant_listing_pack"],
    content_type: "product",
    num_items: 1,
    content_name: productName,
    order_id: cleanOrderId
  });

  // Mark as tracked to prevent future duplicates on refreshes or navigating back
  localStorage.setItem(storageKey, "true");
  console.log(`Purchase event tracked successfully for Order ID: ${cleanOrderId}`);
};
