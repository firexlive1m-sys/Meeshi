import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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

export const adminDb = getFirestore();
export const adminAuth = getAuth();
