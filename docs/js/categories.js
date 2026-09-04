import { updateFilter, getFilters, subscribe } from './modules/filters.js';

const CATEGORY_NAMES = {
    electronics: '⚡ Electronics',
    clothing: '👕 All Clothing',
    laptops: '💻 Laptops & Computers',
    phones: '📱 Phones & Tablets',
    headphones: '🎧 Headphones & Audio',
    tvs: '📺 TVs & Monitors',
    gaming: '🎮 Gaming',
    smarthome: '🏠 Smart Home',
    cameras: '📷 Cameras',
    mens: '👔 Men\'s Clothing',
    womens: '👗 Women\'s Clothing',
    shoes: '👟 Shoes',
    accessories: '⌚ Accessories',
    activewear: '🏃 Activewear'
};

export function initCategories() {
    const pillsContainer = document.getElementById('category-pills');
    const sidebarContainer = document.getElementById('sidebar-categories');

    // Category pill clicks
    if (pillsContainer) {
        pillsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-category]');
            if (!btn) return;
            const category = btn.getAttribute('data-category');
            const current = getFilters().category;
            updateFilter('category', current === category ? null : category);
        });
    }

    // Sidebar link clicks
    if (sidebarContainer) {
        sidebarContainer.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-category]');
            if (!link) return;
            e.preventDefault();
            const category = link.getAttribute('data-category');
            const current = getFilters().category;
            updateFilter('category', current === category ? null : category);
        });
    }

    // React to filter changes
    subscribe((filters) => {
        updateActiveStates(filters.category);
        updatePageHeader(filters.category);
        updateActiveFilterChips(filters);
    });
}

function updateActiveStates(activeCategory) {
    // Update pills
    document.querySelectorAll('#category-pills button[data-category]').forEach(btn => {
        const cat = btn.getAttribute('data-category');
        if (cat === activeCategory) {
            btn.classList.add('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-[#F8FAFC]', 'scale-105');
        } else {
            btn.classList.remove('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-[#F8FAFC]', 'scale-105');
        }
    });

    // Update sidebar
    document.querySelectorAll('#sidebar-categories a[data-category]').forEach(link => {
        const cat = link.getAttribute('data-category');
        if (cat === activeCategory) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updatePageHeader(category) {
    const title = document.getElementById('page-title');
    const subtitle = document.getElementById('page-subtitle');
    if (!title) return;

    if (category && CATEGORY_NAMES[category]) {
        title.textContent = CATEGORY_NAMES[category];
        subtitle.textContent = `Showing deals in ${CATEGORY_NAMES[category].replace(/^.\s/, '')}`;
    } else {
        title.textContent = '🔥 Best Deals for You';
        subtitle.textContent = 'Verified deals across the internet';
    }
}

function updateActiveFilterChips(filters) {
    const container = document.getElementById('active-filters');
    if (!container) return;

    const chips = [];

    if (filters.category) {
        const name = CATEGORY_NAMES[filters.category] || filters.category;
        chips.push(`
            <button data-clear="category" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full hover:bg-cyan-100 transition-colors">
                ${name.replace(/^.\s/, '')}
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `);
    }

    if (filters.search) {
        chips.push(`
            <button data-clear="search" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full hover:bg-purple-100 transition-colors">
                "${filters.search}"
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `);
    }

    container.innerHTML = chips.join('');

    // Chip clear listeners
    container.querySelectorAll('button[data-clear]').forEach(chip => {
        chip.addEventListener('click', () => {
            const key = chip.getAttribute('data-clear');
            if (key === 'search') {
                updateFilter('search', '');
                const input = document.getElementById('main-search');
                if (input) input.value = '';
            } else {
                updateFilter(key, null);
            }
        });
    });
}
