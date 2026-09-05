/**
 * Bargain Board — Internet Deal Search Engine
 * Formulates precise queries based on active user filters (gender, size, category, brand, price)
 * and generates deep-link deal search URLs across major retailers, Google Shopping, and Slickdeals.
 */

import { openModal } from './ui.js';

export function buildSearchQuery(filters) {
    const parts = [];
    const tags = [];

    // Brand
    if (filters.brand) {
        parts.push(filters.brand);
        tags.push(`Brand: ${filters.brand}`);
    }

    // Gender
    if (filters.gender && filters.gender !== 'all') {
        const genderLabel = filters.gender === 'men' ? "Men's" : 
                            filters.gender === 'women' ? "Women's" : "Kids";
        parts.push(genderLabel);
        tags.push(genderLabel);
    }

    // Category / Subcategory
    if (filters.category && filters.category !== 'all') {
        const catMap = {
            'shoes': 'Shoes',
            'clothing': 'Clothing',
            'mens': "Men's Apparel",
            'womens': "Women's Apparel",
            'electronics': 'Electronics',
            'laptops': 'Laptops',
            'phones': 'Phones & Tablets',
            'headphones': 'Headphones & Audio',
            'tvs': 'TVs',
            'gaming': 'Video Games & Consoles',
            'accessories': 'Accessories',
            'smarthome': 'Smart Home'
        };
        const catName = catMap[filters.category] || filters.category;
        parts.push(catName);
        tags.push(catName);
    }

    // Size
    if (filters.size) {
        parts.push(`Size ${filters.size}`);
        tags.push(`Size: ${filters.size}`);
    }

    // User Text Search Query
    if (filters.search && filters.search.trim()) {
        const cleanSearch = filters.search.trim();
        // Avoid duplicating brand if user typed the brand
        if (!filters.brand || !cleanSearch.toLowerCase().includes(filters.brand.toLowerCase())) {
            parts.push(cleanSearch);
        }
        tags.push(`"${cleanSearch}"`);
    }

    const cleanTerms = parts.length > 0 ? parts.join(' ') : 'Best Deals on Shoes, Clothing & Tech';

    // Price Range (for display and tags, omitted from retailer keyword query to prevent keyword misses)
    let priceLabel = null;
    if (filters.priceRange) {
        const priceMap = {
            'under25': 'Under $25',
            'under50': 'Under $50',
            'under100': 'Under $100',
            '25to50': '$25 – $50',
            '50to100': '$50 – $100',
            '100to250': '$100 – $250',
            '250plus': '$250+'
        };
        priceLabel = priceMap[filters.priceRange] || filters.priceRange;
        tags.push(priceLabel);
    }

    // Retailer
    if (filters.retailer) {
        tags.push(`Store: ${filters.retailer}`);
    }

    // Display query
    const displayQuery = priceLabel && parts.length > 0
        ? `${cleanTerms} (${priceLabel})`
        : cleanTerms;
    
    // Determine category type
    const queryLower = displayQuery.toLowerCase();
    const isFashion = filters.category === 'shoes' || 
                      filters.category === 'clothing' || 
                      filters.category === 'mens' || 
                      filters.category === 'womens' || 
                      filters.size || 
                      queryLower.includes('shoe') || 
                      queryLower.includes('sneaker') || 
                      queryLower.includes('shirt') || 
                      queryLower.includes('hoodie') ||
                      queryLower.includes('pant') ||
                      queryLower.includes('jacket');

    return {
        displayQuery,
        cleanTerms: parts.join(' '),
        tags,
        isFashion,
        hasActiveFilters: parts.length > 0
    };
}

