'use client';

import { useUserPreferencesContext } from '@/context/UserPreferencesContext';

export function useUserPreferences() {
    return useUserPreferencesContext();
}
