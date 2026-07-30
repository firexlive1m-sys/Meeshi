import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAz03aMpvhVpNN641_FcGm0MkicXI4v02Y",
  authDomain: "meesho-auto-listing-tool.firebaseapp.com",
  projectId: "meesho-auto-listing-tool",
  storageBucket: "meesho-auto-listing-tool.firebasestorage.app",
  messagingSenderId: "697269821379",
  appId: "1:697269821379:web:f21348736a18096af9e776"
};

// Initialize Firebase only once
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export default async function handler(req: any, res: any) {
  // Support CORS if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body;
    
    // Cashfree expects 200 OK immediately.
    // If it's just a test webhook or verification
    if (!payload || !payload.data || !payload.data.order) {
      console.warn("Invalid webhook payload received or test webhook");
      return res.status(200).send("OK");
    }
    
    if (payload.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = payload.data.order.order_id;
      const customerEmail = payload.data.customer_details?.customer_email || payload.data.order.order_tags?.email;
      const planName = payload.data.order.order_tags?.plan || "Lifetime";
      
      if (customerEmail) {
        const emailLower = customerEmail.toLowerCase();
        const purchaseData = {
           plan: planName,
           amount: payload.data.order.order_amount,
           currency: payload.data.order.order_currency,
           orderId: orderId,
           timestamp: Date.now(),
           isPaymentComplete: true,
           paymentStatus: "PAID",
           updatedByWebhook: true
        };
        
        await setDoc(doc(db, 'purchases', emailLower), purchaseData, { merge: true });
        console.log(`[Webhook] Successfully saved purchase for ${emailLower} - Order: ${orderId}`);
      } else {
        console.error(`[Webhook] No customer email found in webhook payload for order ${orderId}`);
      }
    }

    return res.status(200).send("OK");
  } catch (err: any) {
    console.error("[Webhook] processing error:", err);
    return res.status(500).json({ error: "Internal webhook processing error" });
  }
}
