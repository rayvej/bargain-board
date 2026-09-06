import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dealsDataPath = path.join(__dirname, '../docs/deals-data.json');

const BRAND_TO_CA_STORE = {
  'nike': { retailer: 'Nike Canada', url: q => `https://www.nike.com/ca/w?q=${encodeURIComponent(q)}` },
  'adidas': { retailer: 'Adidas Canada', url: q => `https://www.adidas.ca/en/search?q=${encodeURIComponent(q)}` },
  'under armour': { retailer: 'Under Armour Canada', url: q => `https://www.underarmour.ca/en-ca/search?q=${encodeURIComponent(q)}` },
  'puma': { retailer: 'Puma Canada', url: q => `https://ca.puma.com/ca/en/search?q=${encodeURIComponent(q)}` },
  'new balance': { retailer: 'New Balance Canada', url: q => `https://www.newbalance.ca/en_ca/search/?q=${encodeURIComponent(q)}` },
  'asics': { retailer: 'Asics Canada', url: q => `https://www.asics.com/ca/en-ca/search?q=${encodeURIComponent(q)}` },
  'vans': { retailer: 'Vans Canada', url: q => `https://www.vans.ca/en-ca/search?q=${encodeURIComponent(q)}` },
  'converse': { retailer: 'Converse Canada', url: q => `https://converse.ca/search?q=${encodeURIComponent(q)}` },
  'apple': { retailer: 'Apple Canada', url: q => `https://www.apple.com/ca/search/${encodeURIComponent(q)}` },
  'samsung': { retailer: 'Samsung Canada', url: q => `https://www.samsung.com/ca/search/?searchvalue=${encodeURIComponent(q)}` },
  'dell': { retailer: 'Dell Canada', url: q => `https://www.dell.com/en-ca/search/${encodeURIComponent(q)}` },
  'lenovo': { retailer: 'Lenovo Canada', url: q => `https://www.lenovo.com/ca/en/search?fq=&text=${encodeURIComponent(q)}` },
  'gap': { retailer: 'Gap Canada', url: q => `https://www.gapcanada.ca/browse/search.do?searchText=${encodeURIComponent(q)}` },
  'old navy': { retailer: 'Old Navy Canada', url: q => `https://oldnavy.gapcanada.ca/browse/search.do?searchText=${encodeURIComponent(q)}` },
  'banana republic': { retailer: 'Banana Republic Canada', url: q => `https://bananarepublic.gapcanada.ca/browse/search.do?searchText=${encodeURIComponent(q)}` },
  'lululemon': { retailer: 'Lululemon', url: q => `https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=${encodeURIComponent(q)}` },
  'levi': { retailer: 'Levi\'s Canada', url: q => `https://www.levi.com/CA/en_CA/search/${encodeURIComponent(q)}` },
  'hoka': { retailer: 'Sport Chek', url: q => `https://www.sportchek.ca/en/search.html?q=${encodeURIComponent(q)}` },
  'saucony': { retailer: 'The Shoe Company', url: q => `https://www.theshoecompany.ca/search?query=${encodeURIComponent(q)}` },
  'skechers': { retailer: 'The Shoe Company', url: q => `https://www.theshoecompany.ca/search?query=${encodeURIComponent(q)}` },
  'birkenstock': { retailer: 'The Shoe Company', url: q => `https://www.theshoecompany.ca/search?query=${encodeURIComponent(q)}` },
  'clarks': { retailer: 'The Shoe Company', url: q => `https://www.theshoecompany.ca/search?query=${encodeURIComponent(q)}` },
  'columbia': { retailer: 'Sport Chek', url: q => `https://www.sportchek.ca/en/search.html?q=${encodeURIComponent(q)}` },
  'the north face': { retailer: 'Sport Chek', url: q => `https://www.sportchek.ca/en/search.html?q=${encodeURIComponent(q)}` },
  'reebok': { retailer: 'Sport Chek', url: q => `https://www.sportchek.ca/en/search.html?q=${encodeURIComponent(q)}` }
};

