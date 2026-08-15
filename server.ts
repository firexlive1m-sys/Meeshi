import express from "express";
import path from "path";
import dotenv from "dotenv";
import { apiRouter } from "./api-router";

dotenv.config();

const app = express();
export { app };

const PORT = 3000;
app.use("/api", apiRouter);

// Vite Middleware mounting
if (process.env.NODE_ENV !== "production") {
  // Note: We use dynamic import for createViteServer to avoid blocking module loading
  import("vite").then(({ createServer: createViteServer }) => {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then(vite => {
      app.use(vite.middlewares);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Only start the server if we are running it directly (not on Vercel)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
