import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from './utils/logger.js';

async function main() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    logger.error('FIREBASE_SERVICE_ACCOUNT_KEY missing.');
    return;
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  logger.info('Cleaning up expired deals...');

  const now = new Date().toISOString();
  
  // Find deals where expiresAt is less than the current time
  const expiredQuery = db.collection('deals').where('expiresAt', '<', now).limit(500);
  
  let deletedCount = 0;
  
  while (true) {
    const snapshot = await expiredQuery.get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    deletedCount += snapshot.size;
    logger.info(`Deleted batch of ${snapshot.size} expired deals...`);
  }

  logger.success(`Cleanup complete. Total deleted: ${deletedCount}`);
}

main().catch(err => logger.error('Cleanup script failed', err));
