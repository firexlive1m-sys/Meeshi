import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";

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
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    const docRef = doc(db, "otps", email.toLowerCase());
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(400).json({ error: "No OTP found for this email" });
    }

    const record = docSnap.data();
    
    if (Date.now() > record.expiresAt) {
      await deleteDoc(docRef);
      return res.status(400).json({ error: "OTP expired" });
    }
    
    if (record.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Clean up after successful verification
    await deleteDoc(docRef);
    res.json({ success: true, token: "mock-jwt-token-replace-with-real-one" });
  } catch (err: any) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Failed to verify OTP", message: err.message });
  }
}
