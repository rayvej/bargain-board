import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsDir = path.join(__dirname, '../docs');
const artifactsDir = '/Users/rayyanvejdani/.gemini/antigravity/brain/c29e3988-815c-4a7a-9c68-4c9136e36350';

// Simple static file server
function createServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  return http.createServer((req, res) => {
    let filePath = path.join(docsDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(500);
          res.end('500 Server Error: ' + err.code);
        }
      } else {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(content, 'utf-8');
      }
    });
  });
}

async function runEvaluation() {
  const server = createServer();
  await new Promise(resolve => server.listen(8181, resolve));
  console.log('Static server listening on http://localhost:8181');

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const errors = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => errors.push(err.message));

  console.log('Navigating to http://localhost:8181...');
  await page.goto('http://localhost:8181', { waitUntil: 'networkidle' });

  // 1. Initial State
  await page.waitForSelector('#deal-grid .deal-card', { timeout: 10000 });
  const initialDealCount = await page.$$eval('#deal-grid .deal-card', cards => cards.length);
  console.log(`Initial page rendered ${initialDealCount} deal cards on screen.`);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_1_landing.png'), fullPage: false });

  // 2. Filter by Nike
  console.log('Selecting Brand: Nike...');
  await page.selectOption('#brand-select', 'Nike');
  await page.waitForTimeout(500);
  const nikeCount = await page.$$eval('#deal-grid .deal-card', cards => cards.length);
  const totalCountText = await page.$eval('#total-deal-count', el => el.textContent);
  console.log(`Filtered by Nike: Showing ${nikeCount} cards (Total matching: ${totalCountText})`);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_2_nike_filtered.png'), fullPage: false });

  // 3. Filter by Size 8.5
  console.log('Selecting Size: 8.5...');
  await page.selectOption('#size-select', '8.5');
  await page.waitForTimeout(500);
  const sizeCount = await page.$$eval('#deal-grid .deal-card', cards => cards.length);
  const sizeTotalCount = await page.$eval('#total-deal-count', el => el.textContent);
  console.log(`Filtered by Size 8.5: Showing ${sizeCount} cards (Total matching: ${sizeTotalCount})`);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_3_size_85.png'), fullPage: false });

  // 4. Inspect First Deal Card Data & Links
  const firstCard = await page.$('#deal-grid .deal-card');
  let firstCardDetails = null;
  if (firstCard) {
    firstCardDetails = await firstCard.evaluate(el => {
      const title = el.querySelector('h3')?.textContent?.trim();
      const price = el.querySelector('.text-lg.font-extrabold')?.textContent?.trim();
      const origPrice = el.querySelector('.line-through')?.textContent?.trim();
      const discount = el.querySelector('.bg-emerald-50, .bg-amber-50, .text-xs.ml-auto')?.textContent?.trim();
      const retailer = el.querySelector('.bottom-2 span.truncate')?.textContent?.trim();
      const dealLink = el.querySelector('.btn-deal')?.getAttribute('href');
      const compareLink = el.querySelector('.btn-compare')?.getAttribute('href');
      const sizesText = el.querySelector('.mt-1.mb-1\\.5')?.textContent?.trim();
      return { title, price, origPrice, discount, retailer, dealLink, compareLink, sizesText };
    });
    console.log('First Deal Card Sample:', JSON.stringify(firstCardDetails, null, 2));

    // Click to open modal
    await firstCard.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactsDir, 'eval_4_deal_modal.png'), fullPage: false });
    
    // Close modal
    await page.click('.close-modal');
    await page.waitForTimeout(300);
  }

  // 5. Test Promo Codes Only Toggle
  console.log('Testing Promo Codes Only Toggle...');
  await page.click('#clear-all-filters-btn');
  await page.waitForTimeout(400);
  await page.locator('label:has(#coupon-toggle)').click();
  await page.waitForTimeout(600);
  const promoDealsCount = await page.$$eval('#deal-grid .deal-card', cards => cards.length);
  const promoTotalCount = await page.$eval('#total-deal-count', el => el.textContent);
  console.log(`Filtered by Promo Codes Only: Showing ${promoDealsCount} cards (Total matching: ${promoTotalCount})`);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_5_coupons_filtered.png'), fullPage: false });

  // Open modal of a promo code deal to verify stacking breakdown
  const firstPromoCard = await page.$('#deal-grid .deal-card');
  if (firstPromoCard) {
    await firstPromoCard.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactsDir, 'eval_6_promo_modal.png'), fullPage: false });
    await page.click('.close-modal');
    await page.waitForTimeout(300);
  }

  // 6. Inspect Store Clearance Portals
  const portals = await page.$$eval('#clearance-portals-list a', links => {
    return links.map(a => ({
      name: a.textContent.trim().replace(/\s+/g, ' '),
      href: a.getAttribute('href')
    }));
  });
  console.log('Generated Clearance Portals:', JSON.stringify(portals, null, 2));

  // 7. Comprehensive Dataset Quality Audit
  const deals = JSON.parse(fs.readFileSync(path.join(docsDir, 'deals-data.json'), 'utf8'));
  const couponCount = deals.filter(d => d.couponCodes && d.couponCodes.length > 0).length;
  const directStoreUrlCount = deals.filter(d => d.productUrl && !d.productUrl.includes('slickdeals.net') && !d.productUrl.includes('google.ca') && !d.productUrl.includes('ebay')).length;
  const googleSearchCount = deals.filter(d => d.productUrl && d.productUrl.includes('google.ca/search')).length;
  const ebayCount = deals.filter(d => (d.productUrl && d.productUrl.includes('ebay')) || (d.retailer || '').toLowerCase().includes('ebay')).length;
  const slickdealsRedirectCount = deals.filter(d => d.productUrl && d.productUrl.includes('slickdeals.net')).length;
  const amazonCount = deals.filter(d => (d.retailer || '').toLowerCase().includes('amazon')).length;

  console.log('\n--- DATASET QUALITY AUDIT ---');
  console.log(`Total Deals in Catalog: ${deals.length}`);
  console.log(`Deals with Coupon Codes: ${couponCount} (${((couponCount/deals.length)*100).toFixed(1)}%)`);
  console.log(`Deals with Direct Merchant Links: ${directStoreUrlCount} (${((directStoreUrlCount/deals.length)*100).toFixed(1)}%)`);
  console.log(`Deals with Google Search URLs: ${googleSearchCount} (Target: 0)`);
  console.log(`Deals with eBay URLs: ${ebayCount} (Target: 0)`);
  console.log(`Deals with Intermediary Slickdeals Redirects: ${slickdealsRedirectCount} (Target: 0)`);
  console.log(`Amazon Deals: ${amazonCount} (${((amazonCount/deals.length)*100).toFixed(1)}%)`);
  console.log(`Console Errors during session: ${errors.length}`);
  if (errors.length > 0) console.log('Errors:', errors);

  await browser.close();
  server.close();
  console.log('Evaluation finished successfully.');
}

runEvaluation().catch(err => {
  console.error('Evaluation error:', err);
  process.exit(1);
});
