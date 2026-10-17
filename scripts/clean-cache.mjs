import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const nextDir = path.join(projectRoot, ".next");

if (fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log("[PulseSocial] Successfully cleaned .next cache directory.");
  } catch (err) {
    console.warn("[PulseSocial] Note: .next cleanup warning:", err.message);
  }
} else {
  console.log("[PulseSocial] .next directory already clean.");
}
