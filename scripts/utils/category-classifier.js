const CATEGORY_MAP = {
  clothing: {
    keywords: [
      'shirt', 'pants', 'shoes', 'jacket', 'hoodie', 'apparel', 'sneakers', 'boots', 'dress',
      'watch', 'jeans', 'sweater', 'coat', 'fleece', 'tee', 't-shirt', 'short', 'shorts',
      'underwear', 'boxers', 'socks', 'suit', 'blazer', 'polo', 'joggers', 'tights', 'leggings',
      'vest', 'sandals', 'slides', 'clogs', 'loafers', 'oxford', 'heels', 'flats', 'belt',
      'sunglasses', 'glasses', 'wallet', 'backpack', 'tote', 'bag', 'purse', 'hat', 'cap', 'beanie',
      'gloves', 'scarf', 'jewelry', 'ring', 'necklace', 'bracelet', 'outerwear', 'activewear', 'swim'
    ],
    subcategories: {
      shoes: ['shoes', 'sneakers', 'boots', 'sandals', 'slides', 'running shoes', 'clogs', 'loafers', 'footwear'],
      mens: ['men', 'mens', "men's", 'male', 'gentleman'],
      womens: ['women', 'womens', "women's", 'female', 'ladies', 'dress', 'skirt', 'bra'],
      accessories: ['watch', 'hat', 'belt', 'sunglasses', 'wallet', 'backpack', 'bag', 'jewelry', 'beanie'],
      activewear: ['gym', 'running', 'athletic', 'workout', 'training', 'yoga', 'sportswear', 'fleece']
    }
  },
  electronics: {
    keywords: [
      'tv', 'laptop', 'computer', 'phone', 'headphones', 'earbuds', 'speaker', 'monitor', 'smart',
      'bluetooth', 'ssd', 'desktop', 'pc', 'tablet', 'ipad', 'android', 'iphone', 'pixel',
      'galaxy', 'macbook', 'charger', 'cable', 'dock', 'mouse', 'keyboard', 'gpu', 'cpu', 'ram',
      'drive', 'router', 'wifi', 'camera', 'lens', 'drone', 'audio', 'soundbar', 'receiver',
      'console', 'playstation', 'ps5', 'xbox', 'nintendo', 'switch', 'controller', 'oled', 'qled',
      '4k', 'gaming', 'smarthome', 'alexa', 'echo', 'nest', 'ring', 'doorbell', 'robot', 'vacuum'
    ],
    subcategories: {
      laptops: ['laptop', 'macbook', 'chromebook', 'notebook', 'thinkpad', 'zenbook', 'xps', 'desktop', 'pc', 'computer'],
      phones: ['phone', 'iphone', 'galaxy', 'smartphone', 'pixel', 'android', 'tablet', 'ipad'],
      headphones: ['headphones', 'earbuds', 'airpods', 'bose', 'sony', 'headset', 'audio', 'speaker', 'soundbar'],
      tvs: ['tv', 'television', 'oled', 'qled', '4k', 'uhd', 'monitor', 'display'],
      gaming: ['playstation', 'ps5', 'xbox', 'nintendo', 'switch', 'gaming', 'controller', 'steam', 'rtx', 'gpu'],
      smarthome: ['smart', 'alexa', 'echo', 'nest', 'ring', 'hue', 'doorbell', 'vacuum', 'plug'],
      cameras: ['camera', 'dslr', 'mirrorless', 'lens', 'gopro', 'camcorder', 'drone']
    }
  }
};

const FEED_TO_CATEGORY = {
  shoes: { category: 'clothing', subcategory: 'shoes' },
  clothing: { category: 'clothing', subcategory: 'mens' },
  mens: { category: 'clothing', subcategory: 'mens' },
  womens: { category: 'clothing', subcategory: 'womens' },
  laptops: { category: 'electronics', subcategory: 'laptops' },
  headphones: { category: 'electronics', subcategory: 'headphones' },
  tv: { category: 'electronics', subcategory: 'tvs' },
  gaming: { category: 'electronics', subcategory: 'gaming' },
  phones: { category: 'electronics', subcategory: 'phones' },
  electronics: { category: 'electronics', subcategory: 'laptops' },
  frontpage: { category: 'electronics', subcategory: 'laptops' },
  popular: { category: 'clothing', subcategory: 'shoes' }
};

export function classifyDeal(title, description = '', feedHint = '') {
  const text = (title + ' ' + description).toLowerCase();

  let detectedCategory = 'unknown';
  let detectedSubcategory = 'other';
  let maxScore = 0;

  for (const [cat, data] of Object.entries(CATEGORY_MAP)) {
    const score = data.keywords.filter(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(text);
    }).length;

    if (score > maxScore) {
      maxScore = score;
      detectedCategory = cat;
    }
  }

  // Fallback to feed hint if text classification was inconclusive
  if (detectedCategory === 'unknown' && feedHint && FEED_TO_CATEGORY[feedHint]) {
    detectedCategory = FEED_TO_CATEGORY[feedHint].category;
    detectedSubcategory = FEED_TO_CATEGORY[feedHint].subcategory;
  } else if (detectedCategory === 'unknown') {
    // Default to electronics if tech words or clothing if fashion words
    detectedCategory = 'electronics';
    detectedSubcategory = 'laptops';
  }

  // Subcategory detection
  if (detectedCategory in CATEGORY_MAP) {
    const subcats = CATEGORY_MAP[detectedCategory].subcategories;
    let foundSubcat = false;
    for (const [subcat, kws] of Object.entries(subcats)) {
      if (kws.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(text))) {
        detectedSubcategory = subcat;
        foundSubcat = true;
        break;
      }
    }
    if (!foundSubcat && feedHint && FEED_TO_CATEGORY[feedHint]) {
      detectedSubcategory = FEED_TO_CATEGORY[feedHint].subcategory;
    }
  }

  // Extract clean tags
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = cleanTitle.split(/\s+/).filter(w => w.length > 2 && !['and', 'for', 'the', 'with', 'off', 'free'].includes(w));
  const keywords = [...new Set(words)].slice(0, 10);

  return {
    category: detectedCategory,
    subcategory: detectedSubcategory,
    tags: keywords.slice(0, 4),
    keywords
  };
}
