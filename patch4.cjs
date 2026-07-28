const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

const regex = /(\s*if \(orderId\) \{\n\s*const emailSentKey = `email_sent_\$\{orderId\}`;[\s\S]*?console\.error\("EmailJS FAILED - Error details:", emailErr\);\n\s*\}\n\s*\}\n\s*\})/;

const match = code.match(regex);
if (match) {
  // Remove it from current location
  code = code.replace(regex, '');
  
  // Insert it before the try-catch for firebase
  code = code.replace(
    /(\s*)try \{\n\s*if \(customerEmail\) \{\n\s*const lowerEmail = customerEmail\.toLowerCase\(\);\n\s*await setDoc/,
    match[0] + "\n$1try {\n$1  if (customerEmail) {\n$1    const lowerEmail = customerEmail.toLowerCase();\n$1    await setDoc"
  );
  fs.writeFileSync('src/pages/Landing.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Regex not found");
}
