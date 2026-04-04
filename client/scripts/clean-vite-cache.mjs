import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.join(__dirname, "..");
const dirs = [
  path.join(clientRoot, "node_modules", ".vite"),
  path.join(os.tmpdir(), "vite-cache-triggrpay"),
];

for (const d of dirs) {
  try {
    fs.rmSync(d, { recursive: true, force: true });
    console.log("[clean-vite-cache] removed", d);
  } catch {
    /* ignore */
  }
}
