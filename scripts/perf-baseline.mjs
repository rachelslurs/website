#!/usr/bin/env node
/**
 * P0 bundle reality check: summarize JS/CSS emitted under dist/ after `npm run build`.
 * Run: `npm run build && npm run perf:report`
 * Does not replace Lighthouse; use alongside Stop 0 in the perf plan.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const distDir = path.join(root, "dist");

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walkFiles(p));
    else out.push(p);
  }
  return out;
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MiB`;
}

function main() {
  if (!fs.existsSync(distDir)) {
    console.error(
      "No dist/ folder. Run: npm run build && npm run perf:report\n"
    );
    process.exit(1);
  }

  const all = walkFiles(distDir);
  const assets = all
    .filter(f => /\.(js|mjs|css)$/i.test(f))
    .map(f => ({
      rel: path.relative(distDir, f),
      bytes: fs.statSync(f).size,
    }))
    .sort((a, b) => b.bytes - a.bytes);

  const js = assets.filter(a => /\.(js|mjs)$/i.test(a.rel));
  const css = assets.filter(a => /\.css$/i.test(a.rel));

  const sum = arr => arr.reduce((s, x) => s + x.bytes, 0);

  console.log("perf baseline — production dist sizes\n");
  console.log(`Total JS (all chunks): ${fmtBytes(sum(js))} (${js.length} files)`);
  console.log(`Total CSS files:       ${fmtBytes(sum(css))} (${css.length} files)`);
  if (css.length === 0) {
    console.log(
      "(No separate .css under dist/ — styles may be inlined in HTML; see `build.inlineStylesheets` in astro.config.)"
    );
  }
  console.log("\nLargest assets (top 25):\n");

  const top = assets.slice(0, 25);
  const labelW = Math.max(...top.map(t => t.rel.length), 10);

  for (const { rel, bytes } of top) {
    console.log(`${rel.padEnd(labelW)}  ${fmtBytes(bytes).padStart(12)}`);
  }

  if (assets.length > 25) {
    console.log(`\n… ${assets.length - 25} more files under dist/`);
  }

  console.log(`
Next (manual — use npm run preview + Chrome, not astro dev):
  • Lighthouse: Mobile, throttled, save JSON for before/after
  • Performance: Main thread "Scripting" in first ~3s on / and a long post
  • Network: filter JS — note total transfer vs this byte count (gzip differs)
See scripts/perf-p0-checklist.md for the full P0 gate.
`);
}

main();
