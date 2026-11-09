/* Temporary mobile-viewport screenshot driver. Deleted after use. */
const { chromium, devices } = require('@playwright/test');
const fs = require('fs');

const OUT = '/tmp/gsmhub-mobile-shots';
const BASE = 'http://localhost:3000';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ ...devices['Pixel 7'] }); // 412x915, mobile UA, touch, DPR 2.625
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${page.url()}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${page.url()}: ${String(e).slice(0, 200)}`));

  // Pick live slugs from the backend API
  const devRes = await (await fetch('http://localhost:3001/devices?limit=6&sort=latest')).json();
  const slugs = (devRes.devices || []).map((d) => d.slug).filter(Boolean);
  const catRaw = await (await fetch('http://localhost:3001/categories')).json();
  const cats = Array.isArray(catRaw) ? catRaw : catRaw.categories || [];
  const catSlug = cats[0] && cats[0].slug;

  const shots = [
    ['01-home', '/'],
    ['02-search', '/search?q=samsung'],
    ['03-categories', '/categories'],
    ['04-category', `/categories/${catSlug || 'mobile-phones'}`],
    ['05-device', `/devices/${slugs[0] || 'samsung-galaxy-s24-ultra'}`],
    ['06-compare', `/compare?devices=${slugs.slice(0, 2).join(',')}`],
  ];

  for (const [name, path] of shots) {
    try {
      await page.goto(BASE + path, { waitUntil: 'load', timeout: 90000 });
      await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
    } catch (e) {
      errors.push(`[goto] ${path}: ${String(e).slice(0, 140)}`);
    }
    await page.waitForTimeout(800); // settle images/fonts
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    console.log('SHOT', name, page.url());
  }

  fs.writeFileSync(`${OUT}/console-errors.txt`, errors.join('\n') || '(no console errors)');
  console.log('CONSOLE_ERRORS:', errors.length);
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error('DRIVER FAILED:', e); process.exit(1); });
