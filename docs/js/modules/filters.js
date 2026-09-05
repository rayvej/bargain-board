let currentFilters = {
    category: null,
    search: '',
    brand: null,
    retailer: null,
    excludeAmazon: false,
    gender: null,     // 'all' | 'men' | 'women' | 'kids' | 'unisex'
    size: null,       // e.g. '10', 'M', 'L', 'XL'
    priceRange: null, // 'under25' | '25to50' | '50to100' | '100to250' | '250plus'
    minPrice: null,
    maxPrice: null,
    verifiedOnly: false,
    hasCoupon: false,
    sortBy: 'newest'  // 'newest' | 'price_asc' | 'price_desc' | 'discount_desc'
};

const listeners = [];

export function getFilters() {
    return { ...currentFilters };
}

export function updateFilter(key, value) {
    currentFilters[key] = value;
    notifyListeners();
}

export function updateFilters(newFilters) {
    currentFilters = { ...currentFilters, ...newFilters };
    notifyListeners();
}

export function resetFilters() {
    currentFilters = {
        category: null,
        search: '',
        brand: null,
        retailer: null,
        excludeAmazon: false,
        gender: null,
        size: null,
        priceRange: null,
        minPrice: null,
        maxPrice: null,
        verifiedOnly: false,
        hasCoupon: false,
        sortBy: 'newest'
    };
    notifyListeners();
}

export function subscribe(callback) {
    listeners.push(callback);
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
    };
}

function notifyListeners() {
    listeners.forEach(cb => cb(currentFilters));
}
