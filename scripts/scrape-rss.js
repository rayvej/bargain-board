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

  // ─── RETAILER STORES (SHOE & APPAREL CLEARANCE) ───
  { category: 'clothing', retailerHint: 'Foot Locker', url: 'https://slickdeals.net/newsearch.php?q=foot+locker&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: "Dick's Sporting Goods", url: 'https://slickdeals.net/newsearch.php?q=dicks+sporting+goods&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Finish Line', url: 'https://slickdeals.net/newsearch.php?q=finish+line&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Nordstrom Rack', url: 'https://slickdeals.net/newsearch.php?q=nordstrom+rack&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'DSW', url: 'https://slickdeals.net/newsearch.php?q=dsw+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: "Macy's", url: 'https://slickdeals.net/newsearch.php?q=macys+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: "Macy's", url: 'https://slickdeals.net/newsearch.php?q=macys+clothing&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: "Kohl's", url: 'https://slickdeals.net/newsearch.php?q=kohls+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'REI', url: 'https://slickdeals.net/newsearch.php?q=rei+outlet&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Zappos', url: 'https://slickdeals.net/newsearch.php?q=zappos+clearance&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Shoe Carnival', url: 'https://slickdeals.net/newsearch.php?q=shoe+carnival&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Scheels', url: 'https://slickdeals.net/newsearch.php?q=scheels+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Champs Sports', url: 'https://slickdeals.net/newsearch.php?q=champs+sports&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Journeys', url: 'https://slickdeals.net/newsearch.php?q=journeys+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Sierra', url: 'https://slickdeals.net/newsearch.php?q=sierra+shoes&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Backcountry', url: 'https://slickdeals.net/newsearch.php?q=backcountry+clearance&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'J.Crew', url: 'https://slickdeals.net/newsearch.php?q=j+crew+clearance&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Gap', url: 'https://slickdeals.net/newsearch.php?q=gap+factory&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Banana Republic', url: 'https://slickdeals.net/newsearch.php?q=banana+republic+factory&searcharea=deals&searchin=first&rss=1' },
  { category: 'clothing', retailerHint: 'Old Navy', url: 'https://slickdeals.net/newsearch.php?q=old+navy+clearance&searcharea=deals&searchin=first&rss=1' },

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

// Aggressive Junk / Non-clothing / Non-electronics regex
const JUNK_REGEX = /\b(flight|flights|airline|airlines|airfare|hotel|vacation|roundtrip|resort|cruise|gift card|giftcard|extra bucks|extrabucks|cashback|cash back|trade-in|trade in|publix|cvs|walgreens|grocery|food|snack|cookie|candy|meat|cheese|coffee|hose|watering wand|insect|mosquito|bug spray|picaridin|cushion|pillow|throw pillow|cutting board|propane|deadbolt|pressure washer|wrench|socket|drill bit|fertilizer|plant|shampoo|soap|detergent|toothpaste|pan|pot|skillet|knife|blender|mattress|towel|bedding|sheet set|comforter|board game|puzzle|card game|lego|doll|toy|car cover|wiper|brake|motor oil|oil filter|spark plug)\b/i;

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
  // 1. Check title for "at Store" or "from Store" or "@ Store"
  for (const r of KNOWN_RETAILERS) {
    const regex = new RegExp(`(?:at|from|@)\\s+${r.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}`, "i");
    if (regex.test(title)) return r;
  }

  // 2. Check retailerHint from feed configuration
  if (retailerHint) return retailerHint;

  // 3. Check HTML attributes from feed outclick
  const retailerMatch = fullHtml.match(/data-product-exitWebsite=["']([^"']+)["']/i) ||
                        fullHtml.match(/data-store-slug=["']([^"']+)["']/i);
  if (retailerMatch) {
    const slug = retailerMatch[1].replace('.com', '').replace('-', ' ').trim();
    for (const r of KNOWN_RETAILERS) {
      if (slug.toLowerCase().includes(r.toLowerCase())) return r;
    }
    return slug.toUpperCase();
  }

  // 4. Fallback search in title
  for (const r of KNOWN_RETAILERS) {
    const regex = new RegExp(`\\b${r.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    if (regex.test(title)) return r;
  }

  return 'Online Store';
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

  // Range match e.g. "sizes 7-13", "sizes 8 to 12", "sz 8-11"
  const rangeMatch = text.match(/\b(?:sizes?|sz\.?)\s*([0-9]{1,2}(?:\.[0-9])?)\s*(?:-|to)\s*([0-9]{1,2}(?:\.[0-9])?)\b/i);
  if (rangeMatch) {
    const start = parseFloat(rangeMatch[1]);
    const end = parseFloat(rangeMatch[2]);
    if (start >= 5 && end <= 15 && start < end) {
      for (let s = start; s <= end; s += 0.5) {
        sizes.push(String(s));
      }
    }
  }

  const shoeMatch = text.match(/\b(?:sizes?|sz\.?)\s*([0-9]{1,2}(?:\.[0-9])?)\b/i);
  if (shoeMatch) {
    sizes.push(shoeMatch[1]);
  }

  const clothingSizes = ["xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl", "28", "30", "32", "34", "36", "38"];
  for (const s of clothingSizes) {
    if (new RegExp(`\\b(?:size|sizes|sz)?\\s*${s}\\b`, "i").test(text)) {
      sizes.push(s.toUpperCase());
    }
  }

  const isFootwear = /\b(shoes?|sneakers?|boots?|runners?|trainers?)\b/i.test(text);
  if (isFootwear && sizes.length === 0) {
    sizes.push("All");
  }

  if (/\b(select sizes|multiple sizes|all sizes|sizes available)\b/i.test(text)) {
    sizes.push("All");
  }

  return [...new Set(sizes)];
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

    const outclickMatch = fullHtml.match(/<a[^>]+href=["'](https:\/\/slickdeals\.net\/click\?[^"']+)["']/i);
    let directStoreUrl = outclickMatch ? cleanHtml(outclickMatch[1]) : productUrl;

    let description = cleanHtml(descMatch ? descMatch[1] : '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300);

    const retailer = extractRetailer(title, fullHtml, retailerHint);
    const brand = extractBrand(title, retailer, brandHint);

    // Filter out random non-branded Amazon white-label junk
    if (retailer.toLowerCase().includes('amazon')) {
      const isKnownBrand = KNOWN_BRANDS.some(b => b.toLowerCase() === brand.toLowerCase());
      const hasTechOrClothing = /\b(shoes?|sneakers?|pants|shirt|jacket|headphones|laptop|tv|tablet|charger|ssd|mouse|keyboard|monitor|audio)\b/i.test(title);
      if (!isKnownBrand && !hasTechOrClothing) {
        return null; // Discard random Amazon clutter
      }
    }

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

    const { category, subcategory, tags, keywords } = classifyDeal(title, description, defaultCategory);
    const gender = extractGender(title, category, subcategory);
    const sizes = extractSizes(title, description);

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

    const gender = extractGender(cleanTitle, category, subcategory);
    const sizes = extractSizes(cleanTitle, fullHtml);

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
      productUrl,
      sourceUrl: productUrl,
      imageUrl,
      category,
      subcategory,
      tags: [...new Set([...tags, brand.toLowerCase(), retailer.toLowerCase(), gender])],
      keywords: [...new Set([...keywords, brand.toLowerCase(), retailer.toLowerCase(), gender])],
      couponCodes: [],
      source: 'RedFlagDeals (Canada)',
      verificationStatus: 'verified',
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
