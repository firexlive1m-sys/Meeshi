const fs = require('fs');

let content = fs.readFileSync('src/pages/Download.tsx', 'utf8');

const replacement = `
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const loadUserPurchase = async (userEmail) => {
     try {
        const pendingPurchaseStr = localStorage.getItem('verified_purchase');
        if (pendingPurchaseStr) {
          const pendingPurchase = JSON.parse(pendingPurchaseStr);
          if (pendingPurchase.email.toLowerCase() === userEmail.toLowerCase()) {
            await setDoc(doc(db, 'purchases', userEmail.toLowerCase()), pendingPurchase.data, { merge: true });
            localStorage.removeItem('verified_purchase');
          }
        }
        const docRef = doc(db, 'purchases', userEmail.toLowerCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPurchase(docSnap.data());
        } else {
          setPurchase(null);
        }
     } catch (err) {
        console.error("Error fetching/syncing purchase", err);
     }
  };

  useEffect(() => {
    // Check for custom OTP session
    const sessionToken = localStorage.getItem('otp_session_token');
    
    const verifySession = async () => {
      if (sessionToken) {
        try {
          const res = await fetch(\`/api/session/\${sessionToken}\`);
          if (res.ok) {
            const data = await res.json();
            if (data.valid && data.email) {
              setUser({ email: data.email });
              await loadUserPurchase(data.email);
              setLoading(false);
              return;
            }
          }
          // Invalid session
          localStorage.removeItem('otp_session_token');
        } catch (err) {
          console.error("Session verification failed", err);
        }
      }
      
      // Fallback to Firebase Auth
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser && currentUser.email) {
          setUser(currentUser);
          await loadUserPurchase(currentUser.email);
        }
        setLoading(false);
      });
      return unsubscribe;
    };
    
    verifySession();
  }, []);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setLoginError('');
    if (!emailInput || !emailInput.includes('@')) {
      setLoginError('Please enter a valid email address.');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setCooldown(60);
      } else {
        setLoginError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setLoginError('');
    if (otpInput.length !== 6) {
      setLoginError('Please enter a valid 6-digit OTP.');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, otp: otpInput })
      });
      const data = await res.json();
      if (res.ok && data.sessionToken) {
        localStorage.setItem('otp_session_token', data.sessionToken);
        setUser({ email: data.email });
        await loadUserPurchase(data.email);
      } else {
        setLoginError(data.error || 'Invalid OTP.');
      }
    } catch (err) {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    localStorage.removeItem('otp_session_token');
    setUser(null);
    setPurchase(null);
  };
`;

content = content.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);\n\n  const handleLogin = async \(\) => \{[\s\S]*?catch \(error\) \{[\s\S]*?\}[\s\S]*?\}\;\n\n  const handleLogout = \(\) => \{[\s\S]*?\}\;/m, replacement);

fs.writeFileSync('src/pages/Download.tsx', content);
