const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'app.get("/api/session/:token", async (req, res) => {',
  'app.get("/api/session", async (req, res) => {'
);
content = content.replace(
  'const token = req.params.token;',
  'const token = req.query.token;'
);

fs.writeFileSync('server.ts', content);
