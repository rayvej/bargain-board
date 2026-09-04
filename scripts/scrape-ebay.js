import fs from 'fs/promises';
import { logger } from './utils/logger.js';
import { normalizeDeal } from './utils/deal-normalizer.js';
import { dedupDeals } from './utils/dedup.js';

const CLIENT_ID = process.env.EBAY_CLIENT_ID;
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;

async function getAuthToken() {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
  });

  if (!response.ok) throw new Error(`Auth HTTP ${response.status}`);
  const data = await response.json();
  return data.access_token;
}

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    logger.warn('eBay credentials missing. Skipping eBay scrape.');
    return;
  }

  logger.info('Starting eBay scrape...');

  try {
    const token = await getAuthToken();
    const query = 'electronics'; // Generic query for deals
    const endpoint = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${query}&filter=price:[10..1000],buyingOptions:{FIXED_PRICE}&limit=50`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-ENDUSERCTX': 'affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId>' 
      }
    });

    if (!response.ok) throw new Error(`Search HTTP ${response.status}`);
    const data = await response.json();

    const rawDeals = (data.itemSummaries || []).map(item => ({
      title: item.title,
      url: item.itemWebUrl,
      imageUrl: item.image ? item.image.imageUrl : '',
      salePrice: item.price ? item.price.value : 0,
      currency: item.price ? item.price.currency : 'USD',
      retailer: 'eBay',
      description: item.condition ? `Condition: ${item.condition}` : ''
    }));

    const normalized = rawDeals.map(raw => normalizeDeal(raw, 'eBayAPI'));
    const deduped = dedupDeals(normalized);

    const outputPath = '/tmp/bargain-board-ebay.json';
    await fs.writeFile(outputPath, JSON.stringify(deduped, null, 2));
    logger.success(`Saved ${deduped.length} eBay deals to ${outputPath}`);
  } catch (error) {
    logger.error('eBay scraping failed', error.message);
  }
}

main().catch(err => logger.error('eBay script crashed', err));
