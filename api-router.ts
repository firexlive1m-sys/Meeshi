import express from "express";
import crypto from "crypto";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { Resend } from "resend";

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

export const apiRouter = express.Router();

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

// Add raw body access for webhook verification
apiRouter.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// Send OTP Endpoint
apiRouter.post("/auth/send-otp", async (req, res) => {
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
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your OTP</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f5f7; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
.header { background-color: #2874F0; color: #ffffff; text-align: center; padding: 30px 20px; }
.header h1 { margin: 0; font-size: 24px; }
.content { padding: 30px 20px; }
.greeting { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
.otp-container { text-align: center; margin: 30px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 25px; }
.otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2874F0; margin: 0; }
.validity { font-size: 13px; color: #64748b; margin-top: 10px; margin-bottom: 0; }
.warning { font-size: 14px; color: #b91c1c; margin-top: 25px; padding-left: 15px; border-left: 4px solid #b91c1c; }
.footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; padding: 20px; font-size: 13px; color: #64748b; }
@media only screen and (max-width: 600px) { .container { margin: 0; border-radius: 0; } }
</style>
</head>
<body>
<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Your login verification code is ${otp}. Valid for 10 minutes.</div>
<div class="container">
<div class="header"><h1>Secure Login Verification</h1></div>
<div class="content">
<div class="greeting">Hi there,</div>
<p>You requested an OTP to login and access your Auto Listing Tool dashboard. Please use the verification code below:</p>
<div class="otp-container">
<p class="otp-code">${otp}</p>
<p class="validity">This code is valid for 10 minutes</p>
</div>
<div class="warning"><strong>Security Notice:</strong> Never share this OTP with anyone, including our support team. We will never ask for your password or OTP.</div>
<p style="margin-top: 30px; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
</div>
<div class="footer"><p>&copy; Auto Listing Tool. All rights reserved.</p><p>This is an automated message, please do not reply.</p></div>
</div>
</body>
</html>`
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP", details: error.message });
  }
});

apiRouter.post("/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

  const storedData = otpStore.get(email.toLowerCase());
  if (!storedData) return res.status(400).json({ error: "Invalid or expired OTP" });
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: "OTP expired" });
  }
  if (storedData.otp !== otp) return res.status(400).json({ error: "Incorrect OTP" });

  otpStore.delete(email.toLowerCase());
  res.json({ success: true, message: "OTP verified" });
});

apiRouter.post("/purchase/send-receipt", async (req, res) => {
  try {
    const { name, email, order_id, plan_name } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const resend = getResend();
    if (!resend) {
      console.log("Mock sending purchase receipt to:", email);
      return res.json({ success: true, message: "Receipt mocked." });
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
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f5f7; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
.header { background-color: #2874F0; color: #ffffff; text-align: center; padding: 30px 20px; }
.header h1 { margin: 0; font-size: 24px; }
.content { padding: 30px 20px; }
.greeting { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
.order-details { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 25px; }
.order-details p { margin: 5px 0; font-size: 14px; }
.instructions { margin-bottom: 25px; }
.instructions h2 { font-size: 18px; color: #1e293b; margin-top: 0; }
.step { display: flex; margin-bottom: 15px; }
.step-number { background-color: #2874F0; color: #ffffff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
.step-text { font-size: 15px; margin: 0; padding-top: 2px; }
.button-container { text-align: center; margin: 30px 0; }
.button { background-color: #2874F0; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(40, 116, 240, 0.2); }
.footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; padding: 20px; font-size: 13px; color: #64748b; }
.highlight { font-weight: bold; color: #0f172a; }
@media only screen and (max-width: 600px) { .container { margin: 0; border-radius: 0; } }
</style>
</head>
<body>
<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Payment successful. Your tool access is ready — log in with your registered email to get started</div>
<div class="container">
<div class="header"><h1>Purchase Successful! 🎉</h1></div>
<div class="content">
<div class="greeting">Hi ${name || 'Customer'},</div>
<p>Thank you for your purchase! Your order has been successfully processed and your tool is now ready to use.</p>
<div class="order-details">
<p><strong>Order ID:</strong> ${order_id}</p>
<p><strong>Plan:</strong> ${plan_name || 'Lifetime'}</p>
<p><strong>Registered Email:</strong> ${email}</p>
</div>
<div class="instructions">
<h2>How to Access Your Tool:</h2>
<div class="step"><div class="step-number">1</div><p class="step-text">Click the button below to visit the Download Dashboard.</p></div>
<div class="step"><div class="step-number">2</div><p class="step-text">Click on <span class="highlight">"Continue with Email"</span> or <span class="highlight">"Google Account"</span> to login.</p></div>
<div class="step"><div class="step-number">3</div><p class="step-text"><strong>Very Important:</strong> You MUST login with the exact same email address you used for purchase: <span class="highlight" style="color: #2874F0;">${email}</span></p></div>
<div class="step"><div class="step-number">4</div><p class="step-text">Once logged in, your purchased tool will automatically be unlocked on the dashboard!</p></div>
</div>
<div class="button-container"><a href="https://autolisting.online/download" class="button">Go to Download Dashboard</a></div>
<p style="font-size: 14px;">If you have any questions or face any issues, you can contact us via WhatsApp support from the dashboard.</p>
</div>
<div class="footer"><p>&copy; Auto Listing Tool. All rights reserved.</p><p>This is an automated email, please do not reply directly to this email.</p></div>
</div>
</body>
</html>`
    });

    res.json({ success: true, message: "Receipt sent successfully" });
  } catch (error: any) {
    console.error("Error sending receipt:", error);
    res.status(500).json({ error: "Failed to send receipt", details: error.message });
  }
});

