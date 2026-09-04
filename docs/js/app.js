import { initFirebase } from './modules/firestore-client.js';
import { initDeals } from './deals.js';
import { initSearch } from './search.js';
import { initCategories } from './categories.js';
import { initImageSearch } from './image-search.js';
import { updateFilter } from './modules/filters.js';
import { closeModal, copyToClipboard } from './modules/ui.js';

async function bootstrap() {
    // ─── Firebase Init ───
    let config = null;
    try {
        const configModule = await import('../firebase-config.js');
        config = configModule.firebaseConfig || configModule.default;
    } catch {
        console.log('%c⚡ Bargain Board — Running in demo mode (Firebase not configured)', 'color:#06B6D4;font-weight:bold');
    }

    await initFirebase(config);

    // ─── Init UI Components ───
    initSearch();
    initCategories();
    initImageSearch();
    await initDeals('deal-grid');

    // ─── Sort / Filter Listeners ───
    document.getElementById('sort-select')?.addEventListener('change', (e) => {
        updateFilter('sortBy', e.target.value);
    });

    document.getElementById('verified-toggle')?.addEventListener('change', (e) => {
        updateFilter('verifiedOnly', e.target.checked);
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
        updateFilter('category', null);
        updateFilter('search', '');
        updateFilter('verifiedOnly', false);
        const searchInput = document.getElementById('main-search');
        if (searchInput) searchInput.value = '';
        const toggle = document.getElementById('verified-toggle');
        if (toggle) toggle.checked = false;
        document.getElementById('page-title').textContent = '🔥 Best Deals for You';
        document.getElementById('page-subtitle').textContent = 'Verified deals across the internet';
    });

    // ─── Service Worker ───
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (err) {
            console.log('SW registration skipped:', err.message);
        }
    }

    console.log('%c🏷️ Bargain Board loaded successfully!', 'color:#06B6D4;font-weight:bold;font-size:14px');
}

document.addEventListener('DOMContentLoaded', bootstrap);
