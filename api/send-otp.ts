import { initializeApp } from "firebase/app";
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
