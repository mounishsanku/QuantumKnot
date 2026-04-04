import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  cacheDir: path.join(os.tmpdir(), "vite-cache-triggrpay"),
  server: {
    port: 5173,
    strictPort: true,
  },
});
