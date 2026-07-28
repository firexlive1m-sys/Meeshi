const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(
  `        try {\n          if (customerEmail) {`,
  `        try {\n          console.log("EMAIL STEP STARTED");\n          console.log("Checkout Email:", customerEmail);\n          if (customerEmail) {`
);

fs.writeFileSync('src/pages/Landing.tsx', code);
