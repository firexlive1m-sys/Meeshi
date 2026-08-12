const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const injection = `
  function getRazorpayInstance() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      throw new Error("Razorpay credentials not found in environment variables");
    }

    return new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });
  }

  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt } = req.body;
      
      // Amount must be in paise and >= 100
      if (!amount || amount < 100) {
        return res.status(400).json({ error: "Amount must be at least 100 paise" });
      }

      const instance = getRazorpayInstance();
      
      const options = {
        amount: amount, 
        currency: currency,
        receipt: receipt || \`rcpt_\${Date.now()}\`
      };

      const order = await instance.orders.create(options);
      
      res.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (error) {
      console.error("Razorpay Create Order Error:", error);
      res.status(500).json({ error: "Failed to create order", details: error.message });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
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
        console.log(\`[Razorpay] Successfully saved purchase for \${customerEmail} - Order: \${razorpay_order_id}\`);
      }

      res.json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
      console.error("Razorpay Verify Payment Error:", error);
      res.status(500).json({ error: "Payment verification failed", details: error.message });
    }
  });
`;

code = code.replace('  // Lazy Initialization of Gemini SDK safegaurded against missing / empty keys', injection + '\n  // Lazy Initialization of Gemini SDK safegaurded against missing / empty keys');
fs.writeFileSync('server.ts', code);
