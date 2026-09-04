import { getDeals as getFirestoreDeals, isDbInitialized } from './modules/firestore-client.js';
import { createDealCardHTML, setupDealCardListeners } from './modules/deal-card.js';
import { getFilters, subscribe, updateFilter, resetFilters } from './modules/filters.js';
import { setAvailableBrands } from './search.js';
import { openModal } from './modules/ui.js';
import { formatPrice, formatRelativeTime, showToast } from './modules/ui.js';

let allLoadedDeals = [];
let filteredDeals = [];
let displayedDeals = [];
let currentPage = 1;
const PAGE_SIZE = 16;
let isLoading = false;

// ─── Curated Fallback Deals ───
const CURATED_FALLBACK_DEALS = [
    {
        id: 'curated_1',
        title: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
        description: 'Two processors and 8 microphones for unprecedented noise cancellation. Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones.',
        brand: 'Sony',
        gender: 'all',
        sizes: [],
        originalPrice: 399.99, salePrice: 328.00, savingsPercent: 18,
        retailer: 'Amazon',
        productUrl: 'https://www.amazon.com/dp/B09XS7JWHH',
        sourceUrl: 'https://slickdeals.net/f/19968100-sony-wh-1000xm5-headphones',
        imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80',
        category: 'electronics', subcategory: 'headphones',
        tags: ['sony', 'headphones', 'wireless', 'noise-canceling'],
        verificationStatus: 'verified', verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        couponCodes: [{ code: 'SONY10', discount: '10% off checkout', verified: true, stackable: false }]
    },
    {
        id: 'curated_2',
        title: 'Apple MacBook Air 13-inch M2 Chip (8GB RAM, 256GB SSD) - Space Gray',
        description: 'Strikingly thin design with all-day battery life up to 18 hours. Big, beautiful Liquid Retina display with 500 nits of brightness.',
        brand: 'Apple',
        gender: 'all',
        sizes: [],
        originalPrice: 999.00, salePrice: 799.00, savingsPercent: 20,
        retailer: 'Amazon',
        productUrl: 'https://www.amazon.com/dp/B0B3C2R8MP',
        sourceUrl: 'https://slickdeals.net/f/19965200-apple-macbook-air-m2-laptop',
        imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80',
        category: 'electronics', subcategory: 'laptops',
        tags: ['apple', 'macbook', 'laptop', 'm2'],
        verificationStatus: 'verified', verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        couponCodes: []
    },
    {
        id: 'curated_3',
        title: 'Nike Air Zoom Pegasus 40 Men\'s Road Running Shoes',
        description: 'A springy ride for every run, the Peg\'s familiar, just-for-you feel returns to help you accomplish your goals. React technology with 2 Zoom Air units.',
        brand: 'Nike',
        gender: 'men',
        sizes: ['9', '9.5', '10', '10.5', '11'],
        originalPrice: 130.00, salePrice: 78.97, savingsPercent: 39,
        retailer: 'Nike',
        productUrl: 'https://www.nike.com/w/mens-sale-shoes-3yaepznik1zy7ok',
        sourceUrl: 'https://slickdeals.net/f/19964300-nike-pegasus-shoes-sale',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
        category: 'clothing', subcategory: 'shoes',
        tags: ['nike', 'shoes', 'running', 'pegasus', 'men'],
        verificationStatus: 'verified', verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        couponCodes: [{ code: 'EXTRA20', discount: 'Extra 20% off select styles', verified: true, stackable: false }]
    },
    {
        id: 'curated_4',
        title: 'Samsung 65" Class OLED 4K S90C Series Quantum HDR Smart TV',
        description: 'Deep blacks, clean whites and lively colors boosted by Quantum Dot technology. Neural Quantum Processor 4K with Dolby Atmos sound.',
        brand: 'Samsung',
        gender: 'all',
        sizes: [],
        originalPrice: 1997.99, salePrice: 1497.99, savingsPercent: 25,
        retailer: 'Samsung',
        productUrl: 'https://www.amazon.com/dp/B0BV4SGLDC',
        sourceUrl: 'https://slickdeals.net/f/19962100-samsung-65-oled-tv',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80',
        category: 'electronics', subcategory: 'tvs',
        tags: ['samsung', 'tv', 'oled', '4k'],
        verificationStatus: 'verified', verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        couponCodes: [{ code: 'SAMSUNG100', discount: '$100 off TVs over $1000', verified: true, stackable: false }]
    },
    {
        id: 'curated_5',
        title: 'Levi\'s Men\'s 511 Slim Fit Jeans (All Washes on Sale)',
        description: 'A modern slim with room to move. Cut close through the thigh with slim leg opening. Classic 5-pocket styling with stretch comfort.',
        brand: "Levi's",
        gender: 'men',
        sizes: ['30', '32', '34', '36'],
        originalPrice: 69.50, salePrice: 39.99, savingsPercent: 42,
        retailer: "Levi's",
        productUrl: 'https://www.levi.com/US/en_US/sale/mens-sale/c/levi_clothing_men_sale_us',
        sourceUrl: 'https://slickdeals.net/f/19961100-levis-jeans-clearance',
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
        category: 'clothing', subcategory: 'mens',
        tags: ['levis', 'jeans', 'mens', 'slim'],
        verificationStatus: 'verified', verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        couponCodes: [{ code: 'INDIGO40', discount: '40% off $125+', verified: true, stackable: false }]
    },
    {
        id: 'curated_6',
        title: 'Lululemon Align High-Rise Pant 25" (Select Colors on Markdown)',
        description: 'When feeling nothing is everything. The Align collection, powered by Nulu fabric, is so weightless and buttery soft, all you feel is your practice.',
        brand: 'Lululemon',
        gender: 'women',
        sizes: ['XS', 'S', 'M', 'L'],
        originalPrice: 98.00, salePrice: 69.00, savingsPercent: 30,
        retailer: 'Lululemon',
        productUrl: 'https://shop.lululemon.com/c/we-made-too-much/_/N-883',
        sourceUrl: 'https://slickdeals.net/f/19961200-lululemon-align-leggings',
        imageUrl: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=400&q=80',
        category: 'clothing', subcategory: 'womens',
        tags: ['lululemon', 'align', 'leggings', 'women', 'yoga'],
        verificationStatus: 'verified', verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        couponCodes: []
    }
];

