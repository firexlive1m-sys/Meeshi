const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf-8');

// Replace everything between getFirestore and Vite Middleware mounting
const startIndex = serverCode.indexOf('const app = express();');
const endIndex = serverCode.indexOf('// Vite Middleware mounting');

if (startIndex > -1 && endIndex > -1) {
  const before = serverCode.substring(0, startIndex);
  const after = serverCode.substring(endIndex);
  
  const newMiddle = `
import { apiRouter } from "./api-router";

const app = express();
export { app };

const PORT = 3000;

app.use("/api", apiRouter);

`;

  fs.writeFileSync('server.ts', before + newMiddle + after);
  console.log('Successfully updated server.ts');
} else {
  console.error('Could not find injection points in server.ts');
}
