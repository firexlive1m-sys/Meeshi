const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(
  /(\s+)try \{\n\s+const response = await emailjs\.send\(/,
  `$1console.log("EmailJS templateParams:", templateParams);$1try {\n$1  console.log("EmailJS request sent");\n$1  const response = await emailjs.send(`
);

fs.writeFileSync('src/pages/Landing.tsx', code);
