import fs from 'fs/promises';
import { logger } from './utils/logger.js';
import { normalizeDeal } from './utils/deal-normalizer.js';
import { dedupDeals } from './utils/dedup.js';

const BESTBUY_API_KEY = process.env.BESTBUY_API_KEY;

async function main() {
  if (!BESTBUY_API_KEY) {
    logger.warn('BESTBUY_API_KEY missing. Skipping Best Buy scrape.');
    return;
  }

  logger.info('Starting Best Buy scrape...');
  
  // Scrape electronics products currently on sale with >15% savings
  const endpoint = `https://api.bestbuy.com/v1/products(onSale=true&percentSavings>15)?apiKey=${BESTBUY_API_KEY}&show=sku,name,salePrice,regularPrice,percentSavings,url,image,categoryPath&format=json&pageSize=100`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const rawDeals = data.products.map(p => ({
      title: p.name,
      url: p.url,
      imageUrl: p.image,
      originalPrice: p.regularPrice,
      salePrice: p.salePrice,
      savingsPercent: p.percentSavings,
      retailer: 'Best Buy',
      description: p.categoryPath ? p.categoryPath.map(c => c.name).join(' > ') : ''
    }));

    const normalized = rawDeals.map(raw => normalizeDeal(raw, 'BestBuyAPI'));
    const deduped = dedupDeals(normalized);

    const outputPath = '/tmp/bargain-board-bestbuy.json';
    await fs.writeFile(outputPath, JSON.stringify(deduped, null, 2));
    logger.success(`Saved ${deduped.length} Best Buy deals to ${outputPath}`);
  } catch (error) {
    logger.error('Best Buy scraping failed', error.message);
  }
}

main().catch(err => logger.error('BestBuy script crashed', err));