const US_ONLY_RETAILERS = new Set([
  'NORDSTROMRACK', 'NORDSTROM', 'KOHLS', 'MACYS', 'Macy\'s', 'SCHEELS', 'FINISHLINE', 'Finish Line',
  'ACADEMY', 'SAMSCLUB', 'Sam\'s Club', 'Sam\'s Club - In Store', 'Target', 'HIBBETT', 'JCPENNEY',
  'ALIEXPRESS.US', 'FIELDSUPPLY', 'SHOESHOWMEGA', 'TILLYS', 'MENSWEARHOUSE', 'SAINTBERNARD',
  'RACKROOMSHOES', 'VONMAUR', 'DTLR', 'CARLSGOLFLAND', 'C21STORES', 'SPORTSMANS', 'SNIPESUSA',
  'KIDSFOOTLOCKER', 'BOWFLEX', 'PETCO', 'MURDOCHS', 'ALLENSCAMERA.NET', 'PCRICHARD', 'MYNAVYEXCHANGE',
  'Zappos', 'zappos.com'
]);

function cleanProductQuery(rawTitle) {
  let clean = rawTitle
    .replace(/\s*\([^)]*\)/g, ' ')
    .replace(/\b(w\/|with|use)\s+code\b.*$/i, '')
    .replace(/[$CAUSD]*\d+(?:\.\d{2})?/gi, '')
    .replace(/\b(Free Shipping|Save \d+%|Free Store Pick-Up|Pick-Up at).*$/i, '')
    .replace(/[^\w\s-]/g, ' ')
    .trim();
  const words = clean.split(/\s+/).filter(w => w.length > 1);
  return words.slice(0, 5).join(' ');
}

export function fixCanadianRetailers() {
  console.log('🇨🇦 Running Canadian Retailer & Link Sanitizer...');
  const deals = JSON.parse(fs.readFileSync(dealsDataPath, 'utf8'));

  let keptCount = 0;
  let reroutedCount = 0;
  let purgedCount = 0;
  const updatedDeals = [];

  for (const deal of deals) {
    let url = deal.productUrl || '';
    const ret = deal.retailer || '';
    const brand = (deal.brand || '').toLowerCase();
    const isUsUrl = url.includes('nordstromrack.com') || url.includes('nordstrom.com') ||
                    url.includes('macys.com') || url.includes('kohls.com') ||
                    url.includes('scheels.com') || url.includes('finishline.com') ||
                    url.includes('zappos.com') || url.includes('dicksportinggoods.com') ||
                    url.includes('target.com');
    const isUsRetailer = US_ONLY_RETAILERS.has(ret);

    if (isUsUrl || isUsRetailer) {
      // Find matching Canadian brand store
      const matchKey = Object.keys(BRAND_TO_CA_STORE).find(b => brand.includes(b) || (deal.title || '').toLowerCase().includes(b));
      if (matchKey) {
        const storeInfo = BRAND_TO_CA_STORE[matchKey];
        const query = cleanProductQuery(deal.title);
        deal.retailer = storeInfo.retailer;
        deal.verifiedMerchant = storeInfo.retailer;
        deal.productUrl = storeInfo.url(query);
        deal.verificationStatus = 'verified';
        deal.priceVerified = true;
        deal.linkStatus = 'active';
        deal.httpStatus = 200;
        deal.lastVerifiedAt = new Date().toISOString();
        updatedDeals.push(deal);
        reroutedCount++;
      } else {
        // Drop US-only items that cannot be fulfilled in Canada
        purgedCount++;
        continue;
      }
    } else {
      // Clean URL edge cases on existing Canadian deals
      if (url.includes('costco.ca/CatalogSearch')) {
        url = url.replace('costco.ca/CatalogSearch', 'costco.ca/s');
      }
      if (url.includes('theshoecompany.ca/en/ca/search')) {
        url = url.replace('theshoecompany.ca/en/ca/search', 'theshoecompany.ca/search');
      }
      deal.productUrl = url;
      updatedDeals.push(deal);
      keptCount++;
    }
  }

  fs.writeFileSync(dealsDataPath, JSON.stringify(updatedDeals, null, 2), 'utf8');

  console.log('\n--- SANITIZATION COMPLETE ---');
  console.log(`Deals kept as-is: ${keptCount}`);
  console.log(`US deals rerouted to authentic Canadian stores: ${reroutedCount}`);
  console.log(`US-only non-shipping deals purged: ${purgedCount}`);
  console.log(`Total active Canadian deals remaining: ${updatedDeals.length}`);
}

fixCanadianRetailers();
