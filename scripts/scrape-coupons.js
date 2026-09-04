import fs from 'fs/promises';
import { logger } from './utils/logger.js';
import { normalizeDeal } from './utils/deal-normalizer.js';
import { dedupDeals } from './utils/dedup.js';

const LINKMYDEALS_API_KEY = process.env.LINKMYDEALS_API_KEY;

async function main() {
  if (!LINKMYDEALS_API_KEY) {
    logger.warn('LINKMYDEALS_API_KEY missing. Skipping coupon scrape.');
    return;
  }

  logger.info('Starting LinkMyDeals scrape...');
  
  const endpoint = `https://linkmydeals.com/getOffers/?API_KEY=${LINKMYDEALS_API_KEY}&format=json&incremental=0`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (!data.offers || !Array.isArray(data.offers)) {
      throw new Error('Invalid LinkMyDeals response format');
    }

    // LinkMyDeals often returns affiliate URLs directly, but we map them best we can
    const rawDeals = data.offers.map(offer => {
      return {
        title: offer.title,
        description: offer.description,
        url: offer.url || `https://linkmydeals.com/offer/${offer.lmd_id}`,
        retailer: offer.store,
        couponCodes: offer.code ? [{
          code: offer.code,
          discount: offer.title,
          verified: false,
          stackable: false,
          stacksWith: [],
          restrictions: ''
        }] : [],
      };
    });

    const normalized = rawDeals.map(raw => normalizeDeal(raw, 'LinkMyDeals'));
    const deduped = dedupDeals(normalized);

    const outputPath = '/tmp/bargain-board-coupons.json';
    await fs.writeFile(outputPath, JSON.stringify(deduped, null, 2));
    logger.success(`Saved ${deduped.length} coupon deals to ${outputPath}`);
  } catch (error) {
    logger.error('LinkMyDeals scraping failed', error.message);
  }
}

main().catch(err => logger.error('Coupons script crashed', err));