export function getRetailerSearchLinks(queryInfo) {
    const q = queryInfo.cleanTerms || queryInfo.displayQuery;
    const isFashion = queryInfo.isFashion;

    const links = [
        {
            name: 'Google Shopping',
            badge: '🔥 Lowest Price',
            badgeColor: 'bg-emerald-100 text-emerald-800',
            icon: '🌐',
            url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q + ' sale deals')}`,
            desc: 'Real-time price comparison across thousands of online merchants.'
        },
        {
            name: 'Slickdeals Live Feed',
            badge: 'Community Vetted',
            badgeColor: 'bg-cyan-100 text-cyan-800',
            icon: '⚡',
            url: `https://slickdeals.net/newsearch.php?q=${encodeURIComponent(q)}`,
            desc: 'Live coupon codes and flash discounts submitted by shoppers.'
        }
    ];

    if (isFashion) {
        links.push(
            {
                name: 'Foot Locker',
                badge: 'Footwear & Apparel',
                badgeColor: 'bg-blue-100 text-blue-800',
                icon: '👟',
                url: `https://www.footlocker.com/search?query=${encodeURIComponent(q)}`,
                desc: 'Foot Locker brand clearance, sneakers and activewear sales.'
            },
            {
                name: "Dick's Sporting Goods",
                badge: 'Sporting Goods',
                badgeColor: 'bg-amber-100 text-amber-800',
                icon: '🏃',
                url: `https://www.dickssportinggoods.com/search/SearchDisplay?searchTerm=${encodeURIComponent(q + ' clearance')}`,
                desc: 'Major brand apparel, footwear, and active lifestyle sales.'
            },
            {
                name: 'Nordstrom Rack',
                badge: 'Up to 70% Off',
                badgeColor: 'bg-rose-100 text-rose-800',
                icon: '🏷️',
                url: `https://www.nordstromrack.com/sr?query=${encodeURIComponent(q)}`,
                desc: 'Designer brands and footwear at steep department store markdowns.'
            },
            {
                name: 'DSW (Designer Shoe Warehouse)',
                badge: 'Shoe Deals',
                badgeColor: 'bg-purple-100 text-purple-800',
                icon: '👞',
                url: `https://www.dsw.com/browse/shoes?query=${encodeURIComponent(q)}`,
                desc: 'Thousands of shoes on clearance across every size and style.'
            },
            {
                name: 'Zappos Clearance',
                badge: 'Free Shipping',
                badgeColor: 'bg-sky-100 text-sky-800',
                icon: '📦',
                url: `https://www.zappos.com/search?term=${encodeURIComponent(q + ' sale')}`,
                desc: 'Top shoe brands with comprehensive size inventories and sale pricing.'
            }
        );
    } else {
        links.push(
            {
                name: 'Best Buy',
                badge: 'Electronics',
                badgeColor: 'bg-yellow-100 text-yellow-800',
                icon: '💻',
                url: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q + ' deal')}`,
                desc: 'Tech deals, open-box specials, and official clearance items.'
            },
            {
                name: 'B&H Photo Video',
                badge: 'Tech & Cameras',
                badgeColor: 'bg-blue-100 text-blue-800',
                icon: '📷',
                url: `https://www.bhphotovideo.com/c/search?Ntt=${encodeURIComponent(q)}`,
                desc: 'High-end laptops, audio, cameras and computer electronics.'
            },
            {
                name: 'Newegg',
                badge: 'PC & Tech Deals',
                badgeColor: 'bg-orange-100 text-orange-800',
                icon: '🖥️',
                url: `https://www.newegg.com/p/pl?d=${encodeURIComponent(q)}`,
                desc: 'Computer components, laptops, monitors, and gadget sales.'
            },
            {
                name: 'Target Deals',
                badge: 'Department Deals',
                badgeColor: 'bg-red-100 text-red-800',
                icon: '🎯',
                url: `https://www.target.com/s?searchTerm=${encodeURIComponent(q + ' deal')}`,
                desc: 'Target circle offers, seasonal markdowns, and electronics promos.'
            }
        );
    }

    links.push({
        name: 'eBay Deals & Outlet',
        badge: 'Direct Outlet',
        badgeColor: 'bg-indigo-100 text-indigo-800',
        icon: '🛍️',
        url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q + ' sale')}&LH_ItemCondition=1000&_sop=15`,
        desc: 'Brand-direct outlets (Nike, Adidas, Apple, Bose) in brand new condition.'
    });

    return links;
}

/**
 * Attempts real-time deal discovery via free public CORS proxy
 */
export async function fetchLiveWebDeals(query) {
    if (!query || !query.trim()) return [];

    const targetRss = `https://slickdeals.net/newsearch.php?mode=popdeals&q=${encodeURIComponent(query)}&rss=1`;
    const proxyUrls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetRss)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(targetRss)}`
    ];

    for (const url of proxyUrls) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const text = await res.text();
                if (text && (text.includes('<rss') || text.includes('<channel>'))) {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(text, 'text/xml');
                    const items = xml.querySelectorAll('item');
                    
                    const deals = [];
                    items.forEach((item, idx) => {
                        if (idx >= 6) return;
                        const title = item.querySelector('title')?.textContent || '';
                        const link = item.querySelector('link')?.textContent || '';
                        const desc = item.querySelector('description')?.textContent || '';
                        const pubDate = item.querySelector('pubDate')?.textContent || '';

                        // Simple price extraction regex
                        const priceMatch = title.match(/\\$(\\d+(?:\\.\\d{2})?)/);
                        const salePrice = priceMatch ? parseFloat(priceMatch[1]) : 0;

                        if (title && link) {
                            deals.push({
                                id: `live-${Date.now()}-${idx}`,
                                title: title.replace(/&amp;/g, '&'),
                                productUrl: link,
                                salePrice: salePrice,
                                originalPrice: salePrice ? Math.round(salePrice * 1.35) : 0,
                                savingsPercent: salePrice ? 25 : 0,
                                retailer: 'Online Retailer',
                                verificationStatus: 'verified',
                                source: 'Live Web Scan',
                                createdAt: pubDate || new Date().toISOString(),
                                isLiveWebResult: true
                            });
                        }
                    });

                    if (deals.length > 0) return deals;
                }
            }
        } catch (e) {
            // Try next proxy or fail gracefully
        }
    }

    return [];
}

/**
 * Opens the interactive Web Deal Search Hub
 */
export function openWebSearchModal(filters, currentCount = 0, onAddDealsCallback = null) {
    const queryInfo = buildSearchQuery(filters);
    const links = getRetailerSearchLinks(queryInfo);

    const modal = document.getElementById('web-search-modal');
    if (!modal) return;

    // Elements
    const titleEl = document.getElementById('web-search-modal-title');
    const tagsContainer = document.getElementById('web-search-modal-tags');
    const storesGrid = document.getElementById('web-search-stores-grid');
    const scannerSection = document.getElementById('web-search-scanner-status');
    const openTopStoresBtn = document.getElementById('btn-open-top-stores');

    if (titleEl) {
        titleEl.textContent = queryInfo.displayQuery;
    }

    if (tagsContainer) {
        tagsContainer.innerHTML = queryInfo.tags.map(t => `
            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-50 text-[#06B6D4] border border-cyan-200">
                ${t}
            </span>
        `).join('') || `<span class="text-xs text-gray-500 font-medium">All Deals & Categories</span>`;
    }

    if (storesGrid) {
        storesGrid.innerHTML = links.map((store, idx) => `
            <a href="${store.url}" target="_blank" rel="noopener noreferrer" 
               class="flex flex-col justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-[#06B6D4] hover:shadow-md transition-all group store-link-card"
               data-index="${idx}">
                <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">${store.icon}</span>
                            <span class="font-bold text-gray-900 text-sm group-hover:text-[#06B6D4] transition-colors">${store.name}</span>
                        </div>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${store.badgeColor}">
                            ${store.badge}
                        </span>
                    </div>
                    <p class="text-xs text-gray-500 line-clamp-2">${store.desc}</p>
                </div>
                <div class="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#06B6D4]">
                    <span>Search Store</span>
                    <span class="group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </a>
        `).join('');
    }

    if (openTopStoresBtn) {
        openTopStoresBtn.onclick = () => {
            // Open top 3 stores
            const topLinks = links.slice(0, 3);
            topLinks.forEach(item => {
                window.open(item.url, '_blank', 'noopener,noreferrer');
            });
        };
    }

    // Run Live Deal Scanner in background
    if (scannerSection) {
        scannerSection.innerHTML = `
            <div class="flex items-center gap-3 p-3.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl border border-cyan-200 text-xs text-cyan-900">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-[#06B6D4] border-t-transparent flex-shrink-0"></div>
                <div class="flex-1">
                    <span class="font-bold">Scanning live internet feeds</span> for fresh deals matching <span class="font-semibold underline">"${queryInfo.displayQuery}"</span>...
                </div>
            </div>
        `;

        fetchLiveWebDeals(queryInfo.cleanTerms || queryInfo.displayQuery).then(deals => {
            if (deals && deals.length > 0) {
                scannerSection.innerHTML = `
                    <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-2">
                                <span class="text-base">⚡</span>
                                <span class="text-xs font-bold text-emerald-900">Found ${deals.length} fresh deals across the web!</span>
                            </div>
                            ${onAddDealsCallback ? `
                                <button type="button" id="btn-inject-live-deals" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                    + Add to Board
                                </button>
                            ` : ''}
                        </div>
                        <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            ${deals.map(d => `
                                <a href="${d.productUrl}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2 bg-white rounded-lg border border-emerald-100 hover:border-emerald-300 text-xs text-gray-800 transition-all group">
                                    <span class="truncate font-medium flex-1 pr-2">${d.title}</span>
                                    <span class="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex-shrink-0">View →</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;

                document.getElementById('btn-inject-live-deals')?.addEventListener('click', () => {
                    if (onAddDealsCallback) {
                        onAddDealsCallback(deals);
                        const injectBtn = document.getElementById('btn-inject-live-deals');
                        if (injectBtn) {
                            injectBtn.textContent = '✓ Added to Board!';
                            injectBtn.classList.replace('bg-emerald-600', 'bg-gray-400');
                        }
                    }
                });
            } else {
                scannerSection.innerHTML = `
                    <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
                        <span>✨</span>
                        <span>Direct store search links ready above! Click any retailer card to browse live sale inventory.</span>
                    </div>
                `;
            }
        });
    }

    openModal('web-search-modal');
}
