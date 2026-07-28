const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(
  /(\s+)try \{\n\s+if \(customerEmail\) \{/,
  `$1console.log("EMAIL STEP STARTED");$1console.log("Checkout Email:", customerEmail);$1console.log("Order ID:", orderId);$1try {\n$1  if (customerEmail) {`
);

fs.writeFileSync('src/pages/Landing.tsx', code);
