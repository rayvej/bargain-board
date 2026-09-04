import { updateFilter } from './modules/filters.js';

export function initSearch() {
    const searchInput = document.getElementById('main-search');
    if (!searchInput) return;

    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateFilter('search', e.target.value.trim());
        }, 300);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });
}
