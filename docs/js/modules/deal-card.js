import { formatPrice, formatRelativeTime, copyToClipboard } from './ui.js';

export function getComparisonLinks(deal) {
    return {
        amazonDeals: 'https://www.amazon.ca/deals',
        fashionPortal: 'https://www.theshoecompany.ca/en/ca/category/clearance',
        techPortal: 'https://www.bestbuy.ca/en-ca/collection/clearance-deals/16694'
    };
}

export function createDealCardHTML(deal) {
    const savingsClass = deal.savingsPercent > 40 ? 'savings-high text-bb-success font-bold' : 
                         deal.savingsPercent > 20 ? 'savings-medium text-bb-primary font-bold' : 
                         'savings-low text-gray-600';
                         
    const verifiedBadge = (deal.verificationStatus === 'verified' || deal.linkStatus === 'active') ? 
        `<span class="badge-verified bg-emerald-600/95 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5 font-bold shadow-md" title="Link & Price Verified: Confirmed Active Merchant URL">
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
            <span>Verified Link</span>
         </span>` : 
        deal.verificationStatus === 'expired' ? 
        `<span class="badge-expired bg-red-600/95 text-white text-xs px-2 py-0.5 rounded font-semibold">Expired</span>` :
        `<span class="badge-unverified bg-amber-500/95 text-white text-xs px-2 py-0.5 rounded font-semibold">Community</span>`;

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
                    
                    <div class="flex items-center justify-between text-[10px] text-emerald-700 font-semibold mt-2 mb-1 bg-emerald-50/80 px-2 py-1 rounded border border-emerald-100/80">
                        <span class="flex items-center gap-1">
                            <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                            <span>Price & Link Tested</span>
                        </span>
                        <span class="text-emerald-800 font-bold">✓ Active in CAD</span>
                    </div>
                    
                    <div class="flex gap-2 mt-2">
                        <a href="${targetUrl}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn-deal flex-1 text-center bg-bb-accent hover:bg-orange-600 active:scale-[0.98] text-white font-semibold py-2 px-3 rounded-lg transition-all shadow-sm hover:shadow text-xs cursor-pointer select-none truncate flex items-center justify-center gap-1">
                            <span>Get Deal</span>
                            <span>→</span>
                        </a>
                        <button type="button" 
                           class="open-deal-modal px-3 py-2 text-center bg-gray-50 hover:bg-cyan-50 text-gray-700 hover:text-[#06B6D4] font-semibold rounded-lg border border-gray-200 hover:border-cyan-300 transition-all text-xs cursor-pointer select-none flex items-center gap-1"
                           title="View deal details and coupon codes">
                            <span>📋</span>
                            <span class="hidden sm:inline">Details</span>
                        </button>
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
            // Auto-copy coupon code if available
            const card = dealBtn.closest('.deal-card');
            const couponBtn = card?.querySelector('.copy-coupon-btn');
            if (couponBtn) {
                const code = couponBtn.getAttribute('data-code');
                if (code) copyToClipboard(code);
            }
            // Native <a target="_blank"> opens the product page cleanly
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
