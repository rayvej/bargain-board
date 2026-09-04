import crypto from 'crypto';
import { classifyDeal } from './category-classifier.js';

/**
 * Generates a deterministic ID from a URL.
 */
function generateId(url) {
  return crypto.createHash('sha256').update(url).digest('hex');
}

/**
 * Normalizes a deal into the standard Bargain Board schema.
 */
export function normalizeDeal(raw, source) {
  const { category, subcategory, tags, keywords } = classifyDeal(raw.title, raw.description || '');
  
  let originalPrice = raw.originalPrice ? parseFloat(raw.originalPrice) : 0;
  let salePrice = raw.salePrice ? parseFloat(raw.salePrice) : 0;
  let savingsPercent = raw.savingsPercent || 0;

  if (originalPrice > 0 && salePrice > 0 && !savingsPercent) {
    savingsPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const urlObj = new URL(raw.url || 'https://unknown.com');
  const retailerDomain = urlObj.hostname.replace('www.', '');
  const retailer = raw.retailer || retailerDomain.split('.')[0].toUpperCase();

  return {
    id: generateId(raw.url),
    title: raw.title || 'Unknown Deal',
    description: raw.description || '',
    originalPrice,
    salePrice,
    savingsPercent,
    currency: raw.currency || 'USD',
    retailer,
    retailerDomain,
    productUrl: raw.url,
    imageUrl: raw.imageUrl || '',
    category,
    subcategory,
    tags,
    keywords,
    couponCodes: raw.couponCodes || [],
    source,
    sourceUrl: raw.sourceUrl || raw.url,
    verificationStatus: raw.couponCodes && raw.couponCodes.length > 0 ? 'unverified' : 'verified',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
}
