import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import crypto from "crypto";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

dotenv.config();

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add raw body access for webhook verification
  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));

  // Lazy Initialization of Gemini SDK safegaurded against missing / empty keys
  // Create Order on Razorpay
  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { amount, customerName, customerEmail, customerPhone, planName } = req.body;

      if (!amount || !customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ error: "Name, email, and 10-digit phone number are required." });
      }

      const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_mock";
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";

      if (keyId === "rzp_test_mock" && !process.env.RAZORPAY_KEY_ID) {
        console.warn("Razorpay API keys are missing.");
        return res.status(400).json({
          error: "Razorpay API keys are not configured yet.",
          setupInstruction: "Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables."
        });
      }

      // Convert amount to paise (1 INR = 100 Paise)
      const amountInPaise = Math.round(Number(amount) * 100);

      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: "receipt_" + Math.random().toString(36).substring(2, 11),
        notes: {
          plan: planName || "Lifetime",
          email: customerEmail,
          name: customerName,
          phone: customerPhone
        }
      };

      // Since we don't have the types for Razorpay module perfectly set up, we use basic fetch or dynamic import
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`
        },
        body: JSON.stringify(options)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Razorpay API Order Creation failed:", data);
        return res.status(response.status).json({
          error: data.error?.description || "Razorpay order creation rejected.",
          details: data
        });
      }

      return res.json({
        order_id: data.id,
        amount: data.amount,
        currency: data.currency,
        key_id: keyId
      });

    } catch (err: any) {
      console.error("Error creating Razorpay order:", err);
      return res.status(500).json({ error: "Internal payment processing error", message: err.message });
    }
  });

  // Webhook for Razorpay
  app.post("/api/webhook/razorpay", async (req: any, res) => {
    try {
      const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
      const signature = req.headers["x-razorpay-signature"];

      // Validate signature
      const expectedSignature = crypto.createHmac("sha256", secret)
                                      .update(req.rawBody)
                                      .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("Invalid webhook signature");
        return res.status(400).send("Invalid signature");
      }
      
      res.status(200).send("OK");
      const payload = req.body;
      
      if (payload.event === "payment.captured" || payload.event === "order.paid") {
        const paymentEntity = payload.payload.payment.entity;
        const notes = paymentEntity.notes || {};
        const customerEmail = paymentEntity.email || notes.email;
        const planName = notes.plan || "Lifetime";
        const orderId = paymentEntity.order_id;
        
        if (customerEmail) {
          const emailLower = customerEmail.toLowerCase();
          const purchaseData = {
             plan: planName,
             amount: paymentEntity.amount / 100,
             currency: paymentEntity.currency,
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
    } catch (err) {
      console.error("[Webhook] processing error:", err);
    }
  });

  // Fetch Razorpay Order Details
  app.get("/api/get-razorpay-order/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required." });
      }

      const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_mock";
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      const url = `https://api.razorpay.com/v1/orders/${orderId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Razorpay Order Fetch failed:", data);
        return res.status(response.status).json({
          error: data.error?.description || "Failed to fetch order details.",
          details: data
        });
      }

      // We need to fetch the payments for this order to get customer details as Razorpay order object doesn't strictly hold them natively like Cashfree
      const paymentsResponse = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`
        }
      });

      const paymentsData = await paymentsResponse.json();
      let customerDetails = { customer_name: "Customer", customer_phone: "", customer_email: "" };
      
      if (paymentsResponse.ok && paymentsData.items && paymentsData.items.length > 0) {
        const payment = paymentsData.items[0];
        customerDetails = {
          customer_name: payment.notes?.name || "Customer",
          customer_email: payment.email || payment.notes?.email || "",
          customer_phone: payment.contact || payment.notes?.phone || ""
        };
      } else {
        // Fallback to notes if any on order
        customerDetails = {
          customer_name: data.notes?.name || "Customer",
          customer_email: data.notes?.email || "",
          customer_phone: data.notes?.phone || ""
        };
      }

      return res.json({
        order_id: data.id,
        order_amount: data.amount / 100, // Convert paise back to INR
        order_status: data.status,
        customer_details: customerDetails
      });

    } catch (err: any) {
      console.error("Error retrieving Razorpay order details:", err);
      return res.status(500).json({ error: "Internal server error", message: err.message });
    }
  });

  // Verify Payment Status callback and Redirect (For server-side fallback or signature validation endpoint)
  app.post("/api/verify-razorpay", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "fnLuKiMqKKJylXh41616vAE3";

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto.createHmac("sha256", keySecret)
                                      .update(body.toString())
                                      .digest("hex");
                                      
      if (expectedSignature === razorpay_signature) {
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: "Invalid signature" });
      }
    } catch (err) {
      console.error("Verification error:", err);
      res.status(500).json({ success: false, error: "Verification failed" });
    }
  });

  // Vite Middleware mounting
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
