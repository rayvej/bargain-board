import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { 
    getFirestore, collection, query, where, orderBy, limit, startAfter, getDocs, doc, getDoc, onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let db = null;
let app = null;
let isInitialized = false;

export async function initFirebase(config) {
    try {
        if (!config || !config.projectId) {
            console.warn('Firebase config incomplete. Falling back to demo mode.');
            return false;
        }
        
        app = initializeApp(config);
        db = getFirestore(app);
        
        isInitialized = true;
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

export function isDbInitialized() {
    return isInitialized;
}

export async function getDeals(filters = {}, lastVisible = null, pageLimit = 12) {
    if (!isInitialized) return { deals: [], lastVisible: null };
    
    let dealsRef = collection(db, 'deals');
    let qArgs = [];
    
    if (filters.category) {
        qArgs.push(where('category', '==', filters.category));
    }
    if (filters.verifiedOnly) {
        qArgs.push(where('verificationStatus', '==', 'verified'));
    }
    if (filters.search) {
        qArgs.push(where('tags', 'array-contains', filters.search.toLowerCase()));
    }
    
    if (filters.sortBy === 'newest') {
        qArgs.push(orderBy('createdAt', 'desc'));
    } else if (filters.sortBy === 'price_asc') {
        qArgs.push(orderBy('salePrice', 'asc'));
    } else if (filters.sortBy === 'discount_desc') {
        qArgs.push(orderBy('savingsPercent', 'desc'));
    } else {
        qArgs.push(orderBy('createdAt', 'desc')); // Default
    }
    
    qArgs.push(limit(pageLimit));
    
    if (lastVisible) {
        qArgs.push(startAfter(lastVisible));
    }
    
    const q = query(dealsRef, ...qArgs);
    const snapshot = await getDocs(q);
    
    const deals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const last = snapshot.docs[snapshot.docs.length - 1];
    
    return { deals, lastVisible: last };
}
