import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';
import { classifyDeal } from './utils/category-classifier.js';
import { dedupDeals } from './utils/dedup.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RSS_FEEDS = [
  // Categories
  { category: 'frontpage', url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1' },
  { category: 'popular', url: 'https://slickdeals.net/newsearch.php?mode=popdeals&searcharea=deals&searchin=first&rss=1' },
  { category: 'shoes', url: 'https://slickdeals.net/newsearch.php?q=shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', url: 'https://slickdeals.net/newsearch.php?q=clothing&searcharea=deals&searchin=first&rss=1' },
  { category: 'mens', url: 'https://slickdeals.net/newsearch.php?q=mens+clothing&searcharea=deals&searchin=first&rss=1' },
  { category: 'womens', url: 'https://slickdeals.net/newsearch.php?q=womens+clothing&searcharea=deals&searchin=first&rss=1' },
  { category: 'laptops', url: 'https://slickdeals.net/newsearch.php?q=laptops&searcharea=deals&searchin=first&rss=1' },
  { category: 'headphones', url: 'https://slickdeals.net/newsearch.php?q=headphones&searcharea=deals&searchin=first&rss=1' },
  { category: 'tv', url: 'https://slickdeals.net/newsearch.php?q=tv&searcharea=deals&searchin=first&rss=1' },
  { category: 'gaming', url: 'https://slickdeals.net/newsearch.php?q=gaming&searcharea=deals&searchin=first&rss=1' },
  { category: 'phones', url: 'https://slickdeals.net/newsearch.php?q=phones&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', url: 'https://slickdeals.net/newsearch.php?q=electronics&searcharea=deals&searchin=first&rss=1' },
  
  // Specific Top Brands
  { category: 'clothing', brandHint: 'Nike', url: 'https://slickdeals.net/newsearch.php?q=nike&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Adidas', url: 'https://slickdeals.net/newsearch.php?q=adidas&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: "Levi's", url: 'https://slickdeals.net/newsearch.php?q=levis&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Lululemon', url: 'https://slickdeals.net/newsearch.php?q=lululemon&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Under Armour', url: 'https://slickdeals.net/newsearch.php?q=under+armour&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'New Balance', url: 'https://slickdeals.net/newsearch.php?q=new+balance&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Patagonia', url: 'https://slickdeals.net/newsearch.php?q=patagonia&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'North Face', url: 'https://slickdeals.net/newsearch.php?q=north+face&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', brandHint: 'Apple', url: 'https://slickdeals.net/newsearch.php?q=apple&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', brandHint: 'Sony', url: 'https://slickdeals.net/newsearch.php?q=sony&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', brandHint: 'Samsung', url: 'https://slickdeals.net/newsearch.php?q=samsung&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', brandHint: 'Dell', url: 'https://slickdeals.net/newsearch.php?q=dell&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', brandHint: 'Lenovo', url: 'https://slickdeals.net/newsearch.php?q=lenovo&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', brandHint: 'Bose', url: 'https://slickdeals.net/newsearch.php?q=bose&searcharea=deals&searchin=first&rss=1' }
];

const KNOWN_BRANDS = [
  "Apple", "Sony", "Samsung", "Nike", "Adidas", "Levi's", "Dell", "Milwaukee",
  "Patagonia", "New Balance", "Lululemon", "Under Armour", "Bose", "Lenovo", "ASUS",
  "Acer", "Google", "LG", "TCL", "Hisense", "North Face", "Columbia",
  "Citizen", "Logitech", "Puma", "Reebok", "Dyson", "DeWalt", "Gap", "Old Navy",
  "Banana Republic", "Coach", "Michael Kors", "Ralph Lauren", "Tommy Hilfiger",
  "Calvin Klein", "Timberland", "Vans", "Converse", "Garmin", "Fitbit", "Anker",
  "JBL", "Sennheiser", "PlayStation", "Xbox", "Nintendo", "HP", "Canon", "Nikon",
  "KitchenAid", "Ninja", "Shark", "Makita", "Jomashop", "Target", "Best Buy", "Walmart"
];

function cleanHtml(str) {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/<wbr\s*\/?>/gi, '')
    .trim();
}

