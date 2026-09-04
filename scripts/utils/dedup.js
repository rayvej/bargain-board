/**
 * Removes duplicate deals based on their SHA256 ID.
 * Keeps the deal with the lower sale price if IDs clash, or simply the first one found.
 */
export function dedupDeals(deals) {
  const map = new Map();
  
  for (const deal of deals) {
    if (!deal.id) continue;
    
    if (map.has(deal.id)) {
      const existing = map.get(deal.id);
      if (deal.salePrice > 0 && deal.salePrice < existing.salePrice) {
        map.set(deal.id, deal);
      }
    } else {
      map.set(deal.id, deal);
    }
  }
  
  return Array.from(map.values());
}
