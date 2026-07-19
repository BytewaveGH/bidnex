const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "node_modules", "@ffmpeg", "core", "dist", "umd");
const destDir = path.join(__dirname, "..", "public", "ffmpeg");

if (!fs.existsSync(srcDir)) {
  console.warn("[copy-ffmpeg-core] @ffmpeg/core not found, skipping. Run `npm install` first.");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

for (const file of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}

console.log("[copy-ffmpeg-core] Copied ffmpeg-core assets to public/ffmpeg");
