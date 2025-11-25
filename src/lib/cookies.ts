/**
 * Cookie consent utilities
 * Use these functions to check if non-essential cookies are allowed
 */

export function hasConsentForNonEssential(): boolean {
    if (typeof window === 'undefined') return false;

    const consent = localStorage.getItem('cookieConsent');
    return consent === 'accepted';
}

export function canUsePreferences(): boolean {
    return hasConsentForNonEssential();
}

/**
 * Safe storage wrapper that respects cookie consent
 */
export const storage = {
    setItem: (key: string, value: string) => {
        if (!canUsePreferences()) return;
        localStorage.setItem(key, value);
    },

    getItem: (key: string): string | null => {
        if (!canUsePreferences()) return null;
        return localStorage.getItem(key);
    },

    removeItem: (key: string) => {
        if (!canUsePreferences()) return;
        localStorage.removeItem(key);
    }
};
