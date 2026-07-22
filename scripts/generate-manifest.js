#!/usr/bin/env node
/**
 * Optional helper: scans /images and writes images/manifest.json.
 * Use this if your slide files are not sequentially numbered
 * (e.g. mixed names), or if you want to skip the browser's
 * auto-probing on first load. Not required for the 01.png, 02.png...
 * naming convention — the site detects those automatically.
 *
 * Usage: node scripts/generate-manifest.js
 */
const fs = require("fs");
const path = require("path");

const IMAGES_DIR = path.join(__dirname, "..", "images");
const OUTPUT_FILE = path.join(IMAGES_DIR, "manifest.json");
const VALID_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`images 폴더를 찾을 수 없습니다: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => VALID_EXT.has(path.extname(f).toLowerCase()))
    .sort(naturalCompare);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(files, null, 2) + "\n");
  console.log(`manifest.json 생성 완료 (${files.length}개 파일): ${OUTPUT_FILE}`);
}

main();
