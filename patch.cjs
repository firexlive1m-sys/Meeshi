const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const target = `window.history.replaceState({}, document.title, window.location.pathname);`;

const replacement = `
        // Automated Email Sending Logic using EmailJS
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
            );
            console.log("Automated email sent successfully!");
          }
        } catch (emailErr) {
          console.error("Failed to send automated email:", emailErr);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Landing.tsx', code);
