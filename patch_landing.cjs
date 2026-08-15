const fs = require('fs');
const file = 'src/pages/Landing.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add getDoc import
if (!content.includes('getDoc')) {
    content = content.replace("import { doc, setDoc } from 'firebase/firestore';", "import { doc, setDoc, getDoc } from 'firebase/firestore';");
}

// 2. Add PasswordSetupModal import
if (!content.includes('PasswordSetupModal')) {
    content = content.replace("import PaymentFormModal from '../components/PaymentFormModal';", "import PaymentFormModal from '../components/PaymentFormModal';\nimport PasswordSetupModal from '../components/PasswordSetupModal';");
}

// 3. Add state variables inside Landing component
if (!content.includes('setShowPasswordSetup')) {
    content = content.replace("const [paymentOrderId, setPaymentOrderId] = useState<string>('');", "const [paymentOrderId, setPaymentOrderId] = useState<string>('');\n  const [showPasswordSetup, setShowPasswordSetup] = useState(false);\n  const [purchasedEmail, setPurchasedEmail] = useState('');");
}

// 4. Update saveAndNavigate
const oldSaveBlock = `        if (auth.currentUser && auth.currentUser.email && auth.currentUser.email.toLowerCase() !== customerEmail) {
          try {
            await signOut(auth);
          } catch (err) {
            console.error("Failed to sign out previous user", err);
          }
        }

        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/download');`;

const newSaveBlock = `        if (auth.currentUser && auth.currentUser.email && auth.currentUser.email.toLowerCase() !== customerEmail) {
          try {
            await signOut(auth);
          } catch (err) {
            console.error("Failed to sign out previous user", err);
          }
        }

        let hasPwd = false;
        try {
           const docRef = doc(db, 'purchases', customerEmail);
           const docSnap = await getDoc(docRef);
           if (docSnap.exists() && docSnap.data().hasPassword === true) {
              hasPwd = true;
           }
        } catch (e) {
           console.error("Error checking password status", e);
        }

        window.history.replaceState({}, document.title, window.location.pathname);
        if (hasPwd) {
           navigate('/download');
        } else {
           setPurchasedEmail(customerEmail);
           setShowPasswordSetup(true);
        }`;
content = content.replace(oldSaveBlock, newSaveBlock);

// 5. Add Modal to JSX
const oldJsxEnd = `      <PaymentFormModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        planName="Combo Plan Upgrade" 
        planPrice={149}
        initialEmail={user?.email}
        initialName={purchase?.name}
        initialPhone={purchase?.phone}
        isEmailLocked={true}
        isUpgrade={true}
      />
    </div>`;

const newJsxEnd = `      <PaymentFormModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        planName="Combo Plan Upgrade" 
        planPrice={149}
        initialEmail={user?.email}
        initialName={purchase?.name}
        initialPhone={purchase?.phone}
        isEmailLocked={true}
        isUpgrade={true}
      />
      <PasswordSetupModal 
        isOpen={showPasswordSetup} 
        email={purchasedEmail} 
        onComplete={() => {
           setShowPasswordSetup(false);
           navigate('/download');
        }} 
      />
    </div>`;
content = content.replace(oldJsxEnd, newJsxEnd);

fs.writeFileSync(file, content);
