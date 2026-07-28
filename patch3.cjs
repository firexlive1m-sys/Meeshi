const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const target = `              {
                to_name: customerName,
                to_email: customerEmail,
                plan_name: storedPlan,
                order_id: orderId || 'N/A',
                download_link: window.location.origin + '/download'
              },`;

const replacement = `              {
                name: customerName,
                email: customerEmail,
                plan_name: storedPlan,
                order_id: orderId || 'N/A',
                download_link: window.location.origin + '/download'
              },`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Landing.tsx', code);
