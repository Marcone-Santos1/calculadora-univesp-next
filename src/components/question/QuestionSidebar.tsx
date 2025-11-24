'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaChevronDown, FaChevronRight, FaTimes } from 'react-icons/fa';

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgb(209 213 219) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgb(209 213 219);
    border-radius: 9999px;
    transition: background-color 0.2s;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgb(156 163 175);
  }
  
  .dark .custom-scrollbar {
    scrollbar-color: rgb(75 85 99) transparent;
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgb(75 85 99);
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgb(107 114 128);
  }
`;

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

// Categorize subjects by detecting keywords
const categorizeSubject = (name: string): string => {
    const lower = name.toLowerCase();

    // Computação
    if (lower.match(/(computação|programação|algoritmo|software|dados|web|internet|sistemas|rede|banco|segurança|inteligência|ia|machine|aprendizado)/)) {
        return 'Computação';
    }
    // Matemática
    if (lower.match(/(matemática|cálculo|álgebra|geometria|estatística|numérico|probabilístico)/)) {
        return 'Matemática';
    }
    // Engenharia
    if (lower.match(/(engenharia|circuito|eletrônica|automação|produção|industrial|resistência|materiais)/)) {
        return 'Engenharia';
    }
    // Administração
    if (lower.match(/(administração|gestão|negócio|empreendedor|marketing|financeiro|projeto|qualidade|recursos humanos|rh)/)) {
        return 'Gestão e Negócios';
    }
    // Linguagens e Educação
    if (lower.match(/(português|inglês|libras|linguística|literatura|educação|didática|pedagogia)/)) {
        return 'Educação e Linguagens';
    }
    // Ciências
    if (lower.match(/(física|química|biologia|ambiente|sustentabilidade)/)) {
        return 'Ciências';
    }
    // Direito e Ética
    if (lower.match(/(direito|ética|legislação|cidadania|sociedade|política|responsabilidade)/)) {
        return 'Direito e Sociedade';
    }

    return 'Outras';
};

export function QuestionSidebar({ subjects }: QuestionSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSubject = searchParams.get('subject');
    const currentQuery = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(currentQuery);
    const [subjectFilter, setSubjectFilter] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Computação', 'Matemática']));

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

    // Group subjects by category
    const categorizedSubjects = useMemo(() => {
        const filtered = subjects.filter(s =>
            s.name.toLowerCase().includes(subjectFilter.toLowerCase())
        );

        const grouped: Record<string, Subject[]> = {};
        filtered.forEach(subject => {
            const category = categorizeSubject(subject.name);
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(subject);
        });

        // Sort subjects within each category
        Object.keys(grouped).forEach(cat => {
            grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
        });

        return grouped;
    }, [subjects, subjectFilter]);

    const totalQuestions = subjects.reduce((sum, s) => sum + s._count.questions, 0);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    return (
        <div className="space-y-6">
            <style jsx>{scrollbarStyles}</style>

            {/* Search Box */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Buscar</h3>
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        placeholder="Pesquisar questões..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
                </form>
            </div>

            {/* Verification Status Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Status de Verificação</h3>
                <div className="space-y-2">
                    <Link
                        href="/questoes"
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm ${!searchParams.get('verified')
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <span>Todas</span>
                    </Link>
                    <Link
                        href={`/questoes?verified=true${currentSubject ? `&subject=${currentSubject}` : ''}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm ${searchParams.get('verified') === 'true'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <span>✓ Verificadas</span>
                    </Link>
                    <Link
                        href={`/questoes?verified=false${currentSubject ? `&subject=${currentSubject}` : ''}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm ${searchParams.get('verified') === 'false'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <span>X Não Verificadas</span>
                    </Link>
                </div>
            </div>

            {/* Subjects Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Matérias ({subjects.length})
                    </h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filtrar matérias..."
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
                        {subjectFilter && (
                            <button
                                onClick={() => setSubjectFilter('')}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <FaTimes className="text-sm" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {/* All Questions */}
                    <Link
                        href="/questoes"
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm ${!currentSubject
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <span>Todas as Questões</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${!currentSubject
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                            {totalQuestions}
                        </span>
                    </Link>

                    {/* Categorized Subjects */}
                    {Object.keys(categorizedSubjects).sort().map(category => (
                        <div key={category} className="border-t border-gray-100 dark:border-gray-700 pt-2 first:border-0 first:pt-0">
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded transition-colors"
                            >
                                <span>{category}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {categorizedSubjects[category].length}
                                    </span>
                                    {expandedCategories.has(category) ? (
                                        <FaChevronDown className="text-[10px]" />
                                    ) : (
                                        <FaChevronRight className="text-[10px]" />
                                    )}
                                </div>
                            </button>

                            {expandedCategories.has(category) && (
                                <div className="mt-1 space-y-0.5 pl-2">
                                    {categorizedSubjects[category].map((subject) => (
                                        <Link
                                            key={subject.id}
                                            href={`/questoes?subject=${subject.id}`}
                                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors text-sm ${currentSubject === subject.id
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                            title={subject.name}
                                        >
                                            <span className="truncate">{subject.name}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${currentSubject === subject.id
                                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {subject._count.questions}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {Object.keys(categorizedSubjects).length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                            Nenhuma matéria encontrada
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
