const fs = require('fs');

const file = 'src/pages/Download.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import LoginScreen from '../components/LoginScreen';\n";
if (!content.includes(importStatement)) {
    content = content.replace("import PaymentFormModal from '../components/PaymentFormModal';", "import PaymentFormModal from '../components/PaymentFormModal';\n" + importStatement);
}

// Find the Not Logged In State block
const regex = /\/\/ Not Logged In State\n\s*if \(\!user\) \{\n\s*return \(([\s\S]*?)(\n\s*\);\n\s*\})/m;

content = content.replace(regex, "// Not Logged In State\n  if (!user) {\n    return <LoginScreen />;\n  }");

fs.writeFileSync(file, content);
