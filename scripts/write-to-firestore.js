import fs from 'fs/promises';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from './utils/logger.js';
import { dedupDeals } from './utils/dedup.js';

async function main() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    logger.error('FIREBASE_SERVICE_ACCOUNT_KEY missing. Cannot write to Firestore.');
    return;
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  logger.info('Reading temporary JSON files...');
  
  const sources = [
    '/tmp/bargain-board-rss.json',
    '/tmp/bargain-board-bestbuy.json',
    '/tmp/bargain-board-ebay.json',
    '/tmp/bargain-board-coupons.json'
  ];

  let allDeals = [];

  for (const src of sources) {
    try {
      const content = await fs.readFile(src, 'utf8');
      const deals = JSON.parse(content);
      allDeals = allDeals.concat(deals);
      logger.info(`Loaded ${deals.length} deals from ${src}`);
    } catch (err) {
      logger.warn(`Could not read ${src} (might be empty or failed).`);
    }
  }

  // Final deduplication across all sources
  const dedupedDeals = dedupDeals(allDeals);
  logger.info(`Total unique deals to write: ${dedupedDeals.length}`);

  if (dedupedDeals.length === 0) {
    logger.info('No deals to write. Exiting.');
    return;
  }

  // Firestore batch writes (max 500 operations per batch)
  const CHUNK_SIZE = 500;
  for (let i = 0; i < dedupedDeals.length; i += CHUNK_SIZE) {
    const chunk = dedupedDeals.slice(i, i + CHUNK_SIZE);
    const batch = db.batch();

    for (const deal of chunk) {
      const docRef = db.collection('deals').doc(deal.id);
      batch.set(docRef, deal, { merge: true }); // Merge keeps existing verification status if present
    }

    await batch.commit();
    logger.success(`Committed batch ${i / CHUNK_SIZE + 1}`);
  }

  logger.success('All deals successfully written to Firestore.');
}

main().catch(err => logger.error('Firestore writer failed', err));
