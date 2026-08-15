const fs = require('fs');
const path = require('path');

// Make sure directories exist
if (!fs.existsSync('api')) fs.mkdirSync('api');
if (!fs.existsSync('api/session')) fs.mkdirSync('api/session');

const firebaseImports = `import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

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
`;

// 1. api/send-otp.ts
const sendOtpCode = `${firebaseImports}
import { sendOtpEmail } from "../emailService";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    const emailLower = email.toLowerCase();
    
    const otpRef = doc(db, 'otps', emailLower);
    const otpDoc = await getDoc(otpRef);
    if (otpDoc.exists()) {
       const data = otpDoc.data();
       if (Date.now() - data.createdAt < 60000) {
          return res.status(429).json({ error: "Please wait 60 seconds before requesting another OTP." });
       }
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await setDoc(otpRef, {
       otp: otp,
       createdAt: Date.now(),
       expiresAt: Date.now() + 10 * 60 * 1000,
       attempts: 0
    });
    
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
}
`;
fs.writeFileSync('api/send-otp.ts', sendOtpCode);

// 2. api/verify-otp.ts
const verifyOtpCode = `${firebaseImports}
import crypto from "crypto";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
    
    await deleteDoc(otpRef);
    
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
}
`;
fs.writeFileSync('api/verify-otp.ts', verifyOtpCode);

// 3. api/session/[token].ts
const sessionCode = `${firebaseImports}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token is required" });

    const sessionRef = doc(db, 'sessions', token);
    const sessionDoc = await getDoc(sessionRef);
    
    if (sessionDoc.exists()) {
       res.json({ valid: true, email: sessionDoc.data().email });
    } else {
       res.status(404).json({ valid: false });
    }
  } catch (err) {
     console.error("Session error:", err);
     res.status(500).json({ error: "Internal server error" });
  }
}
`;
fs.writeFileSync('api/session/[token].ts', sessionCode);

