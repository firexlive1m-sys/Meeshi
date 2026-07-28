const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(
  `        navigate('/download');\n      };\n\n      saveAndNavigate();`,
  `      };\n\n      saveAndNavigate().then(() => {\n        console.log("saveAndNavigate finished, navigating to /download");\n        navigate('/download');\n      }).catch(err => {\n        console.error("saveAndNavigate failed:", err);\n        navigate('/download');\n      });`
);

fs.writeFileSync('src/pages/Landing.tsx', code);
