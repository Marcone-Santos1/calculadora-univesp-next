'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateSlug } from '@/utils/functions';
import {
  FaSearch, FaChevronDown, FaTimes,
  FaClock, FaCheckCircle, FaBan, FaFilter, FaFire,
  FaComment, FaSortAmountDown
} from 'react-icons/fa';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { RecentQuestions } from './RecentQuestions';
import { FavoritesList } from './FavoritesList';
import { FilterSection } from "@/components/question/FilterSection";
import { FilterOption } from "@/components/question/FilterOption";

// --- Interfaces ---
interface Subject {
  id: string;
  name: string;
  _count: { questions: number };
}

interface SimpleQuestion {
  id: string;
  title: string;
  subjectName: string;
}

interface QuestionSidebarProps {
  subjects: Subject[];
  questions?: SimpleQuestion[];
  /** Quando estamos na página /questoes/[subject], passa o slug do segmento para marcar a disciplina ativa */
  currentSubjectSlug?: string;
}

// Função de categorização (mantida igual)
const categorizeSubject = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.match(/(computação|programação|algoritmo|software|dados|web|internet|sistemas|rede|banco|segurança|inteligência|ia|machine|aprendizado)/)) return 'Computação';
  if (lower.match(/(matemática|cálculo|álgebra|geometria|estatística|numérico|probabilístico)/)) return 'Matemática';
  if (lower.match(/(engenharia|circuito|eletrônica|automação|produção|industrial|resistência|materiais)/)) return 'Engenharia';
  if (lower.match(/(administração|gestão|negócio|empreendedor|marketing|financeiro|projeto|qualidade|recursos humanos|rh)/)) return 'Gestão e Negócios';
  if (lower.match(/(português|inglês|libras|linguística|literatura|educação|didática|pedagogia)/)) return 'Educação e Linguagens';
  if (lower.match(/(física|química|biologia|ambiente|sustentabilidade)/)) return 'Ciências';
  if (lower.match(/(direito|ética|legislação|cidadania|sociedade|política|responsabilidade)/)) return 'Direito e Sociedade';
  return 'Outras';
};

