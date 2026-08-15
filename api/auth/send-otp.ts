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
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store in Firestore instead of in-memory map
    await setDoc(doc(db, "otps", email.toLowerCase()), {
      otp,
      expiresAt
    });

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    
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
}
