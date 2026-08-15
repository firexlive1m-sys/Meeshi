const fs = require('fs');

let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');
content = content.replace("import emailjs from '@emailjs/browser';", "");
content = content.replace(/try\s*\{\s*if\s*\(customerEmail\)\s*\{\s*await\s*emailjs\.send\([\s\S]*?\}\s*\}?\s*catch\s*\(emailErr\)\s*\{\s*console\.error\("EmailJS sending error:",\s*emailErr\);\s*\}/gm, "");

fs.writeFileSync('src/pages/Landing.tsx', content);

let packageJson = fs.readFileSync('package.json', 'utf8');
packageJson = packageJson.replace(/"@emailjs\/browser": "[^"]+",?/g, "");
fs.writeFileSync('package.json', packageJson);

