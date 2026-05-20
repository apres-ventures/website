// Generates apple-touch-icon.png (180x180) from an HTML snippet using Playwright.
// Run with: npm run gen-icon
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'apple-touch-icon.png');

const html = `<!doctype html><html><head><style>
  html, body { margin: 0; padding: 0; background: #000; }
  .av {
    width: 180px; height: 180px;
    display: flex; align-items: center; justify-content: center;
    color: #cfe2ff;
    font: 500 84px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    letter-spacing: 4px;
  }
</style></head><body><div class="av">AV</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
await page.setContent(html);
await page.waitForLoadState('networkidle');
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 180, height: 180 } });
await browser.close();
console.log(`wrote ${OUT}`);
