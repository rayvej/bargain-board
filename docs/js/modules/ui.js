export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }
}

export function formatPrice(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return 'CA$0.00';
    return 'CA$' + amount.toFixed(2);
}

export function formatRelativeTime(dateInput) {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput?.seconds ? dateInput.seconds * 1000 : dateInput);
    if (isNaN(date.getTime())) return 'Recently';

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((date - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) {
        const hoursDifference = Math.round((date - new Date()) / (1000 * 60 * 60));
        if (hoursDifference === 0) {
            const minutes = Math.round((date - new Date()) / (1000 * 60));
            return rtf.format(minutes, 'minute');
        }
        return rtf.format(hoursDifference, 'hour');
    }
    
    return rtf.format(daysDifference, 'day');
}

export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
    } catch (err) {
        showToast('Failed to copy', 'error');
    }
}
