'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { storage } from '@/lib/cookies';

interface UserPreferences {
    // Sidebar
    expandedCategories: string[];

    // Recently Viewed
    recentQuestions: string[];

    // Favorites
    favorites: string[];

    // Reading Progress
    readQuestions: string[];

    // Default Filters
    defaultSort?: string;
    defaultSubject?: string;

    // Drafts
    questionDraft?: {
        title: string;
        text: string;
        week?: string;
        subjectId?: string;
        alternatives?: Array<{ text: string; isCorrect: boolean }>;
    };
}

interface UserPreferencesContextType {
    preferences: UserPreferences;
    setExpandedCategories: (categories: string[]) => void;
    addRecentQuestion: (questionId: string) => void;
    clearRecentQuestions: () => void;
    toggleFavorite: (questionId: string) => void;
    isFavorite: (questionId: string) => boolean;
    markAsRead: (questionId: string) => void;
    isRead: (questionId: string) => boolean;
    getReadingStats: (totalQuestions: number) => { read: number; total: number; percentage: number };
    setDefaultSort: (sort: string | null) => void;
    setDefaultSubject: (subjectName: string | null) => void;
    saveQuestionDraft: (draft: UserPreferences['questionDraft']) => void;
    clearQuestionDraft: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);

const STORAGE_KEYS = {
    EXPANDED_CATEGORIES: 'sidebar_expanded_categories',
    RECENT_QUESTIONS: 'recent_questions',
    FAVORITES: 'favorite_questions',
    READ_QUESTIONS: 'read_questions',
    DEFAULT_SORT: 'default_sort',
    DEFAULT_SUBJECT: 'default_subject',
    QUESTION_DRAFT: 'question_draft',
};

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
    const [preferences, setPreferences] = useState<UserPreferences>({
        expandedCategories: ['Computação', 'Matemática'],
        recentQuestions: [],
        favorites: [],
        readQuestions: [],
    });

    // Load preferences from storage on mount
    useEffect(() => {
        const loadPreferences = () => {
            const loaded: UserPreferences = {
                expandedCategories: JSON.parse(storage.getItem(STORAGE_KEYS.EXPANDED_CATEGORIES) || '["Computação", "Matemática"]'),
                recentQuestions: JSON.parse(storage.getItem(STORAGE_KEYS.RECENT_QUESTIONS) || '[]'),
                favorites: JSON.parse(storage.getItem(STORAGE_KEYS.FAVORITES) || '[]'),
                readQuestions: JSON.parse(storage.getItem(STORAGE_KEYS.READ_QUESTIONS) || '[]'),
                defaultSort: storage.getItem(STORAGE_KEYS.DEFAULT_SORT) || undefined,
                defaultSubject: storage.getItem(STORAGE_KEYS.DEFAULT_SUBJECT) || undefined,
                questionDraft: JSON.parse(storage.getItem(STORAGE_KEYS.QUESTION_DRAFT) || 'null'),
            };
            setPreferences(loaded);
        };

        loadPreferences();
    }, []);

    // Sidebar: Set expanded categories
    const setExpandedCategories = useCallback((categories: string[]) => {
        setPreferences(prev => ({ ...prev, expandedCategories: categories }));
        storage.setItem(STORAGE_KEYS.EXPANDED_CATEGORIES, JSON.stringify(categories));
    }, []);

    // Recently Viewed: Add question to recent list
    const addRecentQuestion = useCallback((questionId: string) => {
        setPreferences(prev => {
            // Avoid duplicates and keep only last 10
            const filtered = prev.recentQuestions.filter(id => id !== questionId);
            const updated = [questionId, ...filtered].slice(0, 10);
            storage.setItem(STORAGE_KEYS.RECENT_QUESTIONS, JSON.stringify(updated));
            return { ...prev, recentQuestions: updated };
        });
    }, []);

    // Recently Viewed: Clear history
    const clearRecentQuestions = useCallback(() => {
        setPreferences(prev => ({ ...prev, recentQuestions: [] }));
        storage.setItem(STORAGE_KEYS.RECENT_QUESTIONS, '[]');
    }, []);

    // Favorites: Toggle favorite
    const toggleFavorite = useCallback((questionId: string) => {
        setPreferences(prev => {
            const isFavorite = prev.favorites.includes(questionId);
            const updated = isFavorite
                ? prev.favorites.filter(id => id !== questionId)
                : [...prev.favorites, questionId];
            storage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
            return { ...prev, favorites: updated };
        });
    }, []);

    // Favorites: Check if favorited
    const isFavorite = useCallback((questionId: string) => {
        return preferences.favorites.includes(questionId);
    }, [preferences.favorites]);

    // Reading Progress: Mark as read
    const markAsRead = useCallback((questionId: string) => {
        setPreferences(prev => {
            if (prev.readQuestions.includes(questionId)) return prev;
            const updated = [...prev.readQuestions, questionId];
            storage.setItem(STORAGE_KEYS.READ_QUESTIONS, JSON.stringify(updated));
            return { ...prev, readQuestions: updated };
        });
    }, []);

    // Reading Progress: Check if read
    const isRead = useCallback((questionId: string) => {
        return preferences.readQuestions.includes(questionId);
    }, [preferences.readQuestions]);

    // Reading Progress: Get stats
    const getReadingStats = useCallback((totalQuestions: number) => {
        return {
            read: preferences.readQuestions.length,
            total: totalQuestions,
            percentage: totalQuestions > 0 ? Math.round((preferences.readQuestions.length / totalQuestions) * 100) : 0,
        };
    }, [preferences.readQuestions]);

    // Default Filters: Set default sort
    const setDefaultSort = useCallback((sort: string | null) => {
        setPreferences(prev => ({ ...prev, defaultSort: sort || undefined }));
        if (sort) {
            storage.setItem(STORAGE_KEYS.DEFAULT_SORT, sort);
        } else {
            storage.removeItem(STORAGE_KEYS.DEFAULT_SORT);
        }
    }, []);

    // Default Filters: Set default subject
    const setDefaultSubject = useCallback((subjectName: string | null) => {
        setPreferences(prev => ({ ...prev, defaultSubject: subjectName || undefined }));
        if (subjectName) {
            storage.setItem(STORAGE_KEYS.DEFAULT_SUBJECT, subjectName);
        } else {
            storage.removeItem(STORAGE_KEYS.DEFAULT_SUBJECT);
        }
    }, []);

    // Drafts: Save draft
    const saveQuestionDraft = useCallback((draft: UserPreferences['questionDraft']) => {
        setPreferences(prev => ({ ...prev, questionDraft: draft }));
        if (draft) {
            storage.setItem(STORAGE_KEYS.QUESTION_DRAFT, JSON.stringify(draft));
        } else {
            storage.removeItem(STORAGE_KEYS.QUESTION_DRAFT);
        }
    }, []);

    // Drafts: Clear draft
    const clearQuestionDraft = useCallback(() => {
        setPreferences(prev => ({ ...prev, questionDraft: undefined }));
        storage.removeItem(STORAGE_KEYS.QUESTION_DRAFT);
    }, []);

    const value = {
        preferences,
        setExpandedCategories,
        addRecentQuestion,
        clearRecentQuestions,
        toggleFavorite,
        isFavorite,
        markAsRead,
        isRead,
        getReadingStats,
        setDefaultSort,
        setDefaultSubject,
        saveQuestionDraft,
        clearQuestionDraft,
    };

    return (
        <UserPreferencesContext.Provider value={value}>
            {children}
        </UserPreferencesContext.Provider>
    );
}

export function useUserPreferencesContext() {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error('useUserPreferencesContext must be used within a UserPreferencesProvider');
    }
    return context;
}
