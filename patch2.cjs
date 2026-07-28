const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const target = `// Automated Email Sending Logic using EmailJS
        try {
          if (customerEmail && import.meta.env.VITE_EMAILJS_SERVICE_ID) {
            await emailjs.send(
              import.meta.env.VITE_EMAILJS_SERVICE_ID,
              import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
              {
                to_name: customerName,
                to_email: customerEmail,
                plan_name: storedPlan,
                order_id: orderId || 'N/A',
                download_link: window.location.origin + '/download'
              },
              import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );`;

const replacement = `// Automated Email Sending Logic using EmailJS
        try {
          const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_9naplmf';
          const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_zbzfxdh';
          const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'CSaUWlrxqThlBwlRF';
          
          if (customerEmail) {
            await emailjs.send(
              serviceId,
              templateId,
              {
                to_name: customerName,
                to_email: customerEmail,
                plan_name: storedPlan,
                order_id: orderId || 'N/A',
                download_link: window.location.origin + '/download'
              },
              publicKey
            );`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Landing.tsx', code);
