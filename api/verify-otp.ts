import { adminDb, adminAuth } from './_lib/firebaseAdmin';
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
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const emailLower = email.toLowerCase().trim();
    
    const otpDocRef = adminDb.collection('otp_sessions').doc(emailLower);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      return res.status(400).json({ error: "Invalid OTP or session expired." });
    }

    const data = otpDoc.data();
    
    if (!data) {
      return res.status(400).json({ error: "Invalid OTP or session expired." });
    }

    if (Date.now() > data.expiresAt) {
      await otpDocRef.delete();
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (data.attempts >= 5) {
      await otpDocRef.delete();
      return res.status(400).json({ error: "Too many failed attempts. Please request a new OTP." });
    }

    const hashedInputOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedInputOtp !== data.otpHash) {
      await otpDocRef.update({ attempts: data.attempts + 1 });
      return res.status(400).json({ error: "Invalid OTP." });
    }

    // OTP is valid. Invalidate immediately.
    await otpDocRef.delete();

    // Now securely log the user in via Firebase Custom Token
    let uid;
    try {
      const userRecord = await adminAuth.getUserByEmail(emailLower);
      uid = userRecord.uid;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create user if they don't exist
        const newUser = await adminAuth.createUser({
          email: emailLower,
          emailVerified: true
        });
        uid = newUser.uid;
      } else {
        throw error;
      }
    }

    // Generate custom token
    const customToken = await adminAuth.createCustomToken(uid);

    return res.status(200).json({ success: true, customToken });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