export async function initDeals(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    setupDealCardListeners(container);

    // Card click opens modal (unless button clicked)
    container.addEventListener('click', (e) => {
        if (e.target.closest('.btn-deal') || e.target.closest('.copy-coupon-btn')) {
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
            const sizeSelect = document.getElementById('size-select');
            if (sizeSelect) sizeSelect.value = '';
            const priceSelect = document.getElementById('price-range-select');
            if (priceSelect) priceSelect.value = '';
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect) sortSelect.value = 'newest';
            const verifiedToggle = document.getElementById('verified-toggle');
            if (verifiedToggle) verifiedToggle.checked = false;
            updateGenderButtons(null);
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
        // Priority 1: Check Firestore if initialized
        if (isDbInitialized()) {
            try {
                const result = await getFirestoreDeals({}, null, 200);
                if (result.deals && result.deals.length > 0) {
                    allLoadedDeals = result.deals;
                    setupAvailableBrands(allLoadedDeals);
                    applyFiltersAndRender(container, getFilters());
                    isLoading = false;
                    return;
                }
            } catch (fsErr) {
                console.warn('Firestore fetch failed, checking local deals-data.json:', fsErr);
            }
        }

        // Priority 2: Fetch deals-data.json
        const res = await fetch('./deals-data.json');
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                allLoadedDeals = data;
                console.log(`Loaded ${data.length} deals from deals-data.json`);
                setupAvailableBrands(allLoadedDeals);
                applyFiltersAndRender(container, getFilters());
                isLoading = false;
                return;
            }
        }
    } catch (e) {
        console.warn('Could not load deals-data.json, falling back to curated list:', e);
    }

    // Priority 3: Fallback
    allLoadedDeals = CURATED_FALLBACK_DEALS;
    setupAvailableBrands(allLoadedDeals);
    applyFiltersAndRender(container, getFilters());
    isLoading = false;
}

