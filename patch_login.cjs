const fs = require('fs');
const file = 'src/components/LoginScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add getDoc, doc to imports
if (!content.includes('getDoc')) {
    content = content.replace("import { auth, googleProvider } from '../firebase';", "import { auth, googleProvider, db } from '../firebase';\nimport { doc, getDoc } from 'firebase/firestore';");
} else {
    // If it's already there somehow, just make sure db is imported.
    if (!content.includes('db } from')) {
        content = content.replace("import { auth, googleProvider } from '../firebase';", "import { auth, googleProvider, db } from '../firebase';");
    }
}

// 2. Replace handleVerify function
const oldHandleVerify = `  const handleVerify = async (emailToVerify: string, phoneToVerify: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/verify-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify, phone: phoneToVerify })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Purchase not found. Please check your email and phone number or purchase the tool first.");
      } else {
        if (data.hasPassword) {
          setLoginStep('enter_password');
        } else {
          setError("No password has been set for this account yet. Please use 'Continue with Google'.");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };`;

const newHandleVerify = `  const handleVerify = async (emailToVerify: string, phoneToVerify: string) => {
    setLoading(true);
    setError(null);
    try {
      const emailLower = emailToVerify.toLowerCase().trim();
      const phoneDigits = phoneToVerify.replace(/\\D/g, '');
      const docRef = doc(db, 'purchases', emailLower);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError("Purchase not found. Please check your email and phone number or purchase the tool first.");
        setLoading(false);
        return;
      }

      const purchaseData = docSnap.data();
      const savedPhone = (purchaseData.phone || purchaseData.contact || '').toString().replace(/\\D/g, '');

      if (savedPhone !== phoneDigits) {
        setError("Purchase not found. Please check your email and phone number or purchase the tool first.");
        setLoading(false);
        return;
      }

      if (purchaseData.hasPassword === true) {
        setLoginStep('enter_password');
      } else {
        setError("No password has been set for this account yet. Please use 'Continue with Google'.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      if (err.code === 'permission-denied') {
        setError("Missing permissions. Please try again.");
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };`;

content = content.replace(oldHandleVerify, newHandleVerify);

fs.writeFileSync(file, content);
