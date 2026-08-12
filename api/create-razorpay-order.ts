export default async function handler(req: any, res: any) {
  // Support CORS
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
}
