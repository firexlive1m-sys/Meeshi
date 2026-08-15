import crypto from 'crypto';

const SECRET_KEY = process.env.OTP_SECRET || 'meesho-auto-listing-tool-super-secret-key-fallback';
const key = crypto.createHash('sha256').update(SECRET_KEY).digest();

function decryptOTPData(token: string) {
  try {
    const [ivHex, encryptedHex, authTagHex] = token.split(':');
    if (!ivHex || !encryptedHex || !authTagHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (err) {
    return null;
  }
}

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
    const { email, otp, token } = req.body;
    if (!email || !otp || !token) {
      return res.status(400).json({ error: "Email, OTP, and token are required" });
    }

    const decrypted = decryptOTPData(token);
    
    if (!decrypted) {
      return res.status(400).json({ error: "Invalid or tampered token" });
    }

    if (decrypted.email !== email.toLowerCase()) {
      return res.status(400).json({ error: "Email mismatch" });
    }
    
    if (Date.now() > decrypted.expiresAt) {
      return res.status(400).json({ error: "OTP expired" });
    }
    
    if (decrypted.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Success
    res.json({ success: true, token: "mock-jwt-token-replace-with-real-one" });
  } catch (err: any) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Failed to verify OTP", message: err.message });
  }
}