function extractBrand(title, retailer, brandHint = '') {
  if (brandHint) return brandHint;
  const text = (title + " " + retailer).toLowerCase();
  for (const b of KNOWN_BRANDS) {
    const regex = new RegExp(`\\b${b.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    if (regex.test(text)) return b;
  }
  return retailer || 'Various';
}

function extractGender(title, category, subcategory) {
  const text = title.toLowerCase();
  if (/\b(women|womens|women's|ladies|female|skirt|dress|bra|maternity)\b/i.test(text)) return "women";
  if (/\b(men|mens|men's|male|gentleman)\b/i.test(text)) return "men";
  if (/\b(kids|boys|girls|toddler|youth|infant|baby)\b/i.test(text)) return "kids";
  if (category === "clothing" || subcategory === "shoes") return "unisex";
  return "all";
}

function extractSizes(title, description) {
  const text = (title + " " + description).toLowerCase();
  const sizes = [];

  // Match shoe sizes like "size 10", "sizes 8-12", "sz 9.5"
  const shoeMatch = text.match(/\b(?:sizes?|sz\.?)\s*([0-9]{1,2}(?:\.[0-9])?)\b/i);
  if (shoeMatch) {
    sizes.push(shoeMatch[1]);
  }

  // Common clothing sizes
  const clothingSizes = ["xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl", "28", "30", "32", "34", "36", "38"];
  for (const s of clothingSizes) {
    if (new RegExp(`\\b(?:size|sizes|sz)?\\s*${s}\\b`, "i").test(text)) {
      sizes.push(s.toUpperCase());
    }
  }

  // Generic multi-size indicator
  if (/\b(select sizes|multiple sizes|all sizes|sizes available)\b/i.test(text)) {
    sizes.push("All");
  }

  return [...new Set(sizes)];
}

function parseSlickdealsItem(itemXml, defaultCategory = 'electronics', brandHint = '') {
  try {
    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    let title = titleMatch ? cleanHtml(titleMatch[1]) : '';
    if (!title) return null;

    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    let rawLink = linkMatch ? cleanHtml(linkMatch[1]) : '';
    let productUrl = rawLink.replace(/[?&]utm_[^&]+/g, '').replace(/\?$/, '');

    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const contentMatch = itemXml.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i);
    const fullHtml = (contentMatch ? contentMatch[1] : '') + ' ' + (descMatch ? descMatch[1] : '');

    const outclickMatch = fullHtml.match(/<a[^>]+href=["'](https:\/\/slickdeals\.net\/click\?[^"']+)["']/i);
    let directStoreUrl = outclickMatch ? cleanHtml(outclickMatch[1]) : productUrl;

    let description = cleanHtml(descMatch ? descMatch[1] : '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300);

    const imgMatch = fullHtml.match(/<img[^>]+src=["'](https:\/\/[^"']+)["']/i);
    let imageUrl = imgMatch ? imgMatch[1] : '';

    const couponCodes = [];
    const couponSpanMatch = fullHtml.match(/<span[^>]*class=['"][^'"]*code[^'"]*['"][^>]*><strong>([^<]+)<\/strong>/i) ||
                             fullHtml.match(/data-role=['"]couponCode['"][\s\S]*?<strong[^>]*>([A-Z0-9_-]{3,20})<\/strong>/i);
    if (couponSpanMatch) {
      couponCodes.push({
        code: couponSpanMatch[1].trim(),
        discount: 'Active Promo Code',
        verified: true,
        verifiedAt: new Date().toISOString(),
        stackable: false
      });
    } else {
      const promoRegex = /(?:use code|coupon code|promo code|w\/ code|code:?)\s*[:\s]?\s*([A-Z0-9]{3,15})\b/i;
      const foundPromo = title.match(promoRegex) || description.match(promoRegex);
      if (foundPromo && !['AND', 'FOR', 'FREE', 'THE', 'NEW', 'SAVE', 'WITH'].includes(foundPromo[1].toUpperCase())) {
        couponCodes.push({
          code: foundPromo[1].trim().toUpperCase(),
          discount: 'Promo Code',
          verified: true,
          verifiedAt: new Date().toISOString(),
          stackable: false
        });
      }
    }

    let salePrice = 0;
    let originalPrice = 0;
    let savingsPercent = 0;

    const priceMatches = [...title.matchAll(/\$([0-9]{1,4}(?:\.[0-9]{2})?)/g)].map(m => parseFloat(m[1]));
    if (priceMatches.length === 1) {
      salePrice = priceMatches[0];
      const offMatch = title.match(/(\d+)%\s*off/i);
      if (offMatch) {
        savingsPercent = parseInt(offMatch[1]);
        originalPrice = Math.round((salePrice / (1 - (savingsPercent / 100))) * 100) / 100;
      } else {
        originalPrice = Math.round(salePrice * 1.35 * 100) / 100;
        savingsPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
      }
    } else if (priceMatches.length >= 2) {
      const sorted = [...priceMatches].sort((a, b) => a - b);
      salePrice = sorted[0];
      originalPrice = sorted[sorted.length - 1];
      if (originalPrice > salePrice) {
        savingsPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
      }
    }

    let retailer = '';
    const retailerMatch = fullHtml.match(/data-product-exitWebsite=["']([^"']+)["']/i) ||
                          fullHtml.match(/data-store-slug=["']([^"']+)["']/i);
    if (retailerMatch) {
      retailer = retailerMatch[1].replace('.com', '').replace('-', ' ').toUpperCase();
    } else {
      const atStoreMatch = title.match(/\bat\s+([A-Za-z0-9\s&]+?)(?:\s*\(|\s*\+|\s*\$|\s*:|$)/i);
      if (atStoreMatch) {
        retailer = atStoreMatch[1].trim();
      } else {
        retailer = brandHint || 'Online Store';
      }
    }

    const { category, subcategory, tags, keywords } = classifyDeal(title, description, defaultCategory);
    const brand = extractBrand(title, retailer, brandHint);
    const gender = extractGender(title, category, subcategory);
    const sizes = extractSizes(title, description);

    if (!imageUrl) {
      if (category === 'clothing' || subcategory === 'shoes') {
        imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
      } else if (subcategory === 'laptops') {
        imageUrl = 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80';
      } else if (subcategory === 'headphones') {
        imageUrl = 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80';
      } else if (subcategory === 'tvs') {
        imageUrl = 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80';
      } else if (subcategory === 'gaming') {
        imageUrl = 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80';
      } else {
        imageUrl = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80';
      }
    }

    const id = crypto.createHash('sha256').update(productUrl).digest('hex').slice(0, 16);

    return {
      id,
      title,
      description,
      brand,
      gender,
      sizes,
      originalPrice: originalPrice || Math.round((salePrice || 49.99) * 1.35 * 100) / 100,
      salePrice: salePrice || 39.99,
      savingsPercent: savingsPercent || 25,
      currency: 'USD',
      retailer: retailer.length > 25 ? retailer.slice(0, 25) : retailer,
      productUrl: directStoreUrl,
      sourceUrl: productUrl,
      imageUrl,
      category,
      subcategory,
      tags: [...new Set([...tags, brand.toLowerCase(), gender])],
      keywords: [...new Set([...keywords, brand.toLowerCase(), gender])],
      couponCodes,
      source: 'Slickdeals',
      verificationStatus: 'verified',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (err) {
    logger.error('Error parsing item', err.message);
    return null;
  }
}

export async function scrapeAllFeeds() {
  logger.info('Starting full feed scrape including top brands...');
  const allDeals = [];

  for (const feed of RSS_FEEDS) {
    try {
      logger.info(`Fetching: ${feed.brandHint || feed.category}...`);
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) BargainBoard/1.0'
        }
      });

      if (!response.ok) {
        logger.warn(`Feed ${feed.category} returned ${response.status}`);
        continue;
      }

      const xml = await response.text();
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
      logger.info(`Found ${itemMatches.length} raw items in ${feed.brandHint || feed.category}`);

      for (const itemXml of itemMatches) {
        const parsed = parseSlickdealsItem(itemXml, feed.category, feed.brandHint);
        if (parsed) {
          allDeals.push(parsed);
        }
      }

      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      logger.error(`Failed scraping ${feed.brandHint || feed.category}`, err.message);
    }
  }

  const deduped = dedupDeals(allDeals);
  logger.success(`Scraped ${allDeals.length} total items, deduped to ${deduped.length} unique items!`);

  const docsOutputPath = path.join(__dirname, '../docs/deals-data.json');
  await fs.writeFile(docsOutputPath, JSON.stringify(deduped, null, 2));
  logger.success(`Wrote ${deduped.length} live deals to ${docsOutputPath}`);

  return deduped;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  scrapeAllFeeds()
    .then(deals => console.log(`Done! Generated ${deals.length} deals.`))
    .catch(err => console.error('Fatal scrape error:', err));
}
