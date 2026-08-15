const fs = require('fs');

const firebaseImports = `import { initializeApp } from "firebase/app";
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
`;

const verifyCode = `import crypto from 'crypto';
${firebaseImports}
import { sendPurchaseEmail } from "../emailService";

export default async function handler(req: any, res: any) {
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "OeeQmB9FsBm7DoHKXfLgqreQ";

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", keySecret)
                                    .update(body.toString())
                                    .digest("hex");
                                    
    if (expectedSignature === razorpay_signature) {
      try {
        const keyId = process.env.RAZORPAY_KEY_ID || "rzp_live_TOszz4dY6LCHE8";
        const auth = Buffer.from(keyId + ":" + keySecret).toString("base64");
        
        const orderRes = await fetch(\`https://api.razorpay.com/v1/orders/\${razorpay_order_id}\`, {
          headers: { "Authorization": \`Basic \${auth}\` }
        });
        const orderData = await orderRes.json();
        
        let email = orderData.notes?.email || "";
        let name = orderData.notes?.name || "Customer";
        let planName = orderData.notes?.plan || "Lifetime";
        let phone = orderData.notes?.phone || "";
        
        if (!email) {
          const paymentsRes = await fetch(\`https://api.razorpay.com/v1/orders/\${razorpay_order_id}/payments\`, {
            headers: { "Authorization": \`Basic \${auth}\` }
          });
          const paymentsData = await paymentsRes.json();
          if (paymentsData.items && paymentsData.items.length > 0) {
             const payment = paymentsData.items[0];
             email = payment.email || payment.notes?.email || email;
             name = payment.notes?.name || name;
             planName = payment.notes?.plan || planName;
             phone = payment.contact || payment.notes?.phone || phone;
          }
        }
        
        if (email) {
          const emailLower = email.toLowerCase();
          const purchaseData = {
             plan: planName,
             amount: orderData.amount / 100,
             currency: orderData.currency,
             orderId: razorpay_order_id,
             timestamp: Date.now(),
             name: name,
             phone: phone,
             isPaymentComplete: true,
             paymentStatus: "PAID"
          };
          
          const docRef = doc(db, 'purchases', emailLower);
          const existingDoc = await getDoc(docRef);
          
          await setDoc(docRef, purchaseData, { merge: true });
          
          if (!existingDoc.exists() || existingDoc.data().emailSentOrderId !== razorpay_order_id) {
             await sendPurchaseEmail({
                email: emailLower,
                name: name,
                planName: planName,
                orderId: razorpay_order_id,
                amount: orderData.amount / 100
             });
             await setDoc(docRef, { emailSentOrderId: razorpay_order_id }, { merge: true });
          }
        }
      } catch (innerErr) {
        console.error("Error processing successful verified payment:", innerErr);
      }

      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
}
`;

fs.writeFileSync('api/verify-razorpay.ts', verifyCode);

const webhookCode = `import crypto from 'crypto';
${firebaseImports}
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
        console.log(\`[Webhook] Successfully saved purchase for \${emailLower} - Order: \${orderId}\`);
        
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
        console.error(\`[Webhook] No customer email found in webhook payload for order \${orderId}\`);
      }
    }
    
    return res.status(200).send("OK");
  } catch (err: any) {
    console.error("[Webhook] processing error:", err);
    return res.status(500).json({ error: "Internal webhook processing error" });
  }
}
`;

fs.writeFileSync('api/webhook/razorpay.ts', webhookCode);

