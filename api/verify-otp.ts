import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'crypto';

// Initialize Firebase Admin securely
function getFirebaseAdmin() {
  if (!getApps().length) {
    try {
      const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDClPCAgmP+qyCs\nNVM7dv8RHLVHkxszHUMtEIasXJsu1KnDjR0CJH9g0fRshjggD59C6f2+2oISdWz1\np71FBVnR0udeatcbveA3wSfUosZbASU8yiBrQgNSVkKQH7Y7kz5NKeNo1MuZQ+h4\n3JxUhmwo9VJ072bjaAFgulagfZS/aEzz/B6WqYA/CV9wHwSbWyNB+dVKb382+wGh\nKh848C5RG2/YKDa4DyI0KHMzZq6IcrSNmb8fSJ0E0+p3c5bGHH1Y2xof8fIGhfkR\nIVvtDjyMe+c8UpSZAsux9jQ8DedXnjQ7oG3uUSh9saN7lv3NGIL6+9LumJ9zrp5W\nWlDKly6BAgMBAAECggEAAo1/OdvgD4WXpru2vDrShAMsr4ga/xbECICpKCRpQKYf\nhahFnk871LGPcZ+ph4Xl8bQBuTvrET59Mdw35uqP9gFEmdn4aUm6gfe+t87kf9nU\nFwP6tLaFljJJknQIjTe4ZV0yeZfyVXgBIhoIkuEuNMO6Z5xjDOJiw33hVF7eZVwN\nSta4m5RmXJX0NcakMalJjnwHWhcjWJd7rdQXrMy1KMdZfdrjD/gNSinA/+g528bF\nyJkkHn2rBKKM4pcwAW8sXryOSaKYSomlv3r88Py8jYiuwB8iXvifhHAb1NvpzfKu\nas4VLrphTEUB0pH554brCgHW6rWFexh0dTUm8m8QYQKBgQDp41KpMThNEDOJjyz2\ng6OHmR/YYEb9p9Nt/Vk7bXGSRtqnoXGIhC3dkF63Ygq3yay55laYm8/VW3aWEd4i\ntB0kAqV3WziXDLMJr4UZCE0owm6yreUnBUx2ce4JoLVRUlPttFDW9swdRFSCQMNr\nshhAo7VvFSooM76stzS6dTzJoQKBgQDU+k7djBKw5yapNn2WfjkoVKpI9FJqLFfV\nf7BShmLnMFWjHF72OgY0hnJXkVAfpdzltbKcna5tmFENAahefmGNmaKAuLgADrZx\nW5EGomokE2B7OltOALDIEgnapuKqXWQlPY14OYSSJOLpxPfPjX4FMbE2QE3Qn6x8\nzwYg6Rb44QKBgEJY8Rb71mvN/8Cy899OQnJx1p3L2feUxx55cvmvtzr2jIpm+szu\nKhCjJqtAzaeLN0tY8xHBiXiNxJsXoHsZuvZ/Ja8xGmGHAbbqqogKWdEJLtvTBqFG\nGIW1FgB3LVhPUW2p7BC+2/Ilcw+sDYOcdtLHXe2QBHB5FUrrgbKvFTphAoGBAIMQ\nozYN/HanWZBquzDA7tXV/JE24fz62vbFRLIUh4r0oM7nJ71pieYLExS2lVNUlDM8\n9PUSyIQjZ0WUzpOQPOKSOIH0qy9F3pq2GfK2QpF+5zIOgJ/pJuGI0E2hw/3JyVZt\nocDpzJ7PWmE4WLR+w53YrdDQE9MeYFzSXlgkeYGhAoGARiRnJQ/hBI0svX8U8T4E\nQcK7LQraG/DXOjcjJZIDt4BS+u5/ZkQbextNFMCSMuxvlvWsJ+EB+vEiPp+CqVxU\na7Y8NlWYdWy3USb13pI42srhp12qjWV6B+GCfmA96UPHipWERREkL7XBE9tU6Qnm\nUn3BsfPMej0P4eFYMEBep+k=\n-----END PRIVATE KEY-----\n";
      
      initializeApp({
        credential: cert({
          projectId: "meesho-auto-listing-tool",
          clientEmail: "firebase-adminsdk-fbsvc@meesho-auto-listing-tool.iam.gserviceaccount.com",
          privateKey: privateKey,
        }),
      });
    } catch (error) {
      console.error('Firebase Admin initialization error', error);
    }
  }
  return {
    adminDb: getFirestore(),
    adminAuth: getAuth()
  };
}

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

    const { adminDb, adminAuth } = getFirebaseAdmin();
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
