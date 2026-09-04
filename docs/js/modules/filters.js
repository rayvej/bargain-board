let currentFilters = {
    category: null,
    search: '',
    verifiedOnly: false,
    sortBy: 'newest'
};

const listeners = [];

export function getFilters() {
    return { ...currentFilters };
}

export function updateFilter(key, value) {
    currentFilters[key] = value;
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
