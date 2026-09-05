import { initFirebase } from './modules/firestore-client.js';
import { initDeals } from './deals.js';
import { initSearch } from './search.js';
import { initCategories } from './categories.js';
import { initImageSearch } from './image-search.js';
import { updateFilter, resetFilters } from './modules/filters.js';
import { closeModal, copyToClipboard } from './modules/ui.js';

async function bootstrap() {
    // ─── Firebase Init ───
    let config = null;
    try {
        const configModule = await import('../firebase-config.js');
        config = configModule.firebaseConfig || configModule.default;
    } catch {
        console.log('%c⚡ Bargain Board — Running with verified live dataset', 'color:#06B6D4;font-weight:bold');
    }

    await initFirebase(config);

    // ─── Init UI Components ───
    initSearch();
    initCategories();
    initImageSearch();
    await initDeals('deal-grid');

    // ─── Sort Dropdown Listener ───
    document.getElementById('sort-select')?.addEventListener('change', (e) => {
        updateFilter('sortBy', e.target.value);
    });

    // ─── Brand Select Listener ───
    document.getElementById('brand-select')?.addEventListener('change', (e) => {
        const val = e.target.value;
        updateFilter('brand', val || null);
    });

    // ─── Size Select Listener ───
    document.getElementById('size-select')?.addEventListener('change', (e) => {
        const val = e.target.value;
        updateFilter('size', val || null);
    });

    // ─── Price Range Select Listener ───
    document.getElementById('price-range-select')?.addEventListener('change', (e) => {
        const val = e.target.value;
        updateFilter('priceRange', val || null);
    });

    // ─── Gender Filter Buttons ───
    document.querySelectorAll('#gender-filter-group .gender-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const gender = btn.getAttribute('data-gender');
            
            // Toggle button style
            document.querySelectorAll('#gender-filter-group .gender-btn').forEach(b => {
                b.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
            });
            btn.classList.add('bg-white', 'text-gray-900', 'shadow-sm');

            updateFilter('gender', gender === 'all' ? null : gender);
        });
    });

    // ─── Verified Deals Toggle ───
    document.getElementById('verified-toggle')?.addEventListener('change', (e) => {
        updateFilter('verifiedOnly', e.target.checked);
    });

    // ─── Hide Amazon Deals Toggle ───
    document.getElementById('exclude-amazon-toggle')?.addEventListener('change', (e) => {
        updateFilter('excludeAmazon', e.target.checked);
    });

    // ─── Store / Retailer Select Listener ───
    document.getElementById('retailer-select')?.addEventListener('change', (e) => {
        const val = e.target.value;
        updateFilter('retailer', val || null);
    });

    // ─── Modal Close Listeners ───
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('[id$="-modal"]');
            if (modal) closeModal(modal.id);
        });
    });

    // Close modal on backdrop click
    document.querySelectorAll('[id$="-modal"]').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
    });

    // ─── Global Coupon Copy Listener (for modals) ───
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-coupon-btn') || e.target.closest('.copy-coupon-btn')) {
            const btn = e.target.closest('.copy-coupon-btn') || e.target;
            const code = btn.getAttribute('data-code');
            if (code) copyToClipboard(code);
        }
    });

    // ─── Keyboard Shortcuts ───
    document.addEventListener('keydown', (e) => {
        // Escape → close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('[id$="-modal"]:not(.hidden)').forEach(modal => {
                closeModal(modal.id);
            });
        }
        // / → focus search (when not typing)
        if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
            e.preventDefault();
            document.getElementById('main-search')?.focus();
        }
    });

    // ─── Logo → reset all filters ───
    document.getElementById('logo-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        resetFilters();
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
        const toggle = document.getElementById('verified-toggle');
        if (toggle) toggle.checked = false;
        const amazonToggle = document.getElementById('exclude-amazon-toggle');
        if (amazonToggle) amazonToggle.checked = false;
        
        // Reset gender buttons
        document.querySelectorAll('#gender-filter-group .gender-btn').forEach(btn => {
            const isAll = btn.getAttribute('data-gender') === 'all';
            btn.classList.toggle('bg-white', isAll);
            btn.classList.toggle('text-gray-900', isAll);
            btn.classList.toggle('shadow-sm', isAll);
        });

        document.getElementById('page-title').textContent = '🔥 Best Deals for You';
        document.getElementById('page-subtitle').textContent = 'Verified deals across top brands and retailers';
    });

    // ─── Service Worker ───
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (err) {
            console.log('SW registration skipped:', err.message);
        }
    }

    console.log('%c🏷️ Bargain Board loaded successfully with 500+ deals!', 'color:#06B6D4;font-weight:bold;font-size:14px');
}

document.addEventListener('DOMContentLoaded', bootstrap);
