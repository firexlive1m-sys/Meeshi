import { adminDb } from './_lib/firebaseAdmin';
import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const emailLower = email.toLowerCase().trim();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP before storing
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in Firestore
    await adminDb.collection('otp_sessions').doc(emailLower).set({
      otpHash: hashedOtp,
      expiresAt: expiresAt,
      attempts: 0
    });

    // Send email using EmailJS REST API
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_OTP_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS configuration missing");
      return res.status(500).json({ error: "Internal server configuration error" });
    }

    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          email: emailLower,
          passcode: otp,
          time: '10 minutes'
        }
      })
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error("EmailJS error:", errText);
      return res.status(500).json({ error: "Failed to send OTP email" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("OTP send error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
