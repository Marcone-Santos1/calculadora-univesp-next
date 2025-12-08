'use client';

import { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { QuestionSidebar } from './QuestionSidebar';

interface SimpleQuestion {
    id: string;
    title: string;
    subjectName: string;
}

interface Subject {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
    _count: {
        questions: number;
    };
}

interface MobileFilterModalProps {
    subjects: Subject[];
    questions?: SimpleQuestion[];
}

export function MobileFilterModal({ subjects, questions = [] }: MobileFilterModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
            >
                <FaFilter /> Filtros
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-gray-50 dark:bg-gray-900 z-50 lg:hidden overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Filtros
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-xl text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                        <div className="p-4">
                            <QuestionSidebar subjects={subjects} questions={questions} />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
