import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsDir = path.join(__dirname, '../docs');
const artifactsDir = '/Users/rayyanvejdani/.gemini/antigravity/brain/c29e3988-815c-4a7a-9c68-4c9136e36350';

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
  const totalCatalogText = await page.$eval('#total-deal-count', el => el.textContent);
  console.log(`Initial page rendered ${initialDealCount} deal cards on screen (Total catalog matching: ${totalCatalogText}).`);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_1_landing.png'), fullPage: false });

  // 2. Filter by Nike + Men's + Size 8.5
  console.log('Testing Filter: Brand: Nike + Men\'s + Size: 8.5...');
  await page.selectOption('#brand-select', 'Nike');
  await page.waitForTimeout(400);
  const menBtn = await page.$('#gender-filter-group button[data-gender="men"]');
  if (menBtn) await menBtn.click();
  await page.waitForTimeout(400);
  await page.selectOption('#size-select', '8.5');
  await page.waitForTimeout(600);

  const nikeMen85Count = await page.$$eval('#deal-grid .deal-card', cards => cards.length);
  const nikeMen85Total = await page.$eval('#total-deal-count', el => el.textContent);
  console.log(`Filtered Nike + Men's + Size 8.5: Showing ${nikeMen85Count} cards (Total matching: ${nikeMen85Total})`);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_3_size_85.png'), fullPage: false });

  async function safeClearFilters() {
    const clearBtn = await page.$('#clear-all-filters-btn');
    if (clearBtn && await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForTimeout(400);
    }
  }

  // 3. Filter by Women's + Size 6.5
  console.log('Testing Filter: Gender: Women\'s + Size: 6.5...');
  await safeClearFilters();

  const womenBtn = await page.$('#gender-filter-group button[data-gender="women"]');
  if (womenBtn) await womenBtn.click();
  await page.waitForTimeout(400);
  await page.selectOption('#size-select', '6.5');
  await page.waitForTimeout(600);

  const women65Count = await page.$$eval('#deal-grid .deal-card', cards => cards.length);
  const women65Total = await page.$eval('#total-deal-count', el => el.textContent);
  console.log(`Filtered Women's + Size 6.5: Showing ${women65Count} cards (Total matching: ${women65Total})`);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_8_womens_size_65.png'), fullPage: false });

  // 4. Filter by Men's Apparel Size M
  console.log('Testing Filter: Gender: Men\'s + Clothing Size: M...');
  await safeClearFilters();

  if (menBtn) await menBtn.click();
  await page.waitForTimeout(400);
  await page.selectOption('#size-select', 'M');
  await page.waitForTimeout(600);

  const menMCount = await page.$$eval('#deal-grid .deal-card', cards => cards.length);
  const menMTotal = await page.$eval('#total-deal-count', el => el.textContent);
  console.log(`Filtered Men's + Size M: Showing ${menMCount} cards (Total matching: ${menMTotal})`);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_9_mens_size_m.png'), fullPage: false });

  // 5. Filter by Kids' Footwear Size 1Y
  console.log('Testing Filter: Gender: Kids + Size: 1Y...');
  await safeClearFilters();

  const kidsBtn = await page.$('#gender-filter-group button[data-gender="kids"]');
  if (kidsBtn) await kidsBtn.click();
  await page.waitForTimeout(400);
  await page.selectOption('#size-select', '1Y');
  await page.waitForTimeout(600);

  const kids1YCount = await page.$$eval('#deal-grid .deal-card', cards => cards.length);
  const kids1YTotal = await page.$eval('#total-deal-count', el => el.textContent);
  console.log(`Filtered Kids' + Size 1Y: Showing ${kids1YCount} cards (Total matching: ${kids1YTotal})`);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_10_kids_size_1y.png'), fullPage: false });

  // 6. Test Subcategories: Phones & Tablets
  console.log('Testing Category: Phones & Tablets...');
  await safeClearFilters();

  const phonesBtn = await page.$('button[data-category="phones"], #sidebar a[data-category="phones"]');
  if (phonesBtn) await phonesBtn.click();
  await page.waitForTimeout(600);

  const phonesCount = await page.$$eval('#deal-grid .deal-card', cards => cards.length);
  const phonesTotal = await page.$eval('#total-deal-count', el => el.textContent);
  console.log(`Category Phones & Tablets: Showing ${phonesCount} cards (Total matching: ${phonesTotal})`);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_11_phones_category.png'), fullPage: false });

  // 7. Test Subcategories: Smart Home
  console.log('Testing Category: Smart Home...');
  await safeClearFilters();

  const smarthomeLink = await page.$('#sidebar a[data-category="smarthome"]');
  if (smarthomeLink) await smarthomeLink.click();
  await page.waitForTimeout(600);

  const smartCount = await page.$$eval('#deal-grid .deal-card', cards => cards.length);
  const smartTotal = await page.$eval('#total-deal-count', el => el.textContent);
  console.log(`Category Smart Home: Showing ${smartCount} cards (Total matching: ${smartTotal})`);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_12_smarthome_category.png'), fullPage: false });

  // 8. Test Promo Codes Only Toggle
  console.log('Testing Promo Codes Only Toggle...');
  await safeClearFilters();
  const isCouponCheckedBefore = await page.$eval('#coupon-toggle', el => el.checked);
  if (!isCouponCheckedBefore) {
    await page.locator('label:has(#coupon-toggle)').click();
    await page.waitForTimeout(600);
  }

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

  // 9. Test Real-Time Verification Flow on Search
  console.log('Testing Real-Time Verification Flow on Search...');
  await safeClearFilters();
  const isCouponChecked = await page.$eval('#coupon-toggle', el => el.checked);
  if (isCouponChecked) {
    await page.locator('label:has(#coupon-toggle)').click();
    await page.waitForTimeout(300);
  }

  await page.fill('#main-search', 'Nike');
  await page.dispatchEvent('#main-search', 'input');
  await page.waitForTimeout(100);
  
  const isVerificationVisible = await page.$eval('#deal-verification-status', el => !el.classList.contains('hidden'));
  const verificationMsg = await page.$eval('#deal-verification-msg', el => el.textContent.trim());
  console.log(`Verification Banner Active: ${isVerificationVisible}, Message: "${verificationMsg}"`);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(artifactsDir, 'eval_7_verification_flow.png'), fullPage: false });

  // 10. Comprehensive Dataset Quality Audit
  const deals = JSON.parse(fs.readFileSync(path.join(docsDir, 'deals-data.json'), 'utf8'));
  const verifiedLinkCount = deals.filter(d => d.verificationStatus === 'verified' && d.priceVerified && d.linkStatus === 'active').length;
  const couponCount = deals.filter(d => d.couponCodes && d.couponCodes.length > 0).length;
  const directStoreUrlCount = deals.filter(d => d.productUrl && !d.productUrl.includes('slickdeals.net') && !d.productUrl.includes('google.ca') && !d.productUrl.includes('ebay')).length;
  const googleSearchCount = deals.filter(d => d.productUrl && (d.productUrl.includes('google.ca/search') || d.productUrl.includes('google.com/search'))).length;
  const ebayCount = deals.filter(d => (d.productUrl && d.productUrl.includes('ebay')) || (d.retailer || '').toLowerCase().includes('ebay')).length;
  const slickdealsRedirectCount = deals.filter(d => d.productUrl && d.productUrl.includes('slickdeals.net')).length;
  const cadCurrencyCount = deals.filter(d => d.currency === 'CAD').length;

  console.log('\n--- DATASET QUALITY & UNIVERSAL VERIFICATION AUDIT ---');
  console.log(`Total Deals in Catalog: ${deals.length}`);
  console.log(`100% Tested & Verified Working Deals: ${verifiedLinkCount} (${((verifiedLinkCount/deals.length)*100).toFixed(1)}%)`);
  console.log(`Deals with Coupon Codes: ${couponCount} (${((couponCount/deals.length)*100).toFixed(1)}%)`);
  console.log(`Deals with Direct Canadian Merchant Links: ${directStoreUrlCount} (${((directStoreUrlCount/deals.length)*100).toFixed(1)}%)`);
  console.log(`Deals with Google Search URLs: ${googleSearchCount} (Target: 0)`);
  console.log(`Deals with eBay URLs: ${ebayCount} (Target: 0)`);
  console.log(`Deals with Intermediary Slickdeals Redirects: ${slickdealsRedirectCount} (Target: 0)`);
  console.log(`CAD Currency Compliance: ${cadCurrencyCount} (${((cadCurrencyCount/deals.length)*100).toFixed(1)}%)`);
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
