import { formatPrice, formatRelativeTime, copyToClipboard } from './ui.js';

export function createDealCardHTML(deal) {
    const savingsClass = deal.savingsPercent > 40 ? 'savings-high text-bb-success font-bold' : 
                         deal.savingsPercent > 20 ? 'savings-medium text-bb-primary font-bold' : 
                         'savings-low text-gray-600';
                         
    const verifiedBadge = deal.verificationStatus === 'verified' ? 
        `<span class="badge-verified bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1"><svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Verified</span>` : 
        deal.verificationStatus === 'expired' ? 
        `<span class="badge-expired bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Expired</span>` :
        `<span class="badge-unverified bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Unverified</span>`;

    const couponsHtml = (deal.couponCodes || []).map(coupon => `
        <div class="coupon-code mt-2 flex items-center justify-between border border-dashed border-cyan-400 rounded-lg px-2.5 py-1.5 bg-cyan-50/50 hover:bg-cyan-50 transition-colors">
            <div class="flex items-center gap-1.5">
                <span class="text-xs text-cyan-700">🏷️</span>
                <span class="font-mono text-xs text-cyan-900 font-bold tracking-wide">${coupon.code}</span>
            </div>
            <button type="button" class="copy-coupon-btn text-xs font-semibold text-[#06B6D4] hover:text-cyan-700 px-2 py-0.5 rounded hover:bg-white transition-colors" data-code="${coupon.code}">
                Copy
            </button>
        </div>
    `).join('');

    const targetUrl = deal.productUrl || deal.sourceUrl || '#';

    return `
        <div class="deal-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col h-full" data-id="${deal.id}">
            <div class="relative pt-[70%] bg-gray-100 overflow-hidden cursor-pointer open-deal-modal group">
                <img src="${deal.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'}" 
                     alt="${deal.title}" 
                     class="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                     loading="lazy"
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80'">
                <div class="absolute top-2 right-2 flex flex-col gap-1 shadow-sm">
                    ${verifiedBadge}
                </div>
            </div>
            
            <div class="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center mb-1.5">
                        <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">${deal.retailer || 'DEAL'}</span>
                        <span class="text-[11px] text-gray-400">${formatRelativeTime(deal.createdAt || new Date())}</span>
                    </div>
                    
                    <h3 class="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 cursor-pointer hover:text-bb-primary open-deal-modal transition-colors" title="${deal.title}">
                        ${deal.title}
                    </h3>
                </div>
                
                <div class="mt-3 pt-3 border-t border-gray-100">
                    <div class="flex items-baseline gap-2 mb-2">
                        <span class="text-lg font-extrabold text-gray-900">${formatPrice(deal.salePrice)}</span>
                        ${deal.originalPrice > deal.salePrice ? `<span class="text-xs text-gray-400 line-through">${formatPrice(deal.originalPrice)}</span>` : ''}
                        ${deal.savingsPercent ? `<span class="${savingsClass} text-xs ml-auto">${deal.savingsPercent}% OFF</span>` : ''}
                    </div>
                    
                    ${couponsHtml}
                    
                    <a href="${targetUrl}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="btn-deal mt-3 w-full block text-center bg-bb-accent hover:bg-orange-600 active:scale-[0.98] text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow text-sm cursor-pointer select-none">
                        Go to Deal →
                    </a>
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
        }
    });
}