apiRouter.post("/create-razorpay-order", async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_live_TOszz4dY6LCHE8";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "OeeQmB9FsBm7DoHKXfLgqreQ";
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify({ amount, currency, receipt, notes })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Razorpay Order Creation Error:", data);
      return res.status(response.status).json({ error: data.error?.description || "Razorpay error", details: data });
    }
    return res.json(data);
  } catch (err: any) {
    console.error("Error creating Razorpay order:", err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

apiRouter.post("/webhook/razorpay", async (req: any, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Webhook secret not configured");
    return res.status(500).send("Webhook config error");
  }

  const signature = req.headers["x-razorpay-signature"];
  const bodyString = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(bodyString)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("Invalid Webhook Signature");
    return res.status(400).send("Invalid signature");
  }

  // Fast response to Razorpay
  res.status(200).send("OK");

  try {
    const event = req.body.event;
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const notes = paymentEntity.notes || {};
      const planName = notes.plan || 'Lifetime';
      
      let customerEmail = paymentEntity.email || notes.email || "";

      if (customerEmail) {
        customerEmail = customerEmail.toLowerCase().trim();
        const purchaseRef = doc(db, "purchases", customerEmail);
        await setDoc(purchaseRef, {
          isPaymentComplete: true,
          plan: planName,
          amount: paymentEntity.amount / 100,
          updatedAt: new Date(),
          orderId: orderId,
          lastPaymentId: paymentEntity.id
        }, { merge: true });

        console.log(`[Webhook] Granted access to ${customerEmail} for plan ${planName}`);

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
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f5f7; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
.header { background-color: #2874F0; color: #ffffff; text-align: center; padding: 30px 20px; }
.header h1 { margin: 0; font-size: 24px; }
.content { padding: 30px 20px; }
.greeting { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
.order-details { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 25px; }
.order-details p { margin: 5px 0; font-size: 14px; }
.instructions { margin-bottom: 25px; }
.instructions h2 { font-size: 18px; color: #1e293b; margin-top: 0; }
.step { display: flex; margin-bottom: 15px; }
.step-number { background-color: #2874F0; color: #ffffff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
.step-text { font-size: 15px; margin: 0; padding-top: 2px; }
.button-container { text-align: center; margin: 30px 0; }
.button { background-color: #2874F0; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(40, 116, 240, 0.2); }
.footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; padding: 20px; font-size: 13px; color: #64748b; }
.highlight { font-weight: bold; color: #0f172a; }
@media only screen and (max-width: 600px) { .container { margin: 0; border-radius: 0; } }
</style>
</head>
<body>
<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Payment successful. Your tool access is ready — log in with your registered email to get started</div>
<div class="container">
<div class="header"><h1>Purchase Successful! 🎉</h1></div>
<div class="content">
<div class="greeting">Hi ${notes.name || 'Customer'},</div>
<p>Thank you for your purchase! Your order has been successfully processed and your tool is now ready to use.</p>
<div class="order-details">
<p><strong>Order ID:</strong> ${orderId}</p>
<p><strong>Plan:</strong> ${planName || 'Lifetime'}</p>
<p><strong>Registered Email:</strong> ${customerEmail}</p>
</div>
<div class="instructions">
<h2>How to Access Your Tool:</h2>
<div class="step"><div class="step-number">1</div><p class="step-text">Click the button below to visit the Download Dashboard.</p></div>
<div class="step"><div class="step-number">2</div><p class="step-text">Click on <span class="highlight">"Continue with Email"</span> or <span class="highlight">"Google Account"</span> to login.</p></div>
<div class="step"><div class="step-number">3</div><p class="step-text"><strong>Very Important:</strong> You MUST login with the exact same email address you used for purchase: <span class="highlight" style="color: #2874F0;">${customerEmail}</span></p></div>
<div class="step"><div class="step-number">4</div><p class="step-text">Once logged in, your purchased tool will automatically be unlocked on the dashboard!</p></div>
</div>
<div class="button-container"><a href="https://autolisting.online/download" class="button">Go to Download Dashboard</a></div>
<p style="font-size: 14px;">If you have any questions or face any issues, you can contact us via WhatsApp support from the dashboard.</p>
</div>
<div class="footer"><p>&copy; Auto Listing Tool. All rights reserved.</p><p>This is an automated email, please do not reply directly to this email.</p></div>
</div>
</body>
</html>`
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

apiRouter.get("/get-razorpay-order/:orderId", async (req, res) => {
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
      headers: { "Content-Type": "application/json", "Authorization": `Basic ${auth}` }
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.description || "Failed to fetch order details.", details: data });
    }

    const paymentsResponse = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "Authorization": `Basic ${auth}` }
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
      customerDetails = {
        customer_name: data.notes?.name || "Customer",
        customer_email: data.notes?.email || "",
        customer_phone: data.notes?.phone || ""
      };
    }

    return res.json({ order_id: data.id, order_amount: data.amount / 100, order_status: data.status, customer_details: customerDetails });
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

apiRouter.post("/verify-razorpay", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "OeeQmB9FsBm7DoHKXfLgqreQ";
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(body.toString()).digest("hex");
    
    if (expectedSignature === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Verification failed" });
  }
});
