import { getDeals as getFirestoreDeals, isDbInitialized } from './modules/firestore-client.js';
import { createDealCardHTML, setupDealCardListeners, getComparisonLinks } from './modules/deal-card.js';
import { getFilters, subscribe, updateFilter, resetFilters } from './modules/filters.js';
import { setAvailableBrands } from './search.js';
import { openModal } from './modules/ui.js';
import { formatPrice, formatRelativeTime, showToast } from './modules/ui.js';
import { buildSearchQuery, openWebSearchModal, getCanadianClearancePortals } from './modules/web-search.js';
import { searchCanadianDeals } from './modules/deal-crawler.js';

let allLoadedDeals = [];
let filteredDeals = [];
let displayedDeals = [];
let currentPage = 1;
const PAGE_SIZE = 16;
let isLoading = false;

export async function initDeals(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    setupDealCardListeners(container);

    // Card click opens modal (unless button clicked)
    container.addEventListener('click', (e) => {
        if (e.target.closest('.btn-deal') || e.target.closest('.copy-coupon-btn') || e.target.closest('.btn-compare')) {
            return;
        }
        const modalTrigger = e.target.closest('.open-deal-modal') || e.target.closest('.deal-card');
        if (modalTrigger) {
            const card = e.target.closest('.deal-card');
            if (card) {
                const dealId = card.getAttribute('data-id');
                const deal = allLoadedDeals.find(d => d.id === dealId);
                if (deal) showDealModal(deal);
            }
        }
    });

    // Modal "Go to Deal" button
    const modalDealLink = document.getElementById('deal-modal-link');
    if (modalDealLink) {
        modalDealLink.addEventListener('click', (e) => {
            const href = modalDealLink.getAttribute('href');
            if (href && href !== '#') {
                window.open(href, '_blank', 'noopener,noreferrer');
            }
        });
    }

    // Load More button
    const loadMoreBtn = document.getElementById('btn-load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            renderNextPage(container);
        });
    }

    // Clear all filters button
    const clearAllBtn = document.getElementById('clear-all-filters-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            resetFilters();
            // Reset UI inputs
            const searchInput = document.getElementById('main-search');
            if (searchInput) searchInput.value = '';
            const brandSelect = document.getElementById('brand-select');
            if (brandSelect) brandSelect.value = '';
            const retailerSelect = document.getElementById('retailer-select');
            if (retailerSelect) retailerSelect.value = '';
            const sizeSelect = document.getElementById('size-select');
            if (sizeSelect) sizeSelect.value = '';
            const priceSelect = document.getElementById('price-range-select');
            if (priceSelect) priceSelect.value = '';
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect) sortSelect.value = 'newest';
            const verifiedToggle = document.getElementById('verified-toggle');
            if (verifiedToggle) verifiedToggle.checked = false;
            const amazonToggle = document.getElementById('exclude-amazon-toggle');
            if (amazonToggle) amazonToggle.checked = false;
            updateGenderButtons(null);
        });
    }

    // ─── Search The Web Button Listener (In-Page Canadian Deal Discovery) ───
    const searchWebBtn = document.getElementById('btn-search-the-web');
    if (searchWebBtn) {
        searchWebBtn.addEventListener('click', () => {
            triggerInPageInternetSearch(container);
        });
    }

    // Subscribe to filter changes
    subscribe((filters) => {
        applyFiltersAndRender(container, filters);
        renderActiveFilterChips(filters);
    });

    // Fetch and initialize deals
    await fetchAllDeals(container);
}

async function fetchAllDeals(container) {
    isLoading = true;
    container.innerHTML = createSkeletons(8);

    try {
        if (isDbInitialized()) {
            try {
                const result = await getFirestoreDeals({}, null, 250);
                if (result.deals && result.deals.length > 0) {
                    allLoadedDeals = result.deals;
                    setupAvailableFilters(allLoadedDeals);
                    applyFiltersAndRender(container, getFilters());
                    isLoading = false;
                    return;
                }
            } catch (fsErr) {
                console.warn('Firestore fetch failed, checking local deals-data.json:', fsErr);
            }
        }

        const res = await fetch('./deals-data.json');
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                allLoadedDeals = data;
                console.log(`Loaded ${data.length} deals from deals-data.json`);
                setupAvailableFilters(allLoadedDeals);
                applyFiltersAndRender(container, getFilters());
                isLoading = false;
                return;
            }
        }
    } catch (e) {
        console.warn('Could not load deals-data.json:', e);
    }

    isLoading = false;
}

