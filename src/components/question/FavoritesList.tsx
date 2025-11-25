'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { FaStar, FaTimes } from 'react-icons/fa';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface Question {
    id: string;
    title: string;
    subjectId: string;
}

interface FavoritesListProps {
    allQuestions: Question[];
}

export function FavoritesList({ allQuestions }: FavoritesListProps) {
    const { preferences, toggleFavorite } = useUserPreferences();

    // Get full question data for favorite IDs
    const favoriteQuestions = useMemo(() => {
        return preferences.favorites
            .map(id => allQuestions.find(q => q.id === id))
            .filter((q): q is Question => q !== undefined);
    }, [preferences.favorites, allQuestions]);

    if (favoriteQuestions.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
                <FaStar className="text-yellow-500 dark:text-yellow-400 text-sm" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Favoritos ({favoriteQuestions.length})
                </h3>
            </div>

            <div className="space-y-2">
                {favoriteQuestions.map((question) => (
                    <div
                        key={question.id}
                        className="group relative"
                    >
                        <Link
                            href={`/questoes/${question.id}`}
                            className="block px-3 py-2 pr-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700 transition-all"
                        >
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                {question.title}
                            </p>
                        </Link>
                        <button
                            onClick={() => toggleFavorite(question.id)}
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            title="Remover dos favoritos"
                        >
                            <FaTimes className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
