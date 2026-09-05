import { formatPrice, formatRelativeTime, copyToClipboard } from './ui.js';

export function getComparisonLinks(deal) {
    const cleanTitle = (deal.title || '')
        .replace(/^(deal:\s*|\$\d+[\d\.]*\s*\|\s*)/i, '')
        .replace(/\b(w\/|with|free s&h|free shipping|at [a-z0-9\.\s&]+)\b/gi, '')
        .replace(/[\(\)\[\]]/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 70)
        .trim();

    const brand = deal.brand && deal.brand !== 'Various' && deal.brand !== 'Online Store' ? deal.brand : '';
    const query = (brand && !cleanTitle.toLowerCase().includes(brand.toLowerCase()) ? brand + ' ' : '') + cleanTitle;

    return {
        query,
        googleShopping: `https://www.google.com/search?tbm=shop&gl=ca&hl=en&q=${encodeURIComponent(query)}`,
        fashionSearch: `https://www.google.com/search?q=${encodeURIComponent(query + ' (site:sportchek.ca OR site:footlocker.ca OR site:thebay.com OR site:theshoecompany.ca OR site:nike.com/ca)')}`,
        techSearch: `https://www.google.com/search?q=${encodeURIComponent(query + ' (site:bestbuy.ca OR site:canadacomputers.com OR site:memoryexpress.com OR site:apple.com/ca)')}`
    };
}