function setupAvailableFilters(deals) {
    // 1. Setup Brands
    const brandCounts = {};
    const retailerCounts = {};

    deals.forEach(d => {
        const b = d.brand;
        if (b && b !== 'Online Store' && b !== 'Various') {
            brandCounts[b] = (brandCounts[b] || 0) + 1;
        }

        const r = d.retailer;
        if (r && r !== 'Online Store') {
            retailerCounts[r] = (retailerCounts[r] || 0) + 1;
        }
    });

    const sortedBrands = Object.entries(brandCounts)
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    setAvailableBrands(sortedBrands);

    const brandSelect = document.getElementById('brand-select');
    if (brandSelect) {
        const currentVal = brandSelect.value;
        brandSelect.innerHTML = '<option value="">All Brands</option>';
        sortedBrands.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.name;
            opt.textContent = `${b.name} (${b.count})`;
            brandSelect.appendChild(opt);
        });
        if (currentVal) brandSelect.value = currentVal;
    }

    // 2. Setup Retailers / Stores
    const sortedRetailers = Object.entries(retailerCounts)
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    const retailerSelect = document.getElementById('retailer-select');
    if (retailerSelect) {
        const currentVal = retailerSelect.value;
        retailerSelect.innerHTML = '<option value="">All Stores</option>';
        sortedRetailers.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.name;
            opt.textContent = `${r.name} (${r.count})`;
            retailerSelect.appendChild(opt);
        });
        if (currentVal) retailerSelect.value = currentVal;
    }
}

async function triggerInPageInternetSearch(container) {
    const filters = getFilters();
    const queryInfo = buildSearchQuery(filters);

    // Show active Canadian scanning state in deal grid
    container.innerHTML = `
        <div class="col-span-full py-16 text-center">
            <div class="relative w-16 h-16 mx-auto mb-4">
                <div class="animate-spin rounded-full h-16 w-16 border-4 border-[#06B6D4] border-t-transparent"></div>
                <div class="absolute inset-0 flex items-center justify-center text-2xl">🇨🇦</div>
            </div>
            <h3 class="text-xl font-bold text-gray-900">Scanning Canadian Retailers for Deals...</h3>
            <p class="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Searching Sport Chek, Foot Locker Canada, Nike Canada, Hudson's Bay, The Shoe Company & Best Buy Canada for deals matching <span class="font-bold text-[#06B6D4]">"${queryInfo.displayQuery}"</span>...
            </p>
            <div class="flex items-center justify-center gap-2 mt-4 flex-wrap text-[11px] font-semibold text-gray-600">
                <span class="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-md">🇨🇦 All Prices in CAD</span>
                <span class="bg-gray-100 px-2.5 py-1 rounded-md">📦 Ships to Canada</span>
                <span class="bg-cyan-50 text-cyan-800 border border-cyan-200 px-2.5 py-1 rounded-md">⚡ Verified Clearance</span>
            </div>
        </div>
    `;

    try {
        const foundDeals = await searchCanadianDeals(filters);
        if (foundDeals && foundDeals.length > 0) {
            const existingUrls = new Set(allLoadedDeals.map(d => d.productUrl));
            let addedCount = 0;
            foundDeals.forEach(d => {
                if (!existingUrls.has(d.productUrl)) {
                    existingUrls.add(d.productUrl);
                    allLoadedDeals.unshift(d);
                    addedCount++;
                }
            });

            // Update stores dropdown with newly discovered Canadian retailers
            setupAvailableFilters(allLoadedDeals);

            // Re-render directly onto the current page!
            applyFiltersAndRender(container, filters);

            showToast(`🇨🇦 Found ${addedCount} verified live deals from RedFlagDeals & Canadian feeds!`, 'success');
        } else {
            showToast('Live Canadian feeds verified: No additional active clearance posts found right now. Showing all verified catalog deals.', 'info');
            applyFiltersAndRender(container, filters);
        }
    } catch (e) {
        console.error('Error scanning Canadian deals:', e);
        applyFiltersAndRender(container, filters);
    }
}

