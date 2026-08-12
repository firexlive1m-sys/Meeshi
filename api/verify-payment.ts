import crypto from "crypto";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAz03aMpvhVpNN641_FcGm0MkicXI4v02Y",
  authDomain: "meesho-auto-listing-tool.firebaseapp.com",
  projectId: "meesho-auto-listing-tool",
  storageBucket: "meesho-auto-listing-tool.firebasestorage.app",
  messagingSenderId: "697269821379",
  appId: "1:697269821379:web:f21348736a18096af9e776"
};

// Initialize Firebase (checking if already initialized for serverless environments)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, ...purchaseData } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment fields" });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({ error: "Razorpay secret key not configured" });
    }

    // Verify signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed: Invalid signature" });
    }

    // Signature matches, mark as paid.
    const customerEmail = purchaseData.customerEmail?.toLowerCase();
    if (customerEmail) {
      const docRef = doc(db, 'purchases', customerEmail);
      await setDoc(docRef, {
        plan: purchaseData.planName || "Lifetime",
        price: (purchaseData.amount / 100), // convert back to rupees
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        purchasedAt: new Date().toISOString(),
        name: purchaseData.customerName || "Customer",
        phone: purchaseData.customerPhone || "",
        paymentStatus: "PAID",
        paymentGateway: "Razorpay"
      }, { merge: true });
      console.log(`[Razorpay] Successfully saved purchase for ${customerEmail} - Order: ${razorpay_order_id}`);
    }

    return res.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    console.error("Razorpay Verify Payment Error:", error);
    return res.status(500).json({ error: "Payment verification failed", details: error.message });
  }
}
