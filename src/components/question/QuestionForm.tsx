'use client';

import React, { useState, useEffect } from 'react';
import { createQuestion } from '@/actions/question-actions';
import { FaSearch, FaTimes, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(
    () => import('@/components/editor/MarkdownEditor').then((mod) => mod.MarkdownEditor),
    { ssr: false, loading: () => <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg" /> }
);

import { ImageUploadArea } from '@/components/editor/ImageUploadArea';

interface Subject {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
}

export const QuestionForm: React.FC<{ subjects: Subject[] }> = ({ subjects }) => {
    const router = useRouter();
    const { showToast } = useToast();
    const { saveQuestionDraft, clearQuestionDraft, preferences } = useUserPreferences();

    // Form State
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [week, setWeek] = useState('');
    const [alternatives, setAlternatives] = useState([
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' },
    ]);

    // Subject search state
    const [subjectSearch, setSubjectSearch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

    // Confirmation dialog
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);

    // Filter subjects based on search
    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    // Load draft on mount
    useEffect(() => {
        if (!isDraftLoaded && preferences.questionDraft) {
            const draft = preferences.questionDraft;
            setTitle(draft.title || '');
            setText(draft.text || '');
            setWeek(draft.week || '');
            if (draft.subjectId) {
                const subject = subjects.find(s => s.id === draft.subjectId);
                if (subject) setSelectedSubject(subject);
            }
            if (draft.alternatives) {
                // Merge draft alternatives with default structure to ensure IDs match
                const mergedAlternatives = alternatives.map((alt, index) => ({
                    ...alt,
                    text: draft.alternatives?.[index]?.text || ''
                }));
                setAlternatives(mergedAlternatives);
            }
            setIsDraftLoaded(true);
            showToast('Rascunho restaurado', 'info');
        }
    }, [preferences.questionDraft, subjects, isDraftLoaded, showToast, alternatives]);

    // Auto-save draft
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Only save if there's some content
            if (title || text || week || selectedSubject || alternatives.some(a => a.text)) {
                saveQuestionDraft({
                    title,
                    text,
                    week,
                    subjectId: selectedSubject?.id,
                    alternatives: alternatives.map(a => ({ text: a.text, isCorrect: false })) // isCorrect not used in form yet?
                });
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [title, text, week, selectedSubject, alternatives, saveQuestionDraft]);

    const handleAlternativeChange = (index: number, value: string) => {
        const newAlternatives = [...alternatives];
        newAlternatives[index].text = value;
        setAlternatives(newAlternatives);
    };

    const handleSubjectSelect = (subject: Subject) => {
        setSelectedSubject(subject);
        setSubjectSearch('');
        setIsSubjectDropdownOpen(false);
    };

    const handleClearSubject = () => {
        setSelectedSubject(null);
        setSubjectSearch('');
    };

    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const handleConfirmedSubmit = async () => {
        if (!selectedSubject) {
            showToast('Selecione uma matéria', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            if (!formRef.current) return;
            const formData = new FormData(formRef.current);

            const result = await createQuestion(formData);

            showToast('Questão criada com sucesso!', 'success');
            clearQuestionDraft();

            // Redirect to the created question
            if (result?.questionId) {
                router.push(`/questoes/${result.questionId}`);
            } else {
                router.push('/questoes');
            }
        } catch (error: any) {
            showToast(error.message || 'Erro ao criar questão', 'error');
            setIsSubmitting(false);
            setShowConfirmation(false);
        }
    };

    return (
        <>
            <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Searchable Subject Field */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Matéria *
                    </label>
                    <div className="relative">
                        <input type="hidden" name="subjectId" value={selectedSubject?.id || ''} required />

                        {selectedSubject ? (
                            // Selected subject display
                            <div className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 flex items-center justify-between">
                                <span className="text-gray-900 dark:text-white">{selectedSubject.name}</span>
                                <button
                                    type="button"
                                    onClick={handleClearSubject}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ) : (
                            // Search input
                            <div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Pesquisar matéria..."
                                        value={subjectSearch}
                                        onChange={(e) => {
                                            setSubjectSearch(e.target.value);
                                            setIsSubjectDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsSubjectDropdownOpen(true)}
                                        className="w-full pl-10 pr-4 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <FaSearch className="absolute left-3 top-4 text-gray-400" />
                                </div>

                                {/* Dropdown */}
                                {isSubjectDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsSubjectDropdownOpen(false)}
                                        />
                                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                                            {filteredSubjects.length > 0 ? (
                                                filteredSubjects.map((subject) => (
                                                    <button
                                                        key={subject.id}
                                                        type="button"
                                                        onClick={() => handleSubjectSelect(subject)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                                                    >
                                                        {subject.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                                                    Nenhuma matéria encontrada
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Week Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Semana
                    </label>
                    <div className="relative">
                        <select
                            name="week"
                            value={week}
                            onChange={(e) => setWeek(e.target.value)}
                            className="w-full p-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                            <option value="">Não especificado</option>
                            <option value="Semana 1">Semana 1</option>
                            <option value="Semana 2">Semana 2</option>
                            <option value="Semana 3">Semana 3</option>
                            <option value="Semana 4">Semana 4</option>
                            <option value="Semana 5">Semana 5</option>
                            <option value="Semana 6">Semana 6</option>
                            <option value="Semana 7">Semana 7</option>
                        </select>
                        <FaChevronDown className="absolute right-3 top-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Título da Pergunta *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Resumo da dúvida..."
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Detalhes da Questão *
                    </label>
                    <div className="space-y-4">
                        <div className="prose dark:prose-invert max-w-none">
                            <MarkdownEditor
                                value={text}
                                onChange={setText}
                                height={400}
                                placeholder="Digite o texto da questão aqui..."
                            />
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Anexar Imagens
                            </label>
                            <ImageUploadArea
                                onUpload={(markdown) => setText(prev => prev ? `${prev}\n\n${markdown}` : markdown)}
                            />
                        </div>

                        {/* Hidden input for form submission if needed, but we use state in handleSubmit */}
                        <input type="hidden" name="text" value={text} />
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Alternativas *</h3>
                    <input type="hidden" name="alternatives" value={JSON.stringify(alternatives)} />
                    <div className="space-y-3">
                        {alternatives.map((alt, index) => (
                            <div key={alt.id} className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center font-bold bg-gray-100 dark:bg-gray-700 rounded-full">
                                    {alt.id}
                                </div>
                                <input
                                    type="text"
                                    value={alt.text}
                                    onChange={(e) => handleAlternativeChange(index, e.target.value)}
                                    placeholder={`Alternativa ${alt.id}`}
                                    className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-lg"
                >
                    {isSubmitting ? 'Publicando...' : 'Publicar Pergunta'}
                </button>

                <style jsx>{`
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
                    }
                    
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background-color: rgb(156 163 175);
                    }
                    
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: rgb(75 85 99);
                    }
                    
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background-color: rgb(107 114 128);
                    }
                `}</style>
            </form >

            {/* Confirmation Dialog */}
            {
                showConfirmation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                    <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-500 text-xl" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        Confirmar Publicação
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                        Revise todos os dados antes de publicar.
                                    </p>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                                            ⚠️ Após a criação, a questão não poderá ser editada.
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Tem certeza que deseja publicar esta questão?
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                                >
                                    Revisar
                                </button>
                                <button
                                    onClick={handleConfirmedSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                                >
                                    {isSubmitting ? 'Publicando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};
