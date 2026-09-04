import { updateFilter, getFilters } from './modules/filters.js';

let allAvailableBrands = [];

export function setAvailableBrands(brands) {
    allAvailableBrands = brands;
}

export function initSearch() {
    const searchInput = document.getElementById('main-search');
    const suggestionsContainer = document.getElementById('search-suggestions');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    if (!searchInput) return;

    let debounceTimer;

    // Input handler
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Show/hide clear button
        if (clearSearchBtn) {
            clearSearchBtn.classList.toggle('hidden', query.length === 0);
        }

        // Render brand suggestions
        renderBrandSuggestions(query);

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateFilter('search', query);
        }, 250);
    });

    // Clear search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.classList.add('hidden');
            hideBrandSuggestions();
            updateFilter('search', '');
            updateFilter('brand', null);
            searchInput.focus();
        });
    }

    // Keyboard shortcut: '/' focuses search
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            hideBrandSuggestions();
            searchInput.blur();
        }
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search-container')) {
            hideBrandSuggestions();
        }
    });
}

function renderBrandSuggestions(query) {
    const container = document.getElementById('search-suggestions');
    if (!container) return;

    if (!query || query.length < 2 || !allAvailableBrands || allAvailableBrands.length === 0) {
        hideBrandSuggestions();
        return;
    }

    const q = query.toLowerCase();
    const matched = allAvailableBrands
        .filter(b => b.name.toLowerCase().includes(q))
        .slice(0, 6);

    if (matched.length === 0) {
        hideBrandSuggestions();
        return;
    }

    container.innerHTML = `
        <div class="py-2 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 flex items-center justify-between">
            <span>🏷️ Matching Brands</span>
            <span class="text-[10px] text-gray-400 font-normal">Click to filter</span>
        </div>
        <div class="py-1">
            ${matched.map(b => `
                <button type="button" class="brand-suggestion-item w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-cyan-50 hover:text-[#06B6D4] flex items-center justify-between transition-colors" data-brand="${b.name}">
                    <span class="font-semibold flex items-center gap-2">
                        <span class="text-xs text-gray-400">🏷️</span>
                        ${highlightMatch(b.name, query)}
                    </span>
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${b.count} deals</span>
                </button>
            `).join('')}
        </div>
    `;

    container.classList.remove('hidden');

    // Click handler for suggestion items
    container.querySelectorAll('.brand-suggestion-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const brand = btn.getAttribute('data-brand');
            const searchInput = document.getElementById('main-search');
            if (searchInput) searchInput.value = brand;
            updateFilter('brand', brand);
            updateFilter('search', brand);
            hideBrandSuggestions();
        });
    });
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="text-[#06B6D4] underline font-bold">$1</span>');
}

function hideBrandSuggestions() {
    const container = document.getElementById('search-suggestions');
    if (container) container.classList.add('hidden');
}
