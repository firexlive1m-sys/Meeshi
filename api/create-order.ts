import Razorpay from "razorpay";

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
    const { amount, currency = "INR", receipt } = req.body;
    
    // Amount must be in paise and >= 100
    if (!amount || amount < 100) {
      return res.status(400).json({ error: "Amount must be at least 100 paise" });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      return res.status(500).json({ error: "Razorpay credentials not found in environment variables" });
    }

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });
    
    const options = {
      amount: amount, 
      currency: currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    
    return res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error: any) {
    console.error("Razorpay Create Order Error:", error);
    return res.status(500).json({ error: "Failed to create order", details: error.message });
  }
}