function renderClearancePortals(filters, queryInfo) {
    const listEl = document.getElementById('clearance-portals-list');
    if (!listEl) return;

    const portals = getCanadianClearancePortals(queryInfo);
    listEl.innerHTML = portals.map(p => `
        <a href="${p.url}" target="_blank" rel="noopener noreferrer" 
           class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#06B6D4] hover:bg-cyan-50 text-xs font-semibold text-gray-700 hover:text-[#06B6D4] transition-all bg-gray-50 shadow-2xs hover:shadow-xs group"
           title="Direct live search on ${p.name}">
            <span>${p.icon}</span>
            <span>${p.name}</span>
            <svg class="w-3 h-3 text-gray-400 group-hover:text-[#06B6D4] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>
    `).join('');
}

function applyFiltersAndRender(container, filters) {
    currentPage = 1;
    filteredDeals = filterDeals(allLoadedDeals, filters);

    // Update total count
    const totalCountEl = document.getElementById('total-deal-count');
    if (totalCountEl) totalCountEl.textContent = filteredDeals.length;

    // ─── Update Live Internet Deal Search Banner ───
    const queryInfo = buildSearchQuery(filters);
    const badgeEl = document.getElementById('web-search-query-badge');
    if (badgeEl) {
        if (queryInfo.tags.length > 0) {
            badgeEl.textContent = queryInfo.tags.join(' • ');
            badgeEl.classList.remove('hidden');
        } else {
            badgeEl.textContent = 'All Categories & Deals (CAD)';
        }
    }

    const subtextEl = document.getElementById('web-search-banner-subtext');
    if (subtextEl) {
        subtextEl.textContent = `Showing ${filteredDeals.length} deals in current catalog. Click to search Sport Chek, Foot Locker CA, Nike Canada, Hudson's Bay & Best Buy CA for these exact filters.`;
    }

    // Update Direct Canadian Store Clearance Portals
    renderClearancePortals(filters, queryInfo);

    container.innerHTML = '';
    displayedDeals = [];

    if (filteredDeals.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-16 text-center">
                <div class="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4 text-3xl">
                    🇨🇦
                </div>
                <h3 class="text-xl font-bold text-gray-900">No local deals found for: "${queryInfo.displayQuery}"</h3>
                <p class="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                    We didn't find this item in the initial catalog, but Canadian stores (Sport Chek, Foot Locker CA, Nike Canada, Hudson's Bay) have active clearance sales! Tap below to search Canadian retailers.
                </p>
                <div class="flex items-center justify-center gap-3 mt-6 flex-wrap">
                    <button type="button" id="search-web-empty-btn" class="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-cyan-500 hover:from-cyan-400 hover:to-cyan-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg flex items-center gap-2">
                        <span>⚡ Search Canadian Stores for "${queryInfo.displayQuery}"</span>
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                    <button type="button" id="reset-filters-empty-btn" class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors">
                        Reset Filters
                    </button>
                </div>
            </div>
        `;
        document.getElementById('search-web-empty-btn')?.addEventListener('click', () => {
            triggerInPageInternetSearch(container);
        });
        document.getElementById('reset-filters-empty-btn')?.addEventListener('click', () => {
            document.getElementById('clear-all-filters-btn')?.click();
        });
        toggleLoadMore(false);
        return;
    }

    renderNextPage(container);
}

function renderNextPage(container) {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const nextChunk = filteredDeals.slice(startIndex, endIndex);

    nextChunk.forEach((deal, idx) => {
        const cardHtml = createDealCardHTML(deal);
        const temp = document.createElement('div');
        temp.innerHTML = cardHtml.trim();
        const cardEl = temp.firstElementChild;
        cardEl.style.animationDelay = `${(idx % PAGE_SIZE) * 20}ms`;
        container.appendChild(cardEl);
        displayedDeals.push(deal);
    });

    currentPage++;
    const hasMore = endIndex < filteredDeals.length;
    toggleLoadMore(hasMore);
}

function toggleLoadMore(show) {
    const loadMoreContainer = document.getElementById('load-more-container');
    if (loadMoreContainer) {
        loadMoreContainer.classList.toggle('hidden', !show);
    }
}

function filterDeals(deals, filters) {
    let result = deals.filter(deal => {
        const titleText = (deal.title || '').toLowerCase();
        const descText = (deal.description || '').toLowerCase();
        const brandText = (deal.brand || '').toLowerCase();
        const retailerText = (deal.retailer || '').toLowerCase();
        const fullSearchable = `${titleText} ${descText} ${brandText} ${retailerText} ${(deal.tags || []).join(' ')}`.toLowerCase();

        // 1. Exclude Amazon Filter
        if (filters.excludeAmazon && retailerText.includes('amazon')) {
            return false;
        }

        // 2. Retailer Filter
        if (filters.retailer) {
            const r = filters.retailer.toLowerCase();
            if (!retailerText.includes(r)) return false;
        }

        // 3. Brand Filter
        if (filters.brand) {
            const b = filters.brand.toLowerCase();
            const brandMatch = brandText === b || 
                               fullSearchable.includes(b) ||
                               retailerText.includes(b);
            if (!brandMatch) return false;
        }

        // 4. Search Query (searches across brand, title, description, retailer, keywords)
        if (filters.search) {
            const q = filters.search.toLowerCase().trim();
            if (!fullSearchable.includes(q)) return false;
        }

        // 5. Gender Filter ('men' | 'women' | 'kids' | 'unisex')
        if (filters.gender && filters.gender !== 'all') {
            const g = filters.gender.toLowerCase();
            const dealGender = (deal.gender || '').toLowerCase();

            if (g === 'men') {
                const matchMen = dealGender === 'men' || dealGender === 'unisex' || 
                                 /\b(men|mens|men's|male)\b/i.test(titleText);
                if (!matchMen) return false;
            } else if (g === 'women') {
                const matchWomen = dealGender === 'women' || dealGender === 'unisex' || 
                                   /\b(women|womens|women's|ladies|female|dress|skirt)\b/i.test(titleText);
                if (!matchWomen) return false;
            } else if (g === 'kids') {
                const matchKids = dealGender === 'kids' || 
                                  /\b(kids|boys|girls|youth|toddler)\b/i.test(titleText);
                if (!matchKids) return false;
            }
        }

        // 6. Size Filter (e.g. '10', '9.5', 'M', 'L', 'XL', '32')
        if (filters.size) {
            const s = filters.size.toLowerCase();
            const dealSizes = (deal.sizes || []).map(x => String(x).toLowerCase());
            
            const hasSize = dealSizes.includes(s) || 
                            dealSizes.includes('all') ||
                            new RegExp(`\\b(?:size|sz|waist)?\\s*${s}\\b`, 'i').test(titleText) ||
                            new RegExp(`\\b(?:size|sz|waist)?\\s*${s}\\b`, 'i').test(descText);
            if (!hasSize) return false;
        }

        // 7. Price Range Filter
        if (filters.priceRange) {
            const price = deal.salePrice || 0;
            if (filters.priceRange === 'under25' && price >= 25) return false;
            if (filters.priceRange === '25to50' && (price < 25 || price > 50)) return false;
            if (filters.priceRange === '50to100' && (price < 50 || price > 100)) return false;
            if (filters.priceRange === '100to250' && (price < 100 || price > 250)) return false;
            if (filters.priceRange === '250plus' && price < 250) return false;
        }

        // 8. Category Filter
        if (filters.category) {
            const cat = filters.category.toLowerCase();
            const dealCat = (deal.category || '').toLowerCase();
            const dealSubcat = (deal.subcategory || '').toLowerCase();

            if (cat === 'clothing') {
                const isClothing = dealCat === 'clothing' || 
                    ['shoes', 'mens', 'womens', 'accessories', 'activewear'].includes(dealSubcat);
                if (!isClothing) return false;
            } else if (cat === 'electronics') {
                const isElec = dealCat === 'electronics' || 
                    ['laptops', 'phones', 'headphones', 'tvs', 'gaming', 'smarthome', 'cameras'].includes(dealSubcat);
                if (!isElec) return false;
            } else {
                const matchSubcat = dealSubcat === cat;
                const matchTitle = fullSearchable.includes(cat) || 
                    (cat === 'shoes' && (fullSearchable.includes('shoe') || fullSearchable.includes('sneaker') || fullSearchable.includes('boot'))) ||
                    (cat === 'laptops' && (fullSearchable.includes('laptop') || fullSearchable.includes('macbook') || fullSearchable.includes('chromebook'))) ||
                    (cat === 'headphones' && (fullSearchable.includes('headphone') || fullSearchable.includes('earbud') || fullSearchable.includes('audio'))) ||
                    (cat === 'mens' && fullSearchable.includes('men')) ||
                    (cat === 'womens' && fullSearchable.includes('women')) ||
                    (cat === 'gaming' && (fullSearchable.includes('game') || fullSearchable.includes('gaming') || fullSearchable.includes('ps5') || fullSearchable.includes('xbox') || fullSearchable.includes('nintendo'))) ||
                    (cat === 'tvs' && (fullSearchable.includes('tv') || fullSearchable.includes('oled') || fullSearchable.includes('television')));
                
                if (!matchSubcat && !matchTitle) return false;
            }
        }

        // 9. Verified Only
        if (filters.verifiedOnly && deal.verificationStatus !== 'verified') {
            return false;
        }

        return true;
    });

    // ─── Sorting (Lowest to Highest Price, etc.) ───
    if (filters.sortBy === 'price_asc') {
        result.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
    } else if (filters.sortBy === 'price_desc') {
        result.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0));
    } else if (filters.sortBy === 'discount_desc') {
        result.sort((a, b) => (b.savingsPercent || 0) - (a.savingsPercent || 0));
    } else {
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
}

function renderActiveFilterChips(filters) {
    const container = document.getElementById('active-filters');
    const clearAllBtn = document.getElementById('clear-all-filters-btn');
    if (!container) return;

    const chips = [];

    if (filters.search) {
        chips.push(`
            <span class="inline-flex items-center gap-1 bg-cyan-50 text-[#06B6D4] px-2.5 py-1 rounded-full text-xs font-semibold border border-cyan-200">
                Search: "${filters.search}"
                <button type="button" data-clear="search" class="hover:text-red-500 ml-1 font-bold">✕</button>
            </span>
        `);
    }

    if (filters.brand) {
        chips.push(`
            <span class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-200">
                Brand: ${filters.brand}
                <button type="button" data-clear="brand" class="hover:text-red-500 ml-1 font-bold">✕</button>
            </span>
        `);
    }

    if (filters.retailer) {
        chips.push(`
            <span class="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-teal-200">
                Store: ${filters.retailer}
                <button type="button" data-clear="retailer" class="hover:text-red-500 ml-1 font-bold">✕</button>
            </span>
        `);
    }

    if (filters.excludeAmazon) {
        chips.push(`
            <span class="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200">
                🚫 Excluded Amazon
                <button type="button" data-clear="excludeAmazon" class="hover:text-red-500 ml-1 font-bold">✕</button>
            </span>
        `);
    }

    if (filters.gender && filters.gender !== 'all') {
        const genderLabel = filters.gender === 'men' ? "Men's" : filters.gender === 'women' ? "Women's" : "Kids/Unisex";
        chips.push(`
            <span class="inline-flex items-center gap-1 bg-pink-50 text-pink-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-pink-200">
                Gender: ${genderLabel}
                <button type="button" data-clear="gender" class="hover:text-red-500 ml-1 font-bold">✕</button>
            </span>
        `);
    }

    if (filters.size) {
        chips.push(`
            <span class="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-200">
                Size: ${filters.size}
                <button type="button" data-clear="size" class="hover:text-red-500 ml-1 font-bold">✕</button>
            </span>
        `);
    }

    if (filters.priceRange) {
        const priceLabels = {
            under25: 'Under $25',
            '25to50': '$25 – $50',
            '50to100': '$50 – $100',
            '100to250': '$100 – $250',
            '250plus': '$250+'
        };
        chips.push(`
            <span class="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">
                Price: ${priceLabels[filters.priceRange] || filters.priceRange}
                <button type="button" data-clear="priceRange" class="hover:text-red-500 ml-1 font-bold">✕</button>
            </span>
        `);
    }

    if (filters.sortBy === 'price_asc') {
        chips.push(`
            <span class="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-purple-200">
                Price: Low to High
                <button type="button" data-clear="sortBy" class="hover:text-red-500 ml-1 font-bold">✕</button>
            </span>
        `);
    }

    if (filters.category) {
        chips.push(`
            <span class="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                Category: ${filters.category}
                <button type="button" data-clear="category" class="hover:text-red-500 ml-1 font-bold">✕</button>
            </span>
        `);
    }

    container.innerHTML = chips.join('');
    if (clearAllBtn) {
        clearAllBtn.classList.toggle('hidden', chips.length === 0);
    }

    container.querySelectorAll('button[data-clear]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = btn.getAttribute('data-clear');
            if (key === 'search') {
                updateFilter('search', '');
                const input = document.getElementById('main-search');
                if (input) input.value = '';
                document.getElementById('clear-search-btn')?.classList.add('hidden');
            } else if (key === 'brand') {
                updateFilter('brand', null);
                const brandSelect = document.getElementById('brand-select');
                if (brandSelect) brandSelect.value = '';
            } else if (key === 'retailer') {
                updateFilter('retailer', null);
                const retailerSelect = document.getElementById('retailer-select');
                if (retailerSelect) retailerSelect.value = '';
            } else if (key === 'excludeAmazon') {
                updateFilter('excludeAmazon', false);
                const toggle = document.getElementById('exclude-amazon-toggle');
                if (toggle) toggle.checked = false;
            } else if (key === 'gender') {
                updateFilter('gender', null);
                updateGenderButtons(null);
            } else if (key === 'size') {
                updateFilter('size', null);
                const sizeSelect = document.getElementById('size-select');
                if (sizeSelect) sizeSelect.value = '';
            } else if (key === 'priceRange') {
                updateFilter('priceRange', null);
                const priceSelect = document.getElementById('price-range-select');
                if (priceSelect) priceSelect.value = '';
            } else if (key === 'sortBy') {
                updateFilter('sortBy', 'newest');
                const sortSelect = document.getElementById('sort-select');
                if (sortSelect) sortSelect.value = 'newest';
            } else if (key === 'category') {
                updateFilter('category', null);
            }
        });
    });
}

function updateGenderButtons(activeGender) {
    document.querySelectorAll('#gender-filter-group .gender-btn').forEach(btn => {
        const g = btn.getAttribute('data-gender');
        const isActive = (g === 'all' && !activeGender) || g === activeGender;
        btn.classList.toggle('bg-white', isActive);
        btn.classList.toggle('text-gray-900', isActive);
        btn.classList.toggle('shadow-sm', isActive);
    });
}

function showDealModal(deal) {
    const title = document.getElementById('deal-modal-title');
    const body = document.getElementById('deal-modal-body');
    const link = document.getElementById('deal-modal-link');

    if (title) title.textContent = deal.title;
    
    const targetUrl = deal.productUrl || deal.sourceUrl || '#';
    if (link) {
        link.href = targetUrl;
        link.setAttribute('data-target', targetUrl);
    }

    const comp = getComparisonLinks(deal);
    const isFashion = deal.category === 'clothing' || deal.subcategory === 'shoes';

    if (body) {
        const couponsHtml = (deal.couponCodes || []).map(c => `
            <div class="flex items-center justify-between p-3.5 bg-cyan-50/60 rounded-xl border border-dashed border-cyan-300">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm">🏷️</span>
                        <span class="font-mono font-bold text-base text-cyan-950">${c.code}</span>
                        <span class="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">${c.discount || 'Discount code'}</p>
                    ${c.restrictions ? `<p class="text-xs text-amber-700 mt-0.5">⚠️ ${c.restrictions}</p>` : ''}
                </div>
                <button type="button" class="copy-coupon-btn px-4 py-1.5 text-xs font-bold text-white bg-[#06B6D4] hover:bg-cyan-600 rounded-lg transition-colors shadow-sm" data-code="${c.code}">
                    Copy Code
                </button>
            </div>
        `).join('');

        const verifiedBadgeHtml = deal.verificationStatus === 'verified'
            ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                 <svg class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                 Verified Active Deal
               </span>`
            : `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Community Deal</span>`;

        body.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6">
                <div class="w-full md:w-56 flex-shrink-0">
                    <img src="${deal.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'}" 
                         alt="${deal.title}" 
                         class="w-full h-56 object-cover rounded-xl border border-gray-100 shadow-sm"
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80'">
                </div>
                <div class="flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
                            <span class="text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-md">🏪 Sold at ${deal.retailer || 'Retailer'}</span>
                            ${deal.brand && deal.brand !== deal.retailer ? `<span class="text-xs font-bold uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-md text-gray-700">Brand: ${deal.brand}</span>` : ''}
                            ${deal.gender && deal.gender !== 'all' ? `<span class="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">${deal.gender === 'men' ? "Men's" : deal.gender === 'women' ? "Women's" : "Kids"}</span>` : ''}
                            ${verifiedBadgeHtml}
                        </div>
                        <p class="text-sm text-gray-600 leading-relaxed mb-3">${deal.description || 'Visit the deal page to view complete product specifications and terms.'}</p>
                        ${(deal.sizes && deal.sizes.length > 0 && !deal.sizes.includes('All')) ? `
                            <p class="text-xs text-gray-500 mb-3"><strong class="text-gray-700">Available Sizes:</strong> ${deal.sizes.join(', ')}</p>
                        ` : ''}
                    </div>

                    <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div class="flex items-baseline gap-3">
                            <span class="text-3xl font-extrabold text-gray-900">${formatPrice(deal.salePrice)}</span>
                            ${deal.originalPrice > deal.salePrice ? `<span class="text-base text-gray-400 line-through">${formatPrice(deal.originalPrice)}</span>` : ''}
                            ${deal.savingsPercent ? `<span class="px-2.5 py-0.5 text-xs font-extrabold text-white bg-green-600 rounded-full">${deal.savingsPercent}% SAVINGS</span>` : ''}
                        </div>
                        <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/60 text-xs text-gray-500">
                            <span>Listed at ${deal.retailer || 'Online Store'}</span>
                            <span>${formatRelativeTime(deal.createdAt || new Date())}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ═══════ Cross-Store Price Comparison Section ═══════ -->
            <div class="mt-6 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-cyan-50/40 border border-cyan-100">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🔍 Compare Canadian Prices & Other Stores</span>
                    </h4>
                    <span class="text-[11px] text-cyan-700 font-medium">Find lowest CAD price</span>
                </div>
                <p class="text-xs text-gray-500 mb-3">Check other stores in Canada or shipping to Canada for clearance discounts or promo codes:</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a href="${comp.googleShopping}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 hover:border-[#06B6D4] hover:shadow-sm transition-all text-xs font-semibold text-gray-800 group">
                        <span class="flex items-center gap-2">
                            <span>🇨🇦</span>
                            <span>Google Shopping (Canada)</span>
                        </span>
                        <span class="text-[#06B6D4] group-hover:translate-x-0.5 transition-transform">↗</span>
                    </a>
                    ${isFashion ? `
                        <a href="${comp.fashionSearch}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 hover:border-[#06B6D4] hover:shadow-sm transition-all text-xs font-semibold text-gray-800 group">
                            <span class="flex items-center gap-2">
                                <span>👟</span>
                                <span>Sport Chek / Foot Locker CA / The Bay</span>
                            </span>
                            <span class="text-[#06B6D4] group-hover:translate-x-0.5 transition-transform">↗</span>
                        </a>
                    ` : `
                        <a href="${comp.techSearch}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 hover:border-[#06B6D4] hover:shadow-sm transition-all text-xs font-semibold text-gray-800 group">
                            <span class="flex items-center gap-2">
                                <span>⚡</span>
                                <span>Best Buy CA / Canada Computers / Apple</span>
                            </span>
                            <span class="text-[#06B6D4] group-hover:translate-x-0.5 transition-transform">↗</span>
                        </a>
                    `}
                </div>
            </div>

            ${(deal.couponCodes || []).length > 0 ? `
                <div class="mt-5 pt-4 border-t border-gray-100">
                    <h4 class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                        <span>🏷️ Promo Codes</span>
                        <span class="text-xs font-normal text-gray-500">(Click to copy before checking out)</span>
                    </h4>
                    <div class="space-y-2.5">${couponsHtml}</div>
                </div>
            ` : ''}

            ${deal.sourceUrl && deal.sourceUrl !== targetUrl ? `
                <div class="mt-4 text-center">
                    <a href="${deal.sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-cyan-600 hover:text-cyan-800 font-medium hover:underline inline-flex items-center gap-1">
                        View Community Discussion & Comments on ${deal.source || 'Slickdeals'} ↗
                    </a>
                </div>
            ` : ''}
        `;
    }

    openModal('deal-modal');
}

function createSkeletons(count) {
    return Array.from({ length: count }, () => `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="h-44 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse"></div>
            <div class="p-4 space-y-3">
                <div class="h-3 bg-gray-100 rounded-full w-1/3 animate-pulse"></div>
                <div class="h-4 bg-gray-100 rounded-full w-full animate-pulse"></div>
                <div class="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse"></div>
                <div class="h-8 bg-gray-100 rounded-lg w-1/2 animate-pulse mt-4"></div>
                <div class="h-9 bg-gray-100 rounded-lg w-full animate-pulse"></div>
            </div>
        </div>
    `).join('');
}
