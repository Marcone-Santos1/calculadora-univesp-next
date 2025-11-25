'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { FaClock, FaTimes } from 'react-icons/fa';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface Question {
    id: string;
    title: string;
    subjectId: string;
}

interface RecentQuestionsProps {
    allQuestions: Question[];
}

export function RecentQuestions({ allQuestions }: RecentQuestionsProps) {
    const { preferences, clearRecentQuestions } = useUserPreferences();

    //  Get full question data for recent IDs
    const recentQuestions = useMemo(() => {
        return preferences.recentQuestions
            .map(id => allQuestions.find(q => q.id === id))
            .filter((q): q is Question => q !== undefined)
            .slice(0, 5); // Show max 5
    }, [preferences.recentQuestions, allQuestions]);

    if (recentQuestions.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FaClock className="text-blue-600 dark:text-blue-400 text-sm" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Visualizados Recentemente
                    </h3>
                </div>
                <button
                    onClick={clearRecentQuestions}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Limpar histórico"
                >
                    Limpar
                </button>
            </div>

            <div className="space-y-2">
                {recentQuestions.map((question) => (
                    <Link
                        key={question.id}
                        href={`/questoes/${question.id}`}
                        className="block px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    >
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {question.title}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
