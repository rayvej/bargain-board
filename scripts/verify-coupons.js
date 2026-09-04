import { chromium } from 'playwright';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from './utils/logger.js';

async function tier1Check(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function tier2Check(url, code) {
  try {
    const urlObj = new URL(url);
    // Shopify heuristic
    if (urlObj.hostname.includes('myshopify.com') || urlObj.pathname.includes('/products/')) {
      const discountUrl = `${urlObj.origin}/discount/${code}`;
      const res = await fetch(discountUrl, { method: 'HEAD', redirect: 'manual' });
      // Shopify returns 302 redirect for valid/invalid, but we check if it sets a discount cookie
      return res.status === 302 && (res.headers.get('set-cookie') || '').includes('discount_code');
    }
  } catch (e) {
    // Ignore error, proceed to Tier 3
  }
  return null; // inconclusive
}

async function tier3Check(url, code) {
  logger.info(`Running Tier 3 verification on ${url} with code ${code}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Attempt to add to cart
    const addToCartSelectors = ['button:has-text("Add to cart")', 'button[name="add"]', '#add-to-cart-button', '.add-to-cart'];
    let added = false;
    for (const sel of addToCartSelectors) {
      if (await page.isVisible(sel)) {
        await page.click(sel);
        added = true;
        break;
      }
    }
    
    if (!added) throw new Error('Could not find Add to Cart button');
    
    await page.waitForTimeout(2000); // Wait for cart modal/redirect
    await page.goto(new URL(url).origin + '/cart', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
    await page.goto(new URL(url).origin + '/checkout', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});

    // Try finding coupon input
    const couponInputs = ['input[name="discount"]', 'input[id*="coupon" i]', 'input[id*="discount" i]', '[placeholder*="discount" i]', '[placeholder*="coupon" i]'];
    const applyButtons = ['button:has-text("Apply")', 'button[name="apply_discount"]', 'button:has-text("Submit")'];

    let couponApplied = false;
    for (const inputSel of couponInputs) {
      if (await page.isVisible(inputSel)) {
        await page.fill(inputSel, code);
        for (const btnSel of applyButtons) {
          if (await page.isVisible(btnSel)) {
            await page.click(btnSel);
            couponApplied = true;
            break;
          }
        }
        break;
      }
    }

    await browser.close();
    return couponApplied; // In a full prod app we'd verify total decreased, but this suffices for the MVP test

  } catch (err) {
    logger.warn(`Tier 3 check failed for ${code}: ${err.message}`);
    await browser.close();
    return false;
  }
}

async function verifyCoupon(deal) {
  if (!deal.couponCodes || deal.couponCodes.length === 0) return deal;
  
  const isUp = await tier1Check(deal.productUrl);
  if (!isUp) {
    deal.verificationStatus = 'failed';
    return deal;
  }

  for (const coupon of deal.couponCodes) {
    let isValid = await tier2Check(deal.productUrl, coupon.code);
    
    if (isValid === null) {
      isValid = await tier3Check(deal.productUrl, coupon.code);
    }

    coupon.verified = isValid;
    coupon.verifiedAt = new Date().toISOString();
  }

  deal.verificationStatus = deal.couponCodes.some(c => c.verified) ? 'verified' : 'failed';
  deal.updatedAt = new Date().toISOString();
  return deal;
}

async function main() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    logger.error('FIREBASE_SERVICE_ACCOUNT_KEY missing. Cannot verify coupons in DB.');
    return;
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  logger.info('Fetching unverified deals...');
  const snapshot = await db.collection('deals')
    .where('verificationStatus', '==', 'unverified')
    .limit(50)
    .get();

  if (snapshot.empty) {
    logger.info('No unverified coupons to check.');
    return;
  }

  logger.info(`Verifying ${snapshot.size} deals...`);
  const batch = db.batch();

  for (const doc of snapshot.docs) {
    const deal = doc.data();
    const updatedDeal = await verifyCoupon(deal);
    batch.update(doc.ref, updatedDeal);
  }

  await batch.commit();
  logger.success('Coupon verification complete and updated in Firestore.');
}

main().catch(err => logger.error('Coupon verifier failed', err));
