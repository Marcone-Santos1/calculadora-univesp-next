'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaLayerGroup, FaBook, FaCalculator, FaCode, FaFlask, FaGlobe, FaLanguage } from 'react-icons/fa';

interface Subject {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
    _count: { questions: number };
}

interface QuestionSidebarProps {
    subjects: Subject[];
}

const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cálculo') || lower.includes('matemática')) return <FaCalculator />;
    if (lower.includes('algoritmos') || lower.includes('programação')) return <FaCode />;
    if (lower.includes('física') || lower.includes('química')) return <FaFlask />;
    if (lower.includes('inglês') || lower.includes('português')) return <FaLanguage />;
    if (lower.includes('ética') || lower.includes('sociedade')) return <FaGlobe />;
    return <FaBook />;
};

export function QuestionSidebar({ subjects }: QuestionSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSubject = searchParams.get('subject');
    const currentQuery = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(currentQuery);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) {
            params.set('q', searchTerm);
        } else {
            params.delete('q');
        }
        router.push(`/questoes?${params.toString()}`);
    };

    return (
        <div className="space-y-8">
            {/* Search Box */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Buscar</h3>
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        placeholder="Pesquisar questões..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500"
                    />
                    <FaSearch className="absolute left-3.5 top-3.5 text-gray-400" />
                </form>
            </div>

            {/* Subjects Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaLayerGroup className="text-blue-500" />
                    Matérias
                </h3>
                <div className="space-y-1">
                    <Link
                        href="/questoes"
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${!currentSubject
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <span>Todas as Questões</span>
                    </Link>

                    {subjects.map((subject) => (
                        <Link
                            key={subject.id}
                            href={`/questoes?subject=${subject.id}`}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${currentSubject === subject.id
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-lg ${currentSubject === subject.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                    {getIcon(subject.name)}
                                </span>
                                <span>{subject.name}</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${currentSubject === subject.id
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                }`}>
                                {subject._count.questions}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