function setupAvailableBrands(deals) {
    const brandCounts = {};
    deals.forEach(d => {
        const b = d.brand || d.retailer;
        if (b && b !== 'Online Store' && b !== 'Various') {
            brandCounts[b] = (brandCounts[b] || 0) + 1;
        }
    });

    const sortedBrands = Object.entries(brandCounts)
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    // Send to search auto-complete
    setAvailableBrands(sortedBrands);

    // Populate Brand select dropdown
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
}

function applyFiltersAndRender(container, filters) {
    currentPage = 1;
    filteredDeals = filterDeals(allLoadedDeals, filters);

    // Update total count
    const totalCountEl = document.getElementById('total-deal-count');
    if (totalCountEl) totalCountEl.textContent = filteredDeals.length;

    container.innerHTML = '';
    displayedDeals = [];

    if (filteredDeals.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                    🔍
                </div>
                <h3 class="text-lg font-bold text-gray-800">No deals found matching criteria</h3>
                <p class="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Try clearing one of your filters (brand, gender, size, or price) to view more available deals.</p>
                <button type="button" id="reset-filters-empty-btn" class="mt-4 px-4 py-2 bg-[#06B6D4] text-white text-xs font-bold rounded-lg hover:bg-cyan-600 transition-colors shadow-sm">
                    Reset All Filters
                </button>
            </div>
        `;
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
        cardEl.style.animationDelay = `${(idx % PAGE_SIZE) * 25}ms`;
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

        // 1. Brand Filter
        if (filters.brand) {
            const b = filters.brand.toLowerCase();
            const brandMatch = brandText === b || 
                               fullSearchable.includes(b) ||
                               retailerText.includes(b);
            if (!brandMatch) return false;
        }

        // 2. Search Query (searches brand, title, description, retailer)
        if (filters.search) {
            const q = filters.search.toLowerCase().trim();
            if (!fullSearchable.includes(q)) return false;
        }

        // 3. Gender Filter ('men' | 'women' | 'kids' | 'unisex')
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

        // 4. Size Filter (e.g. '10', '9.5', 'M', 'L', 'XL', '32')
        if (filters.size) {
            const s = filters.size.toLowerCase();
            const dealSizes = (deal.sizes || []).map(x => String(x).toLowerCase());
            
            const hasSize = dealSizes.includes(s) || 
                            dealSizes.includes('all') ||
                            new RegExp(`\\b(?:size|sz|waist)?\\s*${s}\\b`, 'i').test(titleText) ||
                            new RegExp(`\\b(?:size|sz|waist)?\\s*${s}\\b`, 'i').test(descText);
            if (!hasSize) return false;
        }

        // 5. Price Range Filter
        if (filters.priceRange) {
            const price = deal.salePrice || 0;
            if (filters.priceRange === 'under25' && price >= 25) return false;
            if (filters.priceRange === '25to50' && (price < 25 || price > 50)) return false;
            if (filters.priceRange === '50to100' && (price < 50 || price > 100)) return false;
            if (filters.priceRange === '100to250' && (price < 100 || price > 250)) return false;
            if (filters.priceRange === '250plus' && price < 250) return false;
        }

        // 6. Category Filter
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

        // 7. Verified Only
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

    // Individual chip remove listeners
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
                        <div class="flex items-center gap-2.5 mb-2 flex-wrap">
                            <span class="text-xs font-bold uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700">${deal.brand || deal.retailer || 'Retailer'}</span>
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
                            <span>Sourced via ${deal.source || 'Verified Feed'}</span>
                            <span>${formatRelativeTime(deal.createdAt || new Date())}</span>
                        </div>
                    </div>
                </div>
            </div>

            ${(deal.couponCodes || []).length > 0 ? `
                <div class="mt-6 pt-5 border-t border-gray-100">
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
