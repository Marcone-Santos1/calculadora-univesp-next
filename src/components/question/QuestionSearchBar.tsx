'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

export const QuestionSearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/questoes?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto my-8">
            <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Qual é a sua dúvida hoje?
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Encontre respostas verificadas para suas atividades da Univesp.
                </p>
            </div>

            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Pesquise sua pergunta (ex: Limite de função...)"
                    className="block w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none
                             transition-all shadow-sm hover:shadow-md text-lg"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors"
                >
                    Buscar
                </button>
            </form>
        </div>
    );
};
