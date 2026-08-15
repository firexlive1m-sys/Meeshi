const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// 1. Add imports for emailService
content = content.replace(
  'import { getFirestore, doc, setDoc } from "firebase/firestore";',
  'import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";\nimport { sendPurchaseEmail, sendOtpEmail } from "./emailService";'
);

// 2. Add send purchase email logic to verify-razorpay
const verifyRazorpayCode = `app.post("/api/verify-razorpay", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "OeeQmB9FsBm7DoHKXfLgqreQ";

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto.createHmac("sha256", keySecret)
                                      .update(body.toString())
                                      .digest("hex");
                                      
      if (expectedSignature === razorpay_signature) {
        // Fetch order details from Razorpay to get the email and name
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
            // fallback to fetch payments
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
            
            // Check if already sent email
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
  });`;

content = content.replace(/app\.post\("\/api\/verify-razorpay", async \(req, res\) => \{[\s\S]*?\}\);/m, verifyRazorpayCode);

// 3. Add send purchase email logic to webhook
const webhookCode = `app.post("/api/webhook/razorpay", async (req: any, res) => {
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
    } catch (err) {
      console.error("[Webhook] processing error:", err);
    }
  });`;

content = content.replace(/app\.post\("\/api\/webhook\/razorpay", async \(req: any, res\) => \{[\s\S]*?\}\);/m, webhookCode);

// 4. Add OTP endpoints
const otpEndpoints = `
  // OTP Endpoints
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });
      
      const emailLower = email.toLowerCase();
      
      // Cooldown check (60s)
      const otpRef = doc(db, 'otps', emailLower);
      const otpDoc = await getDoc(otpRef);
      if (otpDoc.exists()) {
         const data = otpDoc.data();
         if (Date.now() - data.createdAt < 60000) {
            return res.status(429).json({ error: "Please wait 60 seconds before requesting another OTP." });
         }
      }
      
      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save to Firestore (expires in 10 mins)
      await setDoc(otpRef, {
         otp: otp, // In a highly secure app, hash this, but it's acceptable for short-lived simple OTPs
         createdAt: Date.now(),
         expiresAt: Date.now() + 10 * 60 * 1000,
         attempts: 0
      });
      
      // Send Email
      const sent = await sendOtpEmail(emailLower, otp);
      if (sent) {
         res.json({ success: true, message: "OTP sent successfully" });
      } else {
         res.status(500).json({ error: "Failed to send OTP email" });
      }
    } catch (err) {
       console.error("Send OTP error:", err);
       res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });
      
      const emailLower = email.toLowerCase();
      const otpRef = doc(db, 'otps', emailLower);
      const otpDoc = await getDoc(otpRef);
      
      if (!otpDoc.exists()) {
         return res.status(400).json({ error: "No OTP found for this email. Please request a new one." });
      }
      
      const data = otpDoc.data();
      
      if (Date.now() > data.expiresAt) {
         await deleteDoc(otpRef);
         return res.status(400).json({ error: "OTP expired. Please request a new OTP." });
      }
      
      if (data.attempts >= 5) {
         await deleteDoc(otpRef);
         return res.status(400).json({ error: "Too many failed attempts. Please request a new OTP." });
      }
      
      if (data.otp !== otp) {
         await setDoc(otpRef, { attempts: data.attempts + 1 }, { merge: true });
         return res.status(400).json({ error: "Invalid OTP. Please check the code and try again." });
      }
      
      // Valid OTP
      await deleteDoc(otpRef);
      
      // Create session
      const sessionToken = crypto.randomBytes(32).toString("hex");
      await setDoc(doc(db, 'sessions', sessionToken), {
         email: emailLower,
         createdAt: Date.now()
      });
      
      res.json({ success: true, sessionToken, email: emailLower });
    } catch (err) {
       console.error("Verify OTP error:", err);
       res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/session/:token", async (req, res) => {
    try {
       const token = req.params.token;
       const sessionRef = doc(db, 'sessions', token);
       const sessionDoc = await getDoc(sessionRef);
       
       if (sessionDoc.exists()) {
          res.json({ valid: true, email: sessionDoc.data().email });
       } else {
          res.status(404).json({ valid: false });
       }
    } catch (err) {
       res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite Middleware mounting`;

content = content.replace('// Vite Middleware mounting', otpEndpoints);

fs.writeFileSync('server.ts', content);
