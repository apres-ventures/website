// Drives index.html through a few full cycles and saves canvas screenshots
// at intervals. Outputs to ./frames (gitignored).
//
// Usage:
//   npm run capture                       # default 50 frames @ 1s, 1920x1080
//   npm run capture -- --duration 90      # 90 seconds of captures
//   npm run capture -- --interval 0.8     # capture every 0.8s
//   npm run capture -- --width 2560 --height 1440
//   npm run capture -- --url http://localhost:5173   # capture a running URL instead
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, arr) => {
    if (v.startsWith('--')) acc.push([v.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const DURATION  = Number(args.duration ?? 50);
const INTERVAL  = Number(args.interval ?? 1.0);
const WIDTH     = Number(args.width    ?? 1920);
const HEIGHT    = Number(args.height   ?? 1080);
const URL       = args.url ?? ('file://' + path.join(ROOT, 'index.html'));

const FRAMES = path.join(ROOT, 'frames');
fs.mkdirSync(FRAMES, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto(URL);
await page.waitForSelector('canvas');

// Let the font load and the FBO sim warm up.
await page.waitForTimeout(2000);

const total = Math.floor(DURATION / INTERVAL);
console.log(`Capturing ${total} frames over ${DURATION}s @ ${WIDTH}×${HEIGHT}…`);

for (let i = 0; i < total; i++) {
  const t = (i * INTERVAL).toFixed(1).padStart(5, '0');
  const file = path.join(FRAMES, `frame-${String(i).padStart(3, '0')}-t${t}s.png`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  process.stdout.write(`\r  ${i + 1}/${total} → ${path.basename(file)}     `);
  if (i < total - 1) await page.waitForTimeout(INTERVAL * 1000);
}
console.log(`\nDone. ${total} frames in ${FRAMES}/`);

await browser.close();
