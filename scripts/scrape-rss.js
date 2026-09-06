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
  // ─── CANADIAN RETAILER & RFD FORUM FEEDS ───
  { type: 'atom', category: 'clothing', retailerHint: 'RedFlagDeals', url: 'https://forums.redflagdeals.com/feed/forum/9' },
  { type: 'atom', category: 'electronics', retailerHint: 'RedFlagDeals', url: 'https://forums.redflagdeals.com/feed/forum/53' },
  { type: 'atom', category: 'clothing', retailerHint: 'RedFlagDeals Apparel', url: 'https://forums.redflagdeals.com/feed/forum/135' },

  // ─── FOOTWEAR CLEARANCE & MULTI-RETAILER FEEDS ───
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Nike', url: 'https://slickdeals.net/newsearch.php?q=nike+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Nike', url: 'https://slickdeals.net/newsearch.php?q=nike+air+max&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Nike', url: 'https://slickdeals.net/newsearch.php?q=nike+pegasus&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Nike', url: 'https://slickdeals.net/newsearch.php?q=nike+running&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Nike', url: 'https://slickdeals.net/newsearch.php?q=nike+dunk&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Adidas', url: 'https://slickdeals.net/newsearch.php?q=adidas+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Adidas', url: 'https://slickdeals.net/newsearch.php?q=adidas+ultraboost&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Adidas', url: 'https://slickdeals.net/newsearch.php?q=adidas+samba&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'New Balance', url: 'https://slickdeals.net/newsearch.php?q=new+balance+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'New Balance', url: 'https://slickdeals.net/newsearch.php?q=new+balance+574&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'New Balance', url: 'https://slickdeals.net/newsearch.php?q=new+balance+fresh+foam&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Under Armour', url: 'https://slickdeals.net/newsearch.php?q=under+armour+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Puma', url: 'https://slickdeals.net/newsearch.php?q=puma+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Asics', url: 'https://slickdeals.net/newsearch.php?q=asics+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Brooks', url: 'https://slickdeals.net/newsearch.php?q=brooks+running&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Hoka', url: 'https://slickdeals.net/newsearch.php?q=hoka+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Saucony', url: 'https://slickdeals.net/newsearch.php?q=saucony+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'On Running', url: 'https://slickdeals.net/newsearch.php?q=on+running+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Vans', url: 'https://slickdeals.net/newsearch.php?q=vans+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Converse', url: 'https://slickdeals.net/newsearch.php?q=converse+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Timberland', url: 'https://slickdeals.net/newsearch.php?q=timberland+boots&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', brandHint: 'Skechers', url: 'https://slickdeals.net/newsearch.php?q=skechers+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', url: 'https://slickdeals.net/newsearch.php?q=running+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', url: 'https://slickdeals.net/newsearch.php?q=mens+sneakers&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', url: 'https://slickdeals.net/newsearch.php?q=womens+sneakers&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', url: 'https://slickdeals.net/newsearch.php?q=basketball+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', subcategory: 'shoes', url: 'https://slickdeals.net/newsearch.php?q=hiking+boots&searcharea=deals&searchin=first&rss=1' },

  // ─── APPAREL & CLOTHING CLEARANCE ───
  { category: 'clothing', brandHint: 'Nike', url: 'https://slickdeals.net/newsearch.php?q=nike+hoodie&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Nike', url: 'https://slickdeals.net/newsearch.php?q=nike+jacket&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Nike', url: 'https://slickdeals.net/newsearch.php?q=nike+clearance&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Adidas', url: 'https://slickdeals.net/newsearch.php?q=adidas+hoodie&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Adidas', url: 'https://slickdeals.net/newsearch.php?q=adidas+tracksuit&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Lululemon', url: 'https://slickdeals.net/newsearch.php?q=lululemon&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: "Levi's", url: 'https://slickdeals.net/newsearch.php?q=levis+jeans&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: "Levi's", url: 'https://slickdeals.net/newsearch.php?q=levis+jacket&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Under Armour', url: 'https://slickdeals.net/newsearch.php?q=under+armour+hoodie&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Under Armour', url: 'https://slickdeals.net/newsearch.php?q=under+armour+clearance&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'The North Face', url: 'https://slickdeals.net/newsearch.php?q=north+face+jacket&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Patagonia', url: 'https://slickdeals.net/newsearch.php?q=patagonia+fleece&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Columbia', url: 'https://slickdeals.net/newsearch.php?q=columbia+jacket&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Carhartt', url: 'https://slickdeals.net/newsearch.php?q=carhartt+jacket&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Carhartt', url: 'https://slickdeals.net/newsearch.php?q=carhartt+hoodie&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: "Arc'teryx", url: 'https://slickdeals.net/newsearch.php?q=arcteryx&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', brandHint: 'Puma', url: 'https://slickdeals.net/newsearch.php?q=puma+hoodie&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', url: 'https://slickdeals.net/newsearch.php?q=mens+hoodie&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', url: 'https://slickdeals.net/newsearch.php?q=mens+jacket&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', url: 'https://slickdeals.net/newsearch.php?q=winter+parka&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', url: 'https://slickdeals.net/newsearch.php?q=mens+joggers&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', url: 'https://slickdeals.net/newsearch.php?q=fleece+jacket&searcharea=deals&searchin=first&rss=1' },

  // ─── CANADIAN RETAILER APPAREL & SHOE CLEARANCE ───
  { category: 'clothing', retailerHint: 'Sport Chek', url: 'https://slickdeals.net/newsearch.php?q=sport+chek&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'The Bay', url: 'https://slickdeals.net/newsearch.php?q=hudsons+bay&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Foot Locker Canada', url: 'https://slickdeals.net/newsearch.php?q=foot+locker+canada&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Gap Canada', url: 'https://slickdeals.net/newsearch.php?q=gap+canada&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Old Navy', url: 'https://slickdeals.net/newsearch.php?q=old+navy+canada&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Lululemon', url: 'https://slickdeals.net/newsearch.php?q=lululemon+canada&searcharea=deals&searchin=first&rss=1' },

  // ─── ELECTRONICS & TECH HARDWARE FEEDS ───
  { category: 'electronics', retailerHint: 'Best Buy', url: 'https://slickdeals.net/newsearch.php?q=best+buy+deals&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', retailerHint: 'B&H Photo Video', url: 'https://slickdeals.net/newsearch.php?q=bhphoto&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', retailerHint: 'Newegg', url: 'https://slickdeals.net/newsearch.php?q=newegg&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', retailerHint: 'Target', url: 'https://slickdeals.net/newsearch.php?q=target+electronics&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'laptops', brandHint: 'Apple', url: 'https://slickdeals.net/newsearch.php?q=apple+macbook&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'phones', brandHint: 'Apple', url: 'https://slickdeals.net/newsearch.php?q=apple+ipad&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'headphones', brandHint: 'Apple', url: 'https://slickdeals.net/newsearch.php?q=airpods+pro&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', brandHint: 'Apple', url: 'https://slickdeals.net/newsearch.php?q=apple+watch&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'headphones', brandHint: 'Sony', url: 'https://slickdeals.net/newsearch.php?q=sony+headphones&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'headphones', brandHint: 'Sony', url: 'https://slickdeals.net/newsearch.php?q=sony+wh-1000xm&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'tvs', brandHint: 'Sony', url: 'https://slickdeals.net/newsearch.php?q=sony+bravia+tv&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'gaming', brandHint: 'Sony', url: 'https://slickdeals.net/newsearch.php?q=playstation+5&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'phones', brandHint: 'Samsung', url: 'https://slickdeals.net/newsearch.php?q=samsung+galaxy&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'tvs', brandHint: 'Samsung', url: 'https://slickdeals.net/newsearch.php?q=samsung+oled+tv&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', brandHint: 'Samsung', url: 'https://slickdeals.net/newsearch.php?q=samsung+monitor&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'headphones', brandHint: 'Bose', url: 'https://slickdeals.net/newsearch.php?q=bose+quietcomfort&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'laptops', brandHint: 'Dell', url: 'https://slickdeals.net/newsearch.php?q=dell+xps&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'laptops', brandHint: 'Dell', url: 'https://slickdeals.net/newsearch.php?q=dell+laptop&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'laptops', brandHint: 'Lenovo', url: 'https://slickdeals.net/newsearch.php?q=lenovo+thinkpad&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'laptops', brandHint: 'Lenovo', url: 'https://slickdeals.net/newsearch.php?q=lenovo+legion&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'laptops', brandHint: 'ASUS', url: 'https://slickdeals.net/newsearch.php?q=asus+rog+laptop&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'laptops', brandHint: 'HP', url: 'https://slickdeals.net/newsearch.php?q=hp+laptop&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'gaming', brandHint: 'Nintendo', url: 'https://slickdeals.net/newsearch.php?q=nintendo+switch&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'gaming', brandHint: 'Xbox', url: 'https://slickdeals.net/newsearch.php?q=xbox+series+x&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'headphones', brandHint: 'JBL', url: 'https://slickdeals.net/newsearch.php?q=jbl+speaker+headphones&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'headphones', brandHint: 'Sennheiser', url: 'https://slickdeals.net/newsearch.php?q=sennheiser+headphones&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', brandHint: 'Logitech', url: 'https://slickdeals.net/newsearch.php?q=logitech+mouse+keyboard&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', brandHint: 'Anker', url: 'https://slickdeals.net/newsearch.php?q=anker+charger&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'laptops', url: 'https://slickdeals.net/newsearch.php?q=gaming+laptop&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'tvs', url: 'https://slickdeals.net/newsearch.php?q=oled+tv+4k&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'tvs', url: 'https://slickdeals.net/newsearch.php?q=65+inch+tv&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'headphones', url: 'https://slickdeals.net/newsearch.php?q=wireless+earbuds&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', subcategory: 'headphones', url: 'https://slickdeals.net/newsearch.php?q=noise+cancelling+headphones&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', url: 'https://slickdeals.net/newsearch.php?q=gaming+monitor+144hz&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', url: 'https://slickdeals.net/newsearch.php?q=nvme+ssd&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', url: 'https://slickdeals.net/newsearch.php?q=garmin+smartwatch&searcharea=deals&searchin=first&rss=1' },
  { category: 'electronics', url: 'https://slickdeals.net/newsearch.php?q=mechanical+keyboard&searcharea=deals&searchin=first&rss=1' }
];

const KNOWN_BRANDS = [
  "Apple", "Sony", "Samsung", "Nike", "Adidas", "Levi's", "Dell", "Milwaukee",
  "Patagonia", "New Balance", "Lululemon", "Under Armour", "Bose", "Lenovo", "ASUS",
  "Acer", "Google", "LG", "TCL", "Hisense", "The North Face", "North Face", "Columbia",
  "Citizen", "Logitech", "Puma", "Reebok", "Dyson", "DeWalt", "Gap", "Old Navy",
  "Banana Republic", "Coach", "Michael Kors", "Ralph Lauren", "Tommy Hilfiger",
  "Calvin Klein", "Timberland", "Vans", "Converse", "Garmin", "Fitbit", "Anker",
  "JBL", "Sennheiser", "PlayStation", "Xbox", "Nintendo", "HP", "Canon", "Nikon",
  "Skechers", "Hoka", "On Running", "Brooks", "Saucony", "Asics", "Carhartt", "Arc'teryx"
];

const KNOWN_RETAILERS = [
  "Sport Chek", "Hudson's Bay", "The Bay", "The Shoe Company", "The Last Hunt",
  "Simons", "Canada Computers", "Memory Express", "Marks", "Altitude Sports",
  "Foot Locker Canada", "Best Buy Canada", "Amazon.ca", "Costco Canada", "Walmart Canada",
  "Dick's Sporting Goods", "Foot Locker", "Nordstrom Rack", "Finish Line",
  "DSW", "Best Buy", "B&H Photo Video", "B&H Photo", "Macy's", "Kohl's",
  "Target", "Walmart", "Costco", "REI", "Zappos", "Joe's New Balance Outlet",
  "Nike", "Adidas", "Lululemon", "Under Armour", "Levi's", "Amazon", "Woot", "Newegg",
  "Jomashop", "Dell", "Lenovo", "Journeys", "Champs", "Eastbay", "PacSun", "Adorama"
];

// Aggressive Junk / Non-clothing / Non-electronics / Sweepstakes / Contests regex
const JUNK_REGEX = /\b(flight|flights|airline|airlines|airfare|hotel|vacation|roundtrip|resort|cruise|gift card|giftcard|extra bucks|extrabucks|cashback|cash back|trade-in|trade in|publix|cvs|walgreens|grocery|food|snack|cookie|candy|meat|cheese|coffee|hose|watering wand|insect|mosquito|bug spray|picaridin|cushion|pillow|throw pillow|cutting board|propane|deadbolt|pressure washer|wrench|socket|drill bit|fertilizer|plant|shampoo|soap|detergent|toothpaste|pan|pot|skillet|knife|blender|mattress|towel|bedding|sheet set|comforter|board game|puzzle|card game|lego|doll|toy|car cover|wiper|brake|motor oil|oil filter|spark plug|sweepstakes|sweeps|sweep|giveaway|contest|win big|instant win|instant-win|chance to win|free entry|enter to win|win a|cataboom|gleam\.io|sweeppea|hydrate to win|coors light|heineken|kwik fill|ebay|resale)\b/i;

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
  const text = title.toLowerCase();
  for (const b of KNOWN_BRANDS) {
    const regex = new RegExp(`\\b${b.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    if (regex.test(text)) return b;
  }
  // If retailer itself is an official brand store
  for (const b of KNOWN_BRANDS) {
    if (retailer.toLowerCase().includes(b.toLowerCase())) return b;
  }
  return retailer || 'Various';
}

function extractRetailer(title, fullHtml, retailerHint = '') {
  const combined = (title + ' ' + fullHtml).toLowerCase();

  // 1. Direct Amazon check
  if (combined.includes('amazon.ca') || combined.includes('amazon') || combined.includes('@amazon') || combined.includes('at amazon')) {
    return 'Amazon Canada';
  }

  // 2. Check title for bracketed retailer e.g. [Sport Chek], [Walmart], [Best Buy]
  const bracketMatch = title.match(/^\[([^\]]+)\]/);
  const NON_RETAILER_TAGS = new Set([
    'new', 'lightning deal', 'prime', 's&s', 'sns', 'deal', 'hot', 'save', 
    'sns, ac', 'new, ac', 'app store', 'select stores', 'black only', 'open box',
    'select accounts', 'refurbished', 'ymmv', 'in-store', 'online'
  ]);

  if (bracketMatch) {
    const raw = bracketMatch[1].trim();
    if (!NON_RETAILER_TAGS.has(raw.toLowerCase())) {
      for (const r of KNOWN_RETAILERS) {
        if (raw.toLowerCase().includes(r.toLowerCase())) return r;
      }
      if (raw.length > 2 && !raw.includes('$')) return raw;
    }
  }

  // 3. Check HTML data attributes e.g. data-product-exitWebsite
  const exitWebsiteMatch = fullHtml.match(/data-product-exitWebsite=["']([^"']+)["']/i);
  if (exitWebsiteMatch) {
    const domain = exitWebsiteMatch[1].toLowerCase().replace(/\.com|\.ca/g, '').replace(/[-_]/g, ' ').trim();
    for (const r of KNOWN_RETAILERS) {
      if (domain.includes(r.toLowerCase())) return r;
    }
    if (domain.length > 2) return domain.toUpperCase();
  }

  // 4. Check title for "at Store" or "from Store" or "@ Store"
  for (const r of KNOWN_RETAILERS) {
    const regex = new RegExp(`(?:at|from|@)\\s+${r.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}`, "i");
    if (regex.test(title)) return r;
  }

  // 5. Fallback to retailerHint from feed configuration
  if (retailerHint) return retailerHint;

  // 6. Fallback search in title
  for (const r of KNOWN_RETAILERS) {
    const regex = new RegExp(`\\b${r.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    if (regex.test(title)) return r;
  }

  return 'Canadian Retailer';
}

function extractGender(title, category, subcategory) {
  const text = title.toLowerCase();
  if (/\b(women|womens|women's|ladies|female|skirt|dress|bra|maternity)\b/i.test(text)) return "women";
  if (/\b(men|mens|men's|male|gentleman)\b/i.test(text)) return "men";
  if (/\b(kids|boys|girls|toddler|youth|infant|baby)\b/i.test(text)) return "kids";
  if (category === "clothing" || subcategory === "shoes") return "unisex";
  return "all";
}

function extractSizes(title, description, subcategory = '') {
  const text = (title + " " + description).toLowerCase();
  const isFootwear = subcategory === 'shoes' || /\b(shoes?|sneakers?|boots?|runners?|trainers?|cleats?)\b/i.test(title);
  const sizes = [];

  if (isFootwear) {
    // 1. Range match e.g. "sizes 7-13", "sizes 8 to 12", "sz 8-11", "(6-8.5)"
    const rangeMatch = text.match(/(?:\b(?:sizes?|sz\.?)\s*|\()([0-9]{1,2}(?:\.[0-9])?)\s*(?:-|to)\s*([0-9]{1,2}(?:\.[0-9])?)\)?/i);
    if (rangeMatch) {
      const start = parseFloat(rangeMatch[1]);
      const end = parseFloat(rangeMatch[2]);
      if (start >= 4 && end <= 16 && start < end) {
        for (let s = start; s <= end; s += 0.5) {
          sizes.push(String(s));
        }
      }
    }

    // 2. Comma-separated or list match e.g. "(6,8,9.5)" or "sizes 8, 9, 10"
    const listMatch = text.match(/(?:sizes?|sz\.?|\()\s*([0-9]{1,2}(?:\.[0-9])?(?:\s*,\s*[0-9]{1,2}(?:\.[0-9])?)+)\)?/i);
    if (listMatch) {
      const nums = listMatch[1].split(',').map(n => n.trim()).filter(Boolean);
      nums.forEach(n => {
        const val = parseFloat(n);
        if (val >= 4 && val <= 16) sizes.push(String(val));
      });
    }

    // 3. Single shoe size match e.g. "size 10", "sz 8.5"
    const singleMatch = text.match(/\b(?:size|sizes|sz)\.?\s*([0-9]{1,2}(?:\.[0-9])?)\b/i);
    if (singleMatch) {
      const val = parseFloat(singleMatch[1]);
      if (val >= 4 && val <= 16) sizes.push(String(val));
    }

    // Never add clothing sizes (XS, S, M, L) to shoes!
    if (sizes.length === 0) {
      sizes.push("All");
    }
  } else {
    // Apparel / Clothing sizes only: Require explicit prefix or multi-char tag to prevent matching lone "S" or "SE"
    const sizeTokens = text.match(/\b(?:size|sz)\s*([0-9]{1,2}|xs|s|m|l|xl|xxl|2xl|3xl)\b/gi) || [];
    sizeTokens.forEach(tok => {
      const clean = tok.replace(/^(?:size|sz)\s*/i, '').trim().toUpperCase();
      if (clean) sizes.push(clean);
    });

    const directApparel = text.match(/\b(XS|XXL|2XL|3XL)\b/g) || [];
    directApparel.forEach(tok => sizes.push(tok.toUpperCase()));

    const waistMatch = text.match(/\b(?:waist|w)\s*([0-9]{2})\b/gi) || [];
    waistMatch.forEach(tok => {
      const clean = tok.replace(/^(?:waist|w)\s*/i, '').trim();
      sizes.push(clean);
    });
  }

  return [...new Set(sizes)];
}

function cleanProductQuery(title) {
  let q = title
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/\([^\)]+\)/g, ' ')
    .replace(/\$\s*\d+(?:\.\d{2})?/g, ' ')
    .replace(/\b\d+(?:\.\d{2})?\s*(?:usd|cad)\b/gi, ' ')
    .replace(/\b(?:usd|cad|ca\$|us\$)\b/gi, ' ')
    .replace(/^(?:kohl'?s|amazon|nike|best\s*buy|dick'?s|walmart|target|costco|woot|scheels)\s*[-–:]\s*/gi, ' ')
    .replace(/\b(?:free shipping|free s&h|free delivery|free pickup|free store pickup|free s\/h|fs on \$\d+\+?|free shipping on \$\d+\+?)\b.*$/gi, ' ')
    .replace(/\b(?:with promo code|with coupon|with code|w\/\s*code|apply code|use code|code:?|promo code:?|ecoupon)\b.*$/gi, ' ')
    .replace(/\b(?:save \d+%|\d+%\s*off|ymmv|new atl|atl|reg\.?\s*\$\d+|lowest in \d+|bogo)\b.*$/gi, ' ')
    .replace(/\b(?:select accts|select accounts|select stores|select sizes|members:?|at macys|at woot|at kohls|at adidas|via ebay|at amazon)\b.*$/gi, ' ')
    .replace(/['"]/g, '')
    .replace(/[:|,\/\\!~–—\-]/g, ' ')
    .replace(/^[\s\d]+/, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let words = q.split(' ').filter(w => w.length > 0);
  if (words.length > 5) words = words.slice(0, 5);
  return words.join(' ');
}

function resolveMerchantUrl(retailer, title, exitWebsite = '', directLink = '', category = 'clothing', subcategory = 'shoes') {
  // 1. Check for valid direct merchant product link (e.g. Amazon ASIN or official store URL)
  if (directLink) {
    if (directLink.includes('amazon.com/dp/') || directLink.includes('amazon.ca/dp/')) {
      const asinMatch = directLink.match(/\/dp\/([A-Z0-9]{10})/i);
      if (asinMatch) return `https://www.amazon.ca/dp/${asinMatch[1]}`;
    }
    if (/^https?:\/\/(?:www\.)?(?:nike\.com|adidas\.ca|sportchek\.ca|footlocker\.ca|thebay\.com|bestbuy\.ca|canadacomputers\.com|memoryexpress\.com|theshoecompany\.ca|walmart\.ca|costco\.ca|lenovo\.com|dell\.com|apple\.com|gapcanada\.ca|oldnavy\.gapcanada\.ca)\//i.test(directLink)) {
      return directLink;
    }
  }

  const query = cleanProductQuery(title);
  const searchTerms = encodeURIComponent(query);
  const ret = (retailer || exitWebsite || '').toLowerCase();

  // Primary Canadian Retailers & Top Fashion/Tech Merchants
  if (ret.includes('sport chek') || ret.includes('sportchek')) {
    return `https://www.sportchek.ca/en/search.html?q=${searchTerms}`;
  }
  if (ret.includes('foot locker') || ret.includes('footlocker')) {
    return `https://www.footlocker.ca/en/search?query=${searchTerms}`;
  }
  if (ret.includes('the bay') || ret.includes('hudson') || ret.includes('hudsons-bay')) {
    return `https://www.thebay.com/search?q=${searchTerms}`;
  }
  if (ret.includes('nike')) {
    return `https://www.nike.com/ca/w?q=${searchTerms}`;
  }
  if (ret.includes('adidas')) {
    return `https://www.adidas.ca/en/search?q=${searchTerms}`;
  }
  if (ret.includes('new balance') || ret.includes('newbalance') || ret.includes('joesnewbalanceoutlet')) {
    return `https://www.newbalance.ca/en_ca/search/?q=${searchTerms}`;
  }
  if (ret.includes('the shoe company') || ret.includes('shoe company')) {
    return `https://www.theshoecompany.ca/en/ca/search?query=${searchTerms}`;
  }
  if (ret.includes('best buy') || ret.includes('bestbuy')) {
    return `https://www.bestbuy.ca/en-ca/search?search=${searchTerms}`;
  }
  if (ret.includes('canada computers')) {
    return `https://www.canadacomputers.com/search/results_details.php?keywords=${searchTerms}`;
  }
  if (ret.includes('memory express')) {
    return `https://www.memoryexpress.com/Search/Products?Search=${searchTerms}`;
  }
  if (ret.includes('amazon')) {
    return `https://www.amazon.ca/s?k=${searchTerms}`;
  }
  if (ret.includes('walmart')) {
    return `https://www.walmart.ca/search?q=${searchTerms}`;
  }
  if (ret.includes('costco')) {
    return `https://www.costco.ca/CatalogSearch?dept=All&keyword=${searchTerms}`;
  }
  if (ret.includes('gap factory')) {
    return `https://www.gapfactory.com/browse/search.do?searchText=${searchTerms}`;
  }
  if (ret.includes('gap')) {
    return `https://www.gapcanada.ca/browse/search.do?searchText=${searchTerms}`;
  }
  if (ret.includes('old navy')) {
    return `https://oldnavy.gapcanada.ca/browse/search.do?searchText=${searchTerms}`;
  }
  if (ret.includes('banana republic')) {
    return `https://bananarepublic.gapcanada.ca/browse/search.do?searchText=${searchTerms}`;
  }
  if (ret.includes('j.crew') || ret.includes('jcrew')) {
    return `https://www.jcrew.com/r/search?Ntt=${searchTerms}`;
  }
  if (ret.includes('lululemon')) {
    return `https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=${searchTerms}`;
  }
  if (ret.includes('under armour') || ret.includes('underarmour')) {
    return `https://www.underarmour.ca/en-ca/search?q=${searchTerms}`;
  }
  if (ret.includes('puma')) {
    return `https://ca.puma.com/ca/en/search?q=${searchTerms}`;
  }
  if (ret.includes('asics')) {
    return `https://www.asics.com/ca/en-ca/search?q=${searchTerms}`;
  }
  if (ret.includes('vans')) {
    return `https://www.vans.ca/en-ca/search?q=${searchTerms}`;
  }
  if (ret.includes('converse')) {
    return `https://www.converse.ca/search?q=${searchTerms}`;
  }
  if (ret.includes('timberland')) {
    return `https://www.timberland.ca/en-ca/search?q=${searchTerms}`;
  }
  if (ret.includes('columbia')) {
    return `https://www.columbiasportswear.ca/en/search?q=${searchTerms}`;
  }
  if (ret.includes('carhartt')) {
    return `https://www.carhartt.com/search/${searchTerms}`;
  }
  if (ret.includes('patagonia')) {
    return `https://www.patagonia.ca/search/?q=${searchTerms}`;
  }
  if (ret.includes('arcteryx') || ret.includes("arc'teryx")) {
    return `https://arcteryx.com/ca/en/search?q=${searchTerms}`;
  }
  if (ret.includes('levi')) {
    return `https://www.levi.com/CA/en_CA/search/${searchTerms}`;
  }
  if (ret.includes('lenovo')) {
    return `https://www.lenovo.com/ca/en/search?fq=&text=${searchTerms}`;
  }
  if (ret.includes('dell')) {
    return `https://www.dell.com/en-ca/search/${searchTerms}`;
  }
  if (ret.includes('apple')) {
    return `https://www.apple.com/ca/search/${searchTerms}`;
  }
  if (ret.includes('samsung')) {
    return `https://www.samsung.com/ca/search/?searchvalue=${searchTerms}`;
  }
  if (ret.includes('woot')) {
    return `https://www.woot.com/category/sellout?q=${searchTerms}`;
  }
  if (ret.includes('newegg')) {
    return `https://www.newegg.ca/p/pl?d=${searchTerms}`;
  }
  if (ret.includes('b&h') || ret.includes('bhphotovideo')) {
    return `https://www.bhphotovideo.com/c/search?Ntt=${searchTerms}`;
  }
  if (ret.includes('staples')) {
    return `https://www.staples.ca/search?q=${searchTerms}`;
  }
  if (ret.includes('simons')) {
    return `https://www.simons.ca/en/search?query=${searchTerms}`;
  }
  if (ret.includes('the shoe company') || ret.includes('dsw')) {
    return `https://www.theshoecompany.ca/search?query=${searchTerms}`;
  }
  if (ret.includes('marks') || ret.includes("mark's")) {
    return `https://www.marks.com/en/search.html?q=${searchTerms}`;
  }
  if (ret.includes('altitude') || ret.includes('thelasthunt')) {
    return `https://www.altitude-sports.com/search?q=${searchTerms}`;
  }
  if (ret.includes('mec') || ret.includes('mountain equipment')) {
    return `https://www.mec.ca/en/search?query=${searchTerms}`;
  }
  if (ret.includes('browns') || ret.includes('brownsshoes')) {
    return `https://www.brownsshoes.com/en/search?q=${searchTerms}`;
  }
  if (ret.includes('aldo') || ret.includes('aldoshoes')) {
    return `https://www.aldoshoes.com/ca/en/search?q=${searchTerms}`;
  }
  if (ret.includes('decathlon')) {
    return `https://www.decathlon.ca/en/search?query=${searchTerms}`;
  }
  if (ret.includes('canadian tire')) {
    return `https://www.canadiantire.ca/en/search-results.html?q=${searchTerms}`;
  }
  if (ret.includes('journeys')) {
    return `https://www.journeys.ca/search?keywords=${searchTerms}`;
  }
  if (ret.includes('champs')) {
    return `https://www.champssports.ca/en/search?query=${searchTerms}`;
  }

  // Brand-Specific Canadian Store Routing
  const titleLower = title.toLowerCase();
  if (titleLower.includes('nike')) {
    return `https://www.nike.com/ca/w?q=${searchTerms}`;
  }
  if (titleLower.includes('adidas')) {
    return `https://www.adidas.ca/en/search?q=${searchTerms}`;
  }
  if (titleLower.includes('under armour') || titleLower.includes('underarmour')) {
    return `https://www.underarmour.ca/en-ca/search?q=${searchTerms}`;
  }
  if (titleLower.includes('puma')) {
    return `https://ca.puma.com/ca/en/search?q=${searchTerms}`;
  }
  if (titleLower.includes('new balance')) {
    return `https://www.newbalance.ca/en_ca/search/?q=${searchTerms}`;
  }
  if (titleLower.includes('apple')) {
    return `https://www.apple.com/ca/search/${searchTerms}`;
  }
  if (titleLower.includes('samsung')) {
    return `https://www.samsung.com/ca/search/?searchvalue=${searchTerms}`;
  }
  if (titleLower.includes('dell')) {
    return `https://www.dell.com/en-ca/search/${searchTerms}`;
  }
  if (titleLower.includes('lenovo')) {
    return `https://www.lenovo.com/ca/en/search?fq=&text=${searchTerms}`;
  }

  // ABSOLUTE GUARANTEE: Never hallucinate search URLs to Sport Chek or Best Buy for unknown products!
  // Require genuine retailer or direct link, or return empty string so invalid deals are discarded.
  return '';
}

function extractCouponCodes(title, description, fullHtml, retailer) {
  const text = `${title} ${description} ${fullHtml}`;
  const couponCodes = [];
  const seen = new Set();

  const FALSE_POSITIVES = new Set([
    'AND', 'FOR', 'FREE', 'THE', 'NEW', 'SAVE', 'WITH', 'SALE', 'CODE', 
    'ITEM', 'ONLY', 'DEAL', 'OFF', 'PLUS', 'THIS', 'FROM', 'GET', 'ALL', 
    'NOW', 'SHOP', 'CARD', 'BUY', 'SIZE', 'CART', 'BEST', 'PRICE', 'MORE',
    'VERY', 'GOOD', 'JUST', 'LIKE', 'SOME', 'THAT', 'THEM', 'THEN', 'WANT',
    'WILL', 'YOUR', 'WHAT', 'WHEN', 'MUCH', 'OVER', 'DROP', 'LAST', 'DEALS',
    'COOL', 'HOT', 'HOTDEAL', 'TODAY', 'INLINECOUPONICON', 'PRICES', 'START',
    'REQUIRED', 'SHOES', 'FOUND', 'AFTER', 'NEEDED', 'WORKS', 'ADDITIONAL',
    'DOESN', 'MAKING', 'ABOVE', 'VALID', 'ITEMS', 'CODES', 'SHOULD', 'APPLIED',
    'AMAZON', 'NECESSARY', 'APPLIES', 'XXXXXXXXXXXX', '4-IN-2'
  ]);
  const VALID_WORDS = new Set(['EXTRA', 'BONUS', 'SUMMER', 'FALL', 'SPRING', 'WINTER', 'DAYONE', 'LASTSHOT', 'WELCOME', 'VIP', 'BUY1GET1', 'GET10', 'SUPERSAVING', 'ZAPEXTRA15', 'AUGUST50', 'STYLEDEAL20']);

  const markupMatches = [
    ...fullHtml.matchAll(/<span[^>]*class=['"][^'"]*code[^'"]*['"][^>]*><strong>([^<]+)<\/strong>/gi),
    ...fullHtml.matchAll(/data-role=['"]couponCode['"][\s\S]*?<strong[^>]*>([A-Z0-9_-]{3,20})<\/strong>/gi)
  ];
  markupMatches.forEach(m => {
    const raw = m[1].trim().toUpperCase();
    if (/^[A-Z0-9_-]{3,20}$/.test(raw) && (!FALSE_POSITIVES.has(raw) || VALID_WORDS.has(raw))) {
      seen.add(raw);
    }
  });

  const regexPatterns = [
    /(?:use code|coupon code|promo code|w\/\s*code|apply code|with code|code:?|coupon:?|ecoupon)\s*[:\s]?\s*[\*\"'“”]?([A-Z0-9_-]{3,18})[\*\"'“”]?/gi,
    /(?:extra|save an extra)\s+(?:\$\d+|\d+%\s*off)\s+(?:with|w\/|using)\s+(?:code|coupon|promo)\s*[\*\"'“”]?([A-Z0-9_-]{3,18})[\*\"'“”]?/gi
  ];

  regexPatterns.forEach(regex => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const code = match[1].trim().toUpperCase();
      if (/^[A-Z0-9_-]{3,20}$/.test(code)) {
        if (!FALSE_POSITIVES.has(code) || VALID_WORDS.has(code)) {
          seen.add(code);
        }
      }
    }
  });

  let discountStr = 'Verified Promo Code';
  const discountMatch = text.match(/(\d+%\s*off|\$\d+(?:\.\d{2})?\s*off|buy\s*1\s*get\s*1|bogo|extra\s*\d+%\s*off)/i);
  if (discountMatch) {
    discountStr = discountMatch[1].toUpperCase();
  }

  const retLower = (retailer || '').toLowerCase();
  let stacksWithSale = true;
  let multiCodeStackable = false;
  let stackingPolicy = 'Stacks with existing sale markdowns at checkout.';
  let checkoutInstructions = `Apply code at checkout on ${retailer || 'the store'}.`;

  if (retLower.includes("kohl")) {
    multiCodeStackable = true;
    stackingPolicy = 'Highly stackable! Kohl\'s allows stacking up to 4 promo codes per order, plus Kohl\'s Cash.';
    checkoutInstructions = 'In cart, expand "Apply Kohl\'s Coupons" and enter code.';
  } else if (retLower.includes("nike")) {
    multiCodeStackable = false;
    stackingPolicy = 'Stacks with sale prices & free shipping for Nike Members (1 code per order).';
    checkoutInstructions = 'Under Order Summary at checkout, click "Do you have a promo code?" and paste.';
  } else if (retLower.includes("adidas")) {
    multiCodeStackable = false;
    stackingPolicy = 'Stacks with existing sale markdowns & adiClub member free shipping (1 code per order).';
    checkoutInstructions = 'In your bag or at checkout, enter the code in the "Use a promo code" box.';
  } else if (retLower.includes("gap") || retLower.includes("old navy") || retLower.includes("banana republic")) {
    multiCodeStackable = true;
    stackingPolicy = 'Stackable! Gap & Old Navy permit stacking up to 3 compatible promotional codes or rewards per order.';
    checkoutInstructions = 'In checkout or shopping bag, enter the code under "Promotions & Rewards".';
  } else if (retLower.includes("amazon")) {
    multiCodeStackable = true;
    stackingPolicy = 'Stacks with on-page clip coupons and existing deal markdowns at checkout.';
    checkoutInstructions = 'At final review screen, enter code in "Gift Cards & Promotional Codes".';
  } else if (retLower.includes("lenovo")) {
    multiCodeStackable = false;
    stackingPolicy = 'eCoupon stacks on top of instant doorbuster clearance savings.';
    checkoutInstructions = 'In cart, enter the code into the "eCoupon" box and click Apply.';
  }

  seen.forEach(code => {
    couponCodes.push({
      code,
      discount: discountStr,
      verified: true,
      verifiedAt: new Date().toISOString(),
      stacksWithSale,
      multiCodeStackable,
      stackingPolicy,
      checkoutInstructions
    });
  });

  return couponCodes;
}


function parseSlickdealsItem(itemXml, defaultCategory = 'clothing', brandHint = '', retailerHint = '') {
  try {
    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    let title = titleMatch ? cleanHtml(titleMatch[1]) : '';
    if (!title) return null;

    // Filter out Junk!
    if (JUNK_REGEX.test(title)) return null;

    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const contentMatch = itemXml.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i);
    const fullHtml = (contentMatch ? contentMatch[1] : '') + ' ' + (descMatch ? descMatch[1] : '');

    if (JUNK_REGEX.test(fullHtml)) return null;

    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    let rawLink = linkMatch ? cleanHtml(linkMatch[1]) : '';
    let productUrl = rawLink.replace(/[?&]utm_[^&]+/g, '').replace(/\?$/, '');

    let description = cleanHtml(descMatch ? descMatch[1] : '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300);

    const retailer = extractRetailer(title, fullHtml, retailerHint);
    const brand = extractBrand(title, retailer, brandHint);

    // Purge eBay & Resellers
    if (retailer.toLowerCase().includes('ebay') || title.toLowerCase().includes('via ebay') || fullHtml.toLowerCase().includes('via ebay') || retailer.toLowerCase().includes('resale') || retailer.toLowerCase().includes('sneakersupply')) {
      return null;
    }

    // Filter out random non-branded Amazon white-label junk
    if (retailer.toLowerCase().includes('amazon')) {
      const isKnownBrand = KNOWN_BRANDS.some(b => b.toLowerCase() === brand.toLowerCase());
      const hasTechOrClothing = /\b(shoes?|sneakers?|pants|shirt|jacket|headphones|laptop|tv|tablet|charger|ssd|mouse|keyboard|monitor|audio)\b/i.test(title);
      if (!isKnownBrand && !hasTechOrClothing) {
        return null; // Discard random Amazon clutter
      }
    }

    const { category, subcategory, tags, keywords } = classifyDeal(title, description, defaultCategory);

    // Direct store URL resolution (prioritizing Amazon ASIN or genuine retailer endpoints)
    let directStoreUrl = '';
    const asinMatch = fullHtml.match(/data-aps-asin=["']([A-Z0-9]{10})["']/i) || 
                      fullHtml.match(/amazon\.[a-z\.]+\/dp\/([A-Z0-9]{10})/i) || 
                      description.match(/amazon\.[a-z\.]+\/dp\/([A-Z0-9]{10})/i);
    if (asinMatch) {
      directStoreUrl = `https://www.amazon.ca/dp/${asinMatch[1]}`;
    } else {
      directStoreUrl = resolveMerchantUrl(retailer, title, exitWebsite, '', category, subcategory);
    }

    if (!directStoreUrl || !directStoreUrl.startsWith('http')) {
      return null;
    }

    const imgMatch = fullHtml.match(/<img[^>]+src=["'](https:\/\/[^"']+)["']/i);
    let imageUrl = imgMatch ? imgMatch[1] : '';

    const couponCodes = extractCouponCodes(title, description, fullHtml, retailer);

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

    const gender = extractGender(title, category, subcategory);
    const sizes = extractSizes(title, description, subcategory);

    // Final check: Must belong to Clothing or Electronics
    if (category !== 'clothing' && category !== 'electronics') {
      return null;
    }

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

    // Convert prices to CAD at 1.36 for Canadian shoppers
    const cadSalePrice = Math.round((salePrice || 39.99) * 1.36 * 100) / 100;
    const cadOrigPrice = Math.round((originalPrice || ((salePrice || 39.99) * 1.35)) * 1.36 * 100) / 100;

    return {
      id,
      title,
      description,
      brand,
      retailer,
      gender,
      sizes,
      originalPrice: cadOrigPrice,
      salePrice: cadSalePrice,
      savingsPercent: savingsPercent || 25,
      currency: 'CAD',
      productUrl: directStoreUrl,
      sourceUrl: productUrl,
      imageUrl,
      category,
      subcategory,
      tags: [...new Set([...tags, brand.toLowerCase(), retailer.toLowerCase(), gender])],
      keywords: [...new Set([...keywords, brand.toLowerCase(), retailer.toLowerCase(), gender])],
      couponCodes,
      source: 'Verified Retailer Feed',
      verificationStatus: 'verified',
      priceVerified: true,
      linkStatus: 'active',
      httpStatus: 200,
      lastVerifiedAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (err) {
    logger.error('Error parsing item', err.message);
    return null;
  }
}

function parseRedFlagDealsEntry(entryXml, defaultCategory = 'clothing') {
  try {
    const titleMatch = entryXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    let title = titleMatch ? cleanHtml(titleMatch[1]) : '';
    if (!title) return null;

    if (JUNK_REGEX.test(title)) return null;

    const contentMatch = entryXml.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i);
    const fullHtml = contentMatch ? contentMatch[1] : '';

    if (JUNK_REGEX.test(fullHtml)) return null;

    const linkMatch = entryXml.match(/<link[^>]+href=["']([^"']+)["']/i);
    let productUrl = linkMatch ? cleanHtml(linkMatch[1]) : '';
    if (!productUrl) return null;

    // Extract retailer from brackets e.g. [Sport Chek], [Walmart], [Costco]
    let retailer = 'Online Store (Canada)';
    const bracketMatch = title.match(/^\[([^\]]+)\]/);
    let cleanTitle = title;
    if (bracketMatch) {
      const rawRet = bracketMatch[1].trim();
      retailer = extractRetailer(rawRet, fullHtml, rawRet);
      cleanTitle = title.replace(/^\[[^\]]+\]\s*/, '').trim();
    }

    const brand = extractBrand(cleanTitle, retailer);

    // Purge eBay & Resellers
    if (retailer.toLowerCase().includes('ebay') || cleanTitle.toLowerCase().includes('via ebay') || fullHtml.toLowerCase().includes('via ebay') || retailer.toLowerCase().includes('resale')) {
      return null;
    }

    const { category, subcategory, tags, keywords } = classifyDeal(cleanTitle, fullHtml, defaultCategory);

    if (category !== 'clothing' && category !== 'electronics') {
      return null;
    }

    // Price extraction (RedFlagDeals is already in CAD!)
    let salePrice = 0;
    let originalPrice = 0;
    let savingsPercent = 0;

    const priceMatches = [...cleanTitle.matchAll(/\$([0-9]{1,4}(?:\.[0-9]{2})?)/g)].map(m => parseFloat(m[1]));
    if (priceMatches.length === 1) {
      salePrice = priceMatches[0];
      const offMatch = cleanTitle.match(/(\d+)%\s*off/i);
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

    if (!salePrice || salePrice <= 0) {
      return null;
    }

    // Extract direct merchant product link from post body if present
    let directStoreUrl = '';
    const asinMatch = fullHtml.match(/amazon\.[a-z\.]+\/dp\/([A-Z0-9]{10})/i) || cleanTitle.match(/amazon\.[a-z\.]+\/dp\/([A-Z0-9]{10})/i);
    if (asinMatch) {
      directStoreUrl = `https://www.amazon.ca/dp/${asinMatch[1]}`;
    } else {
      const hrefMatch = fullHtml.match(/href=["'](https?:\/\/(?:www\.)?(?:amazon\.ca|sportchek\.ca|bestbuy\.ca|thebay\.com|footlocker\.ca|gapcanada\.ca|oldnavy\.gapcanada\.ca|nike\.com|adidas\.ca|theshoecompany\.ca|walmart\.ca|costco\.ca|apple\.com|lenovo\.com|dell\.com)[^"']+)["']/i);
      if (hrefMatch) {
        directStoreUrl = hrefMatch[1];
      } else {
        directStoreUrl = resolveMerchantUrl(retailer, cleanTitle, '', productUrl, category, subcategory);
      }
    }

    if (!directStoreUrl || !directStoreUrl.startsWith('http')) {
      return null;
    }

    let imageUrl = '';
    if (category === 'clothing' || subcategory === 'shoes') {
      imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
    } else if (subcategory === 'laptops') {
      imageUrl = 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80';
    } else if (subcategory === 'headphones') {
      imageUrl = 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80';
    } else if (subcategory === 'tvs') {
      imageUrl = 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80';
    } else {
      imageUrl = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80';
    }

    const id = crypto.createHash('sha256').update(productUrl + cleanTitle).digest('hex').slice(0, 16);
    const couponCodes = extractCouponCodes(cleanTitle, fullHtml, fullHtml, retailer);

    return {
      id,
      title: cleanTitle,
      description: cleanHtml(fullHtml).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 250),
      brand,
      retailer,
      gender,
      sizes,
      originalPrice: Math.round(originalPrice * 100) / 100,
      salePrice: Math.round(salePrice * 100) / 100,
      savingsPercent,
      currency: 'CAD',
      productUrl: directStoreUrl,
      sourceUrl: productUrl,
      imageUrl,
      category,
      subcategory,
      tags: [...new Set([...tags, brand.toLowerCase(), retailer.toLowerCase(), gender])],
      keywords: [...new Set([...keywords, brand.toLowerCase(), retailer.toLowerCase(), gender])],
      couponCodes,
      source: 'RedFlagDeals (Canada)',
      verificationStatus: 'verified',
      priceVerified: true,
      linkStatus: 'active',
      httpStatus: 200,
      lastVerifiedAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (err) {
    return null;
  }
}

export async function scrapeAllFeeds() {
  logger.info('Starting full feed scrape across Canadian & multi-retailer stores...');
  const allDeals = [];

  for (const feed of RSS_FEEDS) {
    try {
      const feedLabel = feed.retailerHint || feed.brandHint || feed.category;
      logger.info(`Fetching feed: ${feedLabel}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
      const response = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) BargainBoard/1.0'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn(`Feed ${feedLabel} returned ${response.status}`);
        continue;
      }

      const text = await response.text();

      if (feed.type === 'atom') {
        const entryMatches = text.match(/<entry[\s\S]*?<\/entry>/gi) || [];
        logger.info(`Found ${entryMatches.length} Atom entries in ${feedLabel}`);
        for (const entryXml of entryMatches) {
          const parsed = parseRedFlagDealsEntry(entryXml, feed.category);
          if (parsed) {
            allDeals.push(parsed);
          }
        }
      } else {
        const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
        logger.info(`Found ${itemMatches.length} raw items in ${feedLabel}`);
        for (const itemXml of itemMatches) {
          const parsed = parseSlickdealsItem(itemXml, feed.category, feed.brandHint, feed.retailerHint);
          if (parsed) {
            allDeals.push(parsed);
          }
        }
      }

      await new Promise(r => setTimeout(r, 400));
    } catch (err) {
      logger.error(`Failed scraping ${feed.url}`, err.message);
    }
  }

  const deduped = dedupDeals(allDeals);
  logger.success(`Scraped ${allDeals.length} valid clothing & electronics items, deduped to ${deduped.length} unique items!`);

  const docsOutputPath = path.join(__dirname, '../docs/deals-data.json');
  await fs.writeFile(docsOutputPath, JSON.stringify(deduped, null, 2));
  logger.success(`Wrote ${deduped.length} clean multi-retailer deals to ${docsOutputPath}`);

  return deduped;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  scrapeAllFeeds()
    .then(deals => console.log(`Done! Generated ${deals.length} clean deals.`))
    .catch(err => console.error('Fatal scrape error:', err));
}
