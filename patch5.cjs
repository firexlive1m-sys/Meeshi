const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(
  `    const status = params.get('payment_status');`,
  `    const status = params.get('payment_status');\n    console.log("PAYMENT STATUS FROM URL:", status);\n    console.log("ORDER ID FROM URL:", params.get('order_id'));`
);

fs.writeFileSync('src/pages/Landing.tsx', code);
