import { openModal, closeModal, showToast } from './modules/ui.js';

let currentImageFile = null;

export function initImageSearch() {
    const btn = document.getElementById('btn-image-search');
    const dropzone = document.getElementById('image-dropzone');
    const fileInput = document.getElementById('image-upload');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    const searchLensBtn = document.getElementById('btn-search-lens');
    const clearBtn = document.getElementById('btn-clear-image');
    const urlInput = document.getElementById('image-url-input');
    const urlSearchBtn = document.getElementById('btn-search-url');

    if (!btn) return;

    // Open modal
    btn.addEventListener('click', () => openModal('image-search-modal'));

    // Drag & drop
    if (dropzone) {
        dropzone.addEventListener('click', () => fileInput?.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-[#06B6D4]', 'bg-cyan-50/50');
        });

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-[#06B6D4]', 'bg-cyan-50/50');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-[#06B6D4]', 'bg-cyan-50/50');
            if (e.dataTransfer.files.length) {
                handleImageFile(e.dataTransfer.files[0]);
            }
        });
    }

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleImageFile(e.target.files[0]);
        });
    }

    // Paste from clipboard
    document.addEventListener('paste', (e) => {
        const modal = document.getElementById('image-search-modal');
        if (!modal || modal.classList.contains('hidden')) return;
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                handleImageFile(item.getAsFile());
                break;
            }
        }
    });

    // Search with Google Lens button
    if (searchLensBtn) {
        searchLensBtn.addEventListener('click', () => {
            if (currentImageFile) {
                searchWithGoogleLens(currentImageFile);
            }
        });
    }

    // Clear image
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            currentImageFile = null;
            if (previewContainer) previewContainer.classList.add('hidden');
            if (dropzone) dropzone.classList.remove('hidden');
            if (fileInput) fileInput.value = '';
        });
    }

    // URL search
    if (urlSearchBtn && urlInput) {
        urlSearchBtn.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (url) searchByImageUrl(url);
        });
        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const url = urlInput.value.trim();
                if (url) searchByImageUrl(url);
            }
        });
    }
}

function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('Please upload an image file.', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5MB.', 'error');
        return;
    }

    currentImageFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewContainer = document.getElementById('image-preview-container');
        const previewImg = document.getElementById('image-preview');
        const dropzone = document.getElementById('image-dropzone');

        if (previewImg) previewImg.src = e.target.result;
        if (previewContainer) previewContainer.classList.remove('hidden');
        if (dropzone) dropzone.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

async function searchWithGoogleLens(file) {
    showToast('Opening Google Lens...', 'info');

    // Convert file to base64 data URL and open Google Lens
    // Google Lens supports direct URL uploads, so we'll upload to a free
    // image hosting service first (imgbb), then redirect to Lens
    try {
        // Try uploading to imgbb (free, no account needed for anonymous uploads)
        const formData = new FormData();
        formData.append('image', file);

        // imgbb free anonymous upload (limited but functional)
        const response = await fetch('https://api.imgbb.com/1/upload?key=00000000000000000000000000000000', {
            method: 'POST',
            body: formData
        }).catch(() => null);

        if (response?.ok) {
            const data = await response.json();
            if (data?.data?.url) {
                const lensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(data.data.url)}`;
                window.open(lensUrl, '_blank', 'noopener,noreferrer');
                closeModal('image-search-modal');
                return;
            }
        }
    } catch (e) {
        // Fallback: use data URL approach
    }

    // Fallback: Open Google Lens homepage for manual upload
    window.open('https://lens.google.com/', '_blank', 'noopener,noreferrer');
    showToast('Google Lens opened — upload your image there to search.', 'info');
    closeModal('image-search-modal');
}

function searchByImageUrl(url) {
    try {
        new URL(url); // Validate URL
    } catch {
        showToast('Please enter a valid URL.', 'error');
        return;
    }

    const lensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`;
    window.open(lensUrl, '_blank', 'noopener,noreferrer');
    showToast('Searching with Google Lens...', 'info');
    closeModal('image-search-modal');
}
