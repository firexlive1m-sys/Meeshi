import crypto from 'crypto';

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
  } catch (err: any) {
    console.error("Verification error:", err);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
}
