import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import crypto from "crypto";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { Resend } from "resend";

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

  // Resend Initialization
  let resendClient: Resend | null = null;
  function getResend() {
    if (!resendClient && process.env.RESEND_API_KEY) {
      resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
  }

  // OTP Store
  const otpStore = new Map<string, { otp: string; expiresAt: number }>();

  // Send OTP Endpoint
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      otpStore.set(email.toLowerCase(), { otp, expiresAt });

      const resend = getResend();
      if (!resend) {
        console.log("Mock sending OTP due to missing RESEND_API_KEY:", otp);
        return res.json({ success: true, message: "OTP logged to console for testing." });
      }

      await resend.emails.send({
        from: 'Meesho Auto Listing • OTP <Support@autolisting.online>',
        to: email,
        subject: 'Your Login OTP – Meesho Auto Listing Tool',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login OTP</title>
</head>

<body style="margin:0; padding:0; background:#f5f5f5; font-family:Arial,Helvetica,sans-serif; color:#111111;">

  <!-- Preheader / Preview Text -->
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Your secure login OTP for Meesho Auto Listing Tool
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5; padding:40px 15px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:560px; background:#ffffff; border-radius:14px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#111111; padding:28px 30px; text-align:center;">
              <div style="font-size:24px; font-weight:700; color:#ffffff;">
                Meesho Auto Listing Tool
              </div>
              <div style="font-size:13px; color:#aaaaaa; margin-top:7px;">
                Secure Login Verification
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 35px;">

              <h2 style="margin:0 0 15px; font-size:24px; color:#111111;">
                Login Verification
              </h2>

              <p style="margin:0 0 25px; font-size:15px; line-height:1.6; color:#555555;">
                Aapne Meesho Auto Listing Tool mein login karne ki request ki hai.
                Login complete karne ke liye neeche diya gaya One-Time Password (OTP) enter karein.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center"
                    style="background:#f5f5f5; border:1px solid #e5e5e5; border-radius:12px; padding:25px;">

                    <div style="font-size:12px; text-transform:uppercase; letter-spacing:2px; color:#777777; margin-bottom:10px;">
                      Your OTP
                    </div>

                    <div style="font-size:36px; font-weight:700; letter-spacing:8px; color:#111111;">
                      ${otp}
                    </div>

                  </td>
                </tr>
              </table>

              <p style="margin:25px 0 0; font-size:14px; line-height:1.6; color:#666666; text-align:center;">
                This OTP is valid for <strong>10 minutes</strong>.
              </p>

              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-top:30px; background:#fafafa; border-radius:10px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0; font-size:13px; line-height:1.6; color:#666666;">
                      🔒 <strong>Security Notice:</strong><br>
                      OTP kisi ke saath share na karein. Meesho Auto Listing Tool ki team
                      aapse kabhi bhi OTP nahi maangegi.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:30px 0 0; font-size:13px; line-height:1.6; color:#999999;">
                Agar aapne login request nahi ki hai, to is email ko ignore karein.
                Aapka account secure hai.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111111; padding:22px 30px; text-align:center;">
              <div style="font-size:13px; color:#ffffff; font-weight:600;">
                Meesho Auto Listing Tool
              </div>

              <div style="font-size:11px; color:#888888; margin-top:8px;">
                © 2026 All rights reserved.
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
        `
      });

      res.json({ success: true, message: "OTP sent successfully" });
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      res.status(500).json({ error: "Failed to send OTP", message: err.message });
    }
  });

  // Verify OTP Endpoint
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

      const record = otpStore.get(email.toLowerCase());
      if (!record) return res.status(400).json({ error: "No OTP found for this email" });
      if (Date.now() > record.expiresAt) {
        otpStore.delete(email.toLowerCase());
        return res.status(400).json({ error: "OTP expired" });
      }
      if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

      // Clean up after successful verification
      otpStore.delete(email.toLowerCase());
      res.json({ success: true, token: "mock-jwt-token-replace-with-real-one" });
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      res.status(500).json({ error: "Failed to verify OTP", message: err.message });
    }
  });

  // Send Receipt Endpoint (Triggered by client)
  app.post("/api/purchase/send-receipt", async (req, res) => {
    try {
      const { name, email, plan_name, order_id, download_link } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });

      const resend = getResend();
      if (!resend) {
        console.log("Mock sending receipt to:", email);
        return res.json({ success: true, message: "Receipt logged to console." });
      }

      await resend.emails.send({
        from: 'Meesho Auto Listing • Purchase Confirmation <Support@autolisting.online>',
        to: email,
        subject: '🎉 Purchase Successful – Your Auto Listing Tool is Ready',
        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Order is Confirmed!</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
    background-color: #f4f5f7;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 20px auto;
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  .header {
    background-color: #2874F0;
    color: #ffffff;
    text-align: center;
    padding: 30px 20px;
  }
  .header h1 {
    margin: 0;
    font-size: 24px;
  }
  .content {
    padding: 30px 20px;
  }
  .greeting {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  .order-details {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 25px;
  }
  .order-details p {
    margin: 5px 0;
    font-size: 14px;
  }
  .instructions {
    margin-bottom: 25px;
  }
  .instructions h2 {
    font-size: 18px;
    color: #1e293b;
    margin-top: 0;
  }
  .step {
    display: flex;
    margin-bottom: 15px;
  }
  .step-number {
    background-color: #2874F0;
    color: #ffffff;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    margin-right: 15px;
    flex-shrink: 0;
  }
  .step-text {
    font-size: 15px;
    margin: 0;
    padding-top: 2px;
  }
  .button-container {
    text-align: center;
    margin: 30px 0;
  }
  .button {
    background-color: #2874F0;
    color: #ffffff;
    text-decoration: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 16px;
    display: inline-block;
    box-shadow: 0 4px 6px rgba(40, 116, 240, 0.2);
  }
  .footer {
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
    text-align: center;
    padding: 20px;
    font-size: 13px;
    color: #64748b;
  }
  .highlight {
    font-weight: bold;
    color: #0f172a;
  }
  @media only screen and (max-width: 600px) {
    .container {
      margin: 0;
      border-radius: 0;
    }
  }
</style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Payment successful. Your tool access is ready — log in with your registered email to get started</div>
  <div class="container">
    <div class="header">
      <h1>Purchase Successful! 🎉</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${name || 'Customer'},
      </div>
      
      <p>Thank you for your purchase! Your order has been successfully processed and your tool is now ready to use.</p>
      
      <div class="order-details">
        <p><strong>Order ID:</strong> ${order_id}</p>
        <p><strong>Plan:</strong> ${plan_name || 'Lifetime'}</p>
        <p><strong>Registered Email:</strong> ${email}</p>
      </div>

      <div class="instructions">
        <h2>How to Access Your Tool:</h2>
        
        <div class="step">
          <div class="step-number">1</div>
          <p class="step-text">Click the button below to visit the Download Dashboard.</p>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <p class="step-text">Click on <span class="highlight">"Continue with Email"</span> or <span class="highlight">"Google Account"</span> to login.</p>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <p class="step-text"><strong>Very Important:</strong> You MUST login with the exact same email address you used for purchase: <span class="highlight" style="color: #2874F0;">${email}</span></p>
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <p class="step-text">Once logged in, your purchased tool will automatically be unlocked on the dashboard!</p>
        </div>
      </div>
      
      <div class="button-container">
        <a href="https://autolisting.online/download" class="button">Go to Download Dashboard</a>
      </div>
      
      <p style="font-size: 14px;">If you have any questions or face any issues, you can contact us via WhatsApp support from the dashboard.</p>
    </div>
    
    <div class="footer">
      <p>&copy; Auto Listing Tool. All rights reserved.</p>
      <p>This is an automated email, please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
        `
      });

      res.json({ success: true, message: "Receipt sent successfully" });
    } catch (err: any) {
      console.error("Error sending receipt:", err);
      res.status(500).json({ error: "Failed to send receipt", message: err.message });
    }
  });

  // Lazy Initialization of Gemini SDK safegaurded against missing / empty keys
  // Create Order on Razorpay
  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { amount, customerName, customerEmail, customerPhone, planName } = req.body;

      if (!amount || !customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ error: "Name, email, and 10-digit phone number are required." });
      }

      const keyId = process.env.RAZORPAY_KEY_ID || "rzp_live_TOszz4dY6LCHE8";
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "OeeQmB9FsBm7DoHKXfLgqreQ";

      if (keyId === "rzp_live_TOszz4dY6LCHE8" && !process.env.RAZORPAY_KEY_ID) {
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
      const secret = process.env.RAZORPAY_KEY_SECRET || "OeeQmB9FsBm7DoHKXfLgqreQ";
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

          // Send Purchase Confirmation via Resend
          const resend = getResend();
          if (resend) {
            try {
              await resend.emails.send({
                from: 'Meesho Auto Listing • Purchase Confirmation <Support@autolisting.online>',
                to: customerEmail,
                subject: '🎉 Purchase Successful – Your Auto Listing Tool is Ready',
                html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Order is Confirmed!</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
    background-color: #f4f5f7;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 20px auto;
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  .header {
    background-color: #2874F0;
    color: #ffffff;
    text-align: center;
    padding: 30px 20px;
  }
  .header h1 {
    margin: 0;
    font-size: 24px;
  }
  .content {
    padding: 30px 20px;
  }
  .greeting {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  .order-details {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 25px;
  }
  .order-details p {
    margin: 5px 0;
    font-size: 14px;
  }
  .instructions {
    margin-bottom: 25px;
  }
  .instructions h2 {
    font-size: 18px;
    color: #1e293b;
    margin-top: 0;
  }
  .step {
    display: flex;
    margin-bottom: 15px;
  }
  .step-number {
    background-color: #2874F0;
    color: #ffffff;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    margin-right: 15px;
    flex-shrink: 0;
  }
  .step-text {
    font-size: 15px;
    margin: 0;
    padding-top: 2px;
  }
  .button-container {
    text-align: center;
    margin: 30px 0;
  }
  .button {
    background-color: #2874F0;
    color: #ffffff;
    text-decoration: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 16px;
    display: inline-block;
    box-shadow: 0 4px 6px rgba(40, 116, 240, 0.2);
  }
  .footer {
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
    text-align: center;
    padding: 20px;
    font-size: 13px;
    color: #64748b;
  }
  .highlight {
    font-weight: bold;
    color: #0f172a;
  }
  @media only screen and (max-width: 600px) {
    .container {
      margin: 0;
      border-radius: 0;
    }
  }
</style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Payment successful. Your tool access is ready — log in with your registered email to get started</div>
  <div class="container">
    <div class="header">
      <h1>Purchase Successful! 🎉</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${notes.name || 'Customer'},
      </div>
      
      <p>Thank you for your purchase! Your order has been successfully processed and your tool is now ready to use.</p>
      
      <div class="order-details">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Plan:</strong> ${planName || 'Lifetime'}</p>
        <p><strong>Registered Email:</strong> ${customerEmail}</p>
      </div>

      <div class="instructions">
        <h2>How to Access Your Tool:</h2>
        
        <div class="step">
          <div class="step-number">1</div>
          <p class="step-text">Click the button below to visit the Download Dashboard.</p>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <p class="step-text">Click on <span class="highlight">"Continue with Email"</span> or <span class="highlight">"Google Account"</span> to login.</p>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <p class="step-text"><strong>Very Important:</strong> You MUST login with the exact same email address you used for purchase: <span class="highlight" style="color: #2874F0;">${customerEmail}</span></p>
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <p class="step-text">Once logged in, your purchased tool will automatically be unlocked on the dashboard!</p>
        </div>
      </div>
      
      <div class="button-container">
        <a href="https://autolisting.online/download" class="button">Go to Download Dashboard</a>
      </div>
      
      <p style="font-size: 14px;">If you have any questions or face any issues, you can contact us via WhatsApp support from the dashboard.</p>
    </div>
    
    <div class="footer">
      <p>&copy; Auto Listing Tool. All rights reserved.</p>
      <p>This is an automated email, please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
        `
              });
              console.log(`[Webhook] Purchase confirmation email sent to ${customerEmail}`);
            } catch (emailErr) {
              console.error("[Webhook] Failed to send confirmation email:", emailErr);
            }
          } else {
             console.log(`[Webhook] Would send confirmation email to ${customerEmail} (Resend not configured)`);
          }
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

      const keyId = process.env.RAZORPAY_KEY_ID || "rzp_live_TOszz4dY6LCHE8";
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "OeeQmB9FsBm7DoHKXfLgqreQ";
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
      
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "OeeQmB9FsBm7DoHKXfLgqreQ";

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