export function createDealCardHTML(deal) {
    const savingsClass = deal.savingsPercent > 40 ? 'savings-high text-bb-success font-bold' : 
                         deal.savingsPercent > 20 ? 'savings-medium text-bb-primary font-bold' : 
                         'savings-low text-gray-600';
                         
    const verifiedBadge = deal.verificationStatus === 'verified' ? 
        `<span class="badge-verified bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-semibold"><svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Verified</span>` : 
        deal.verificationStatus === 'expired' ? 
        `<span class="badge-expired bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-semibold">Expired</span>` :
        `<span class="badge-unverified bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-semibold">Community</span>`;

    const genderBadge = deal.gender === 'men' 
        ? `<span class="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Men's</span>`
        : deal.gender === 'women'
        ? `<span class="text-[10px] font-semibold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded">Women's</span>`
        : deal.gender === 'kids'
        ? `<span class="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Kids</span>`
        : '';

    const sizesHtml = (deal.sizes && deal.sizes.length > 0 && !deal.sizes.includes('All'))
        ? `<div class="text-[11px] text-gray-500 mt-1 mb-1.5 flex items-center gap-1">
             <span class="text-gray-400 font-medium">Sizes:</span>
             <span class="font-medium text-gray-700">${deal.sizes.slice(0, 4).join(', ')}${deal.sizes.length > 4 ? '…' : ''}</span>
           </div>`
        : '';

    const couponsHtml = (deal.couponCodes || []).map(coupon => `
        <div class="coupon-code mt-2 border border-dashed border-cyan-400 rounded-lg p-2 bg-gradient-to-r from-cyan-50/60 to-emerald-50/40">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                    <span class="text-xs">🏷️</span>
                    <span class="font-mono text-xs text-cyan-950 font-bold tracking-wide">${coupon.code}</span>
                    <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">${coupon.discount || 'PROMO'}</span>
                </div>
                <button type="button" class="copy-coupon-btn text-xs font-bold text-white bg-[#06B6D4] hover:bg-cyan-600 px-2 py-0.5 rounded shadow-sm transition-colors cursor-pointer" data-code="${coupon.code}">
                    Copy
                </button>
            </div>
            <div class="mt-1 flex items-center justify-between text-[10px] text-gray-500">
                <span class="flex items-center gap-0.5 text-emerald-700 font-medium">
                    <span>🥞</span>
                    <span>${coupon.stacksWithSale !== false ? 'Stacks with Sale' : 'Promo Only'}</span>
                </span>
                <span class="text-gray-400 font-mono">Verified</span>
            </div>
        </div>
    `).join('');

    const targetUrl = deal.productUrl || deal.sourceUrl || '#';
    const displayRetailer = deal.retailer || 'Online Store';
    const displayBrand = deal.brand && deal.brand !== displayRetailer && deal.brand !== 'Various' ? deal.brand : null;

    const comp = getComparisonLinks(deal);
    const isFashion = deal.category === 'clothing' || deal.subcategory === 'shoes';

    return `
        <div class="deal-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col h-full" data-id="${deal.id}">
            <div class="relative pt-[68%] bg-gray-100 overflow-hidden cursor-pointer open-deal-modal group">
                <img src="${deal.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'}" 
                     alt="${deal.title}" 
                     class="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                     loading="lazy"
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80'">
                
                <div class="absolute top-2 right-2 flex flex-col gap-1 shadow-sm">
                    ${verifiedBadge}
                </div>

                <div class="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                    <span>🏪</span>
                    <span class="truncate max-w-[130px]">${displayRetailer}</span>
                </div>
            </div>
            
            <div class="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center mb-1.5 flex-wrap gap-1">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            ${displayBrand ? `<span class="text-[11px] font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">${displayBrand}</span>` : ''}
                            ${genderBadge}
                        </div>
                        <span class="text-[11px] text-gray-400">${formatRelativeTime(deal.createdAt || new Date())}</span>
                    </div>
                    
                    <h3 class="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2 cursor-pointer hover:text-bb-primary open-deal-modal transition-colors" title="${deal.title}">
                        ${deal.title}
                    </h3>

                    ${sizesHtml}
                </div>
                
                <div class="mt-3 pt-3 border-t border-gray-100">
                    <div class="flex items-baseline gap-2 mb-2">
                        <span class="text-lg font-extrabold text-gray-900">${formatPrice(deal.salePrice)}</span>
                        ${deal.originalPrice > deal.salePrice ? `<span class="text-xs text-gray-400 line-through">${formatPrice(deal.originalPrice)}</span>` : ''}
                        ${deal.savingsPercent ? `<span class="${savingsClass} text-xs ml-auto font-bold">${deal.savingsPercent}% OFF</span>` : ''}
                    </div>
                    
                    ${couponsHtml}
                    
                    <div class="flex gap-2 mt-3">
                        <a href="${targetUrl}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn-deal flex-1 text-center bg-bb-accent hover:bg-orange-600 active:scale-[0.98] text-white font-semibold py-2 px-3 rounded-lg transition-all shadow-sm hover:shadow text-xs cursor-pointer select-none truncate">
                            Go to Deal →
                        </a>
                        <a href="${comp.googleShopping}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn-compare px-2.5 py-2 text-center bg-gray-50 hover:bg-cyan-50 text-gray-700 hover:text-[#06B6D4] font-semibold rounded-lg border border-gray-200 hover:border-cyan-300 transition-all text-xs cursor-pointer select-none flex items-center gap-1"
                           title="Compare prices across all stores on Google Shopping">
                            <span>🔍</span>
                            <span class="hidden sm:inline">Compare</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function setupDealCardListeners(container) {
    container.addEventListener('click', (e) => {
        // Copy coupon button handler
        const copyBtn = e.target.closest('.copy-coupon-btn');
        if (copyBtn) {
            e.preventDefault();
            e.stopPropagation();
            const code = copyBtn.getAttribute('data-code');
            if (code) copyToClipboard(code);
            return;
        }

        // Deal CTA button click handler
        const dealBtn = e.target.closest('.btn-deal');
        if (dealBtn) {
            e.stopPropagation();
            const href = dealBtn.getAttribute('href');
            if (href && href !== '#') {
                window.open(href, '_blank', 'noopener,noreferrer');
            }
            return;
        }

        // Compare Stores button click handler
        const compareBtn = e.target.closest('.btn-compare');
        if (compareBtn) {
            e.stopPropagation();
            const href = compareBtn.getAttribute('href');
            if (href && href !== '#') {
                window.open(href, '_blank', 'noopener,noreferrer');
            }
            return;
        }
    });
}