export function QuestionSidebar({ subjects, questions = [], currentSubjectSlug }: QuestionSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSubject = searchParams.get('subject');
  const isSubjectPage = typeof currentSubjectSlug === 'string';
  const currentSort = searchParams.get('sort');
  const currentActivity = searchParams.get('activity');
  const currentVerified = searchParams.get('verified');
  const currentPage = searchParams.get('page');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [subjectFilter, setSubjectFilter] = useState('');
  const { preferences, setExpandedCategories, setDefaultSort, setDefaultSubject } = useUserPreferences();

  // Sticky Search Handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // Reset pagination on search
    if (searchTerm) params.set('q', searchTerm);
    else params.delete('q');
    router.push(`/questoes?${params.toString()}`);
  };

  // Helper para preservar filtros
  const buildFilterUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // Reset pagination on filter change
    Object.entries(updates).forEach(([key, value]) => {
      value === null ? params.delete(key) : params.set(key, value);
    });
    return `/questoes?${params.toString()}`;
  };

  const categorizedSubjects = useMemo(() => {
    const filtered = subjects.filter(s => s.name.toLowerCase().includes(subjectFilter.toLowerCase()));
    const grouped: Record<string, Subject[]> = {};
    filtered.forEach(subject => {
      const category = categorizeSubject(subject.name);
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(subject);
    });
    Object.keys(grouped).forEach(cat => grouped[cat].sort((a, b) => a.name.localeCompare(b.name)));
    return grouped;
  }, [subjects, subjectFilter]);

  const toggleCategory = (category: string) => {
    const current = preferences.expandedCategories;
    setExpandedCategories(current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category]);
  };

  const hasActiveFilters = currentSubject || currentSort || currentActivity || currentVerified || searchTerm || currentPage;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
      {/* Sticky Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-24">

        {/* Header Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-950 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
              <FaSearch className="absolute left-3 top-3.5 text-gray-400 text-xs" />
            </form>
          </div>

          {hasActiveFilters && (
            <Link
              href="/questoes"
              onClick={() => {
                setDefaultSort(null);
                setDefaultSubject(null);
                setSearchTerm('');
              }}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
            >
              <FaTimes /> Limpar todos os filtros
            </Link>
          )}
        </div>

        {/* Scrollable Filters Area */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar p-4">

          {/* Quick Stats / Recent / Favorites */}
          <div className="mb-6 space-y-4">
            {questions.length > 0 && <RecentQuestions allQuestions={questions} />}
            {questions.length > 0 && <FavoritesList allQuestions={questions} />}
          </div>

          <div className="space-y-1">
            {/* Filter: Sort */}
            <FilterSection
              title="Ordenar"
              icon={FaSortAmountDown}
              isActive={!!currentSort}
            >
              <FilterOption
                href={buildFilterUrl({ sort: null })}
                active={!currentSort}
                label="Mais Recentes"
                icon={() => <span>🕒</span>}
                onClick={() => setDefaultSort(null)}
              />
              <FilterOption
                href={buildFilterUrl({ sort: 'popular' })}
                active={currentSort === 'popular'}
                label="Populares"
                icon={FaFire}
                onClick={() => setDefaultSort('popular')}
              />
              <FilterOption
                href={buildFilterUrl({ sort: 'discussed' })}
                active={currentSort === 'discussed'}
                label="Mais Discutidas"
                icon={FaComment}
                onClick={() => setDefaultSort('discussed')}
              />
            </FilterSection>

            {/* Filter: Activity */}
            <FilterSection
              title="Atividade"
              icon={FaFilter}
              isActive={!!currentActivity}
              defaultOpen={false}
            >
              <FilterOption href={buildFilterUrl({ activity: null })} active={!currentActivity} label="Qualquer atividade" />
              <FilterOption href={buildFilterUrl({ activity: 'no-votes' })} active={currentActivity === 'no-votes'} label="Sem Votos" icon={() => <span>🆘</span>} />
              <FilterOption href={buildFilterUrl({ activity: 'no-comments' })} active={currentActivity === 'no-comments'} label="Sem Comentários" icon={() => <span>💭</span>} />
              <FilterOption href={buildFilterUrl({ activity: 'trending' })} active={currentActivity === 'trending'} label="Em Alta (7 dias)" icon={() => <span>📈</span>} />
            </FilterSection>

            {/* Filter: Status */}
            <FilterSection
              title="Status"
              icon={FaCheckCircle}
              isActive={!!currentVerified || !!searchParams.get('verificationRequested')}
              defaultOpen={false}
            >
              <FilterOption href={buildFilterUrl({ verified: null, verificationRequested: null })} active={!currentVerified && !searchParams.get('verificationRequested')} label="Todos" />
              <FilterOption href={buildFilterUrl({ verified: 'true', verificationRequested: null })} active={currentVerified === 'true'} label="Verificadas" icon={FaCheckCircle} />
              <FilterOption href={buildFilterUrl({ verified: 'false', verificationRequested: null })} active={currentVerified === 'false'} label="Não Verificadas" icon={FaBan} />
              <FilterOption href={buildFilterUrl({ verified: null, verificationRequested: 'true' })} active={searchParams.get('verificationRequested') === 'true'} label="Pendentes" icon={FaClock} />
            </FilterSection>

            {/* Filter: Subjects */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Matérias</h3>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                  {subjects.length}
                </span>
              </div>

              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-xs focus:ring-1 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                />
                <FaSearch className="absolute left-2.5 top-2 text-gray-400 text-xs" />
              </div>

              <div className="space-y-1">
                <FilterOption
                  href={isSubjectPage ? '/questoes' : buildFilterUrl({ subject: null })}
                  active={isSubjectPage ? !currentSubjectSlug : !currentSubject}
                  label="Todas as Matérias"
                  onClick={() => setDefaultSubject(null)}
                />

                {Object.keys(categorizedSubjects).sort().map(category => (
                  <div key={category} className="mt-2">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      {category}
                      <FaChevronDown className={`text-[10px] transition-transform ${preferences.expandedCategories.includes(category) ? 'rotate-180' : ''}`} />
                    </button>

                    {preferences.expandedCategories.includes(category) && (
                      <div className="mt-1 pl-2 space-y-0.5 border-l-2 border-gray-100 dark:border-gray-800 ml-3">
                        {categorizedSubjects[category].map((subject) => {
                          const subjectSlug = generateSlug(subject.name);
                          return (
                            <FilterOption
                              key={subject.id}
                              href={isSubjectPage ? `/questoes/${subjectSlug}` : buildFilterUrl({ subject: subject.name })}
                              active={isSubjectPage ? subjectSlug === currentSubjectSlug : currentSubject === subject.name}
                              label={subject.name}
                              count={subject._count.questions}
                              onClick={() => setDefaultSubject(subject.name)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles for scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </aside>
  );
}