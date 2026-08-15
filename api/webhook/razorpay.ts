import crypto from 'crypto';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAz03aMpvhVpNN641_FcGm0MkicXI4v02Y",
  authDomain: "meesho-auto-listing-tool.firebaseapp.com",
  projectId: "meesho-auto-listing-tool",
  storageBucket: "meesho-auto-listing-tool.firebasestorage.app",
  messagingSenderId: "697269821379",
  appId: "1:697269821379:web:f21348736a18096af9e776"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

import { sendPurchaseEmail } from "../../emailService";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-razorpay-signature'
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
    
    if (!payload || !payload.event) {
      console.warn("Invalid webhook payload received");
      return res.status(200).send("OK");
    }
    
    if (payload.event === "payment.captured" || payload.event === "order.paid") {
      const paymentEntity = payload.payload.payment.entity;
      const notes = paymentEntity.notes || {};
      const customerEmail = paymentEntity.email || notes.email;
      const planName = notes.plan || "Lifetime";
      const customerName = notes.name || "Customer";
      const orderId = paymentEntity.order_id;
      
      if (customerEmail) {
        const emailLower = customerEmail.toLowerCase();
        const purchaseData = {
           plan: planName,
           amount: paymentEntity.amount / 100,
           currency: paymentEntity.currency,
           orderId: orderId,
           timestamp: Date.now(),
           name: customerName,
           isPaymentComplete: true,
           paymentStatus: "PAID",
           updatedByWebhook: true
        };
        
        const docRef = doc(db, 'purchases', emailLower);
        const existingDoc = await getDoc(docRef);
        
        await setDoc(docRef, purchaseData, { merge: true });
        console.log(`[Webhook] Successfully saved purchase for ${emailLower} - Order: ${orderId}`);
        
        if (!existingDoc.exists() || existingDoc.data().emailSentOrderId !== orderId) {
           await sendPurchaseEmail({
              email: emailLower,
              name: customerName,
              planName: planName,
              orderId: orderId,
              amount: paymentEntity.amount / 100
           });
           await setDoc(docRef, { emailSentOrderId: orderId }, { merge: true });
        }
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
