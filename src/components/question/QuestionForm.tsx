'use client';

import React, { useState, useEffect } from 'react';
import { createQuestion, updateQuestion } from '@/actions/question-actions';
import { FaSearch, FaTimes, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import dynamic from 'next/dynamic';
import { ImageUploadArea } from "../editor/ImageUploadArea";

const MarkdownEditor = dynamic(
    () => import('@/components/editor/MarkdownEditor').then((mod) => mod.MarkdownEditor),
    { ssr: false, loading: () => <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg" /> }
);

interface Subject {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
}

interface QuestionFormProps {
    subjects: Subject[];
    initialData?: {
        title: string;
        text: string;
        week?: string;
        subjectId: string;
        alternatives: { id: string; text: string; }[];
    };
    questionId?: string;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ subjects, initialData, questionId }) => {
    const router = useRouter();
    const { showToast } = useToast();
    const { saveQuestionDraft, clearQuestionDraft, preferences } = useUserPreferences();
    const isEditing = !!questionId;

    const [text, setText] = useState(initialData?.text || '');
    const [week, setWeek] = useState(initialData?.week || '');
    const [alternatives, setAlternatives] = useState(initialData?.alternatives || [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' },
    ]);

    // Subject search state
    const [subjectSearch, setSubjectSearch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(
        initialData ? subjects.find(s => s.id === initialData.subjectId) || null : null
    );
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

    // Confirmation dialog
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);

    // Filter subjects based on search
    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    // Load draft on mount (only if NOT editing)
    useEffect(() => {
        if (!isEditing && !isDraftLoaded && preferences.questionDraft) {
            const draft = preferences.questionDraft;
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
    }, [preferences.questionDraft, subjects, isDraftLoaded, showToast, alternatives, isEditing]);

    // Auto-save draft (only if NOT editing)
    useEffect(() => {
        if (isEditing) return;

        const timeoutId = setTimeout(() => {
            // Only save if there's some content
            if (text || week || selectedSubject || alternatives.some(a => a.text)) {
                saveQuestionDraft({
                    title: '',
                    text,
                    week,
                    subjectId: selectedSubject?.id,
                    alternatives: alternatives.map(a => ({ text: a.text, isCorrect: false }))
                });
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [text, week, selectedSubject, alternatives, saveQuestionDraft, isEditing]);

    // Validation state
    const [errors, setErrors] = useState({
        subject: false,
        week: false,
        text: false,
        alternatives: [] as number[],
    });

    const validate = () => {
        const newErrors = {
            subject: !selectedSubject,
            week: !week,
            text: !text || text.trim() === '',
            alternatives: alternatives
                .map((alt, index) => (!alt.text || alt.text.trim() === '' ? index : -1))
                .filter(index => index !== -1),
        };

        setErrors(newErrors);

        return !newErrors.subject && !newErrors.week && !newErrors.text && newErrors.alternatives.length === 0;
    };

    const handleAlternativeChange = (index: number, value: string) => {
        const newAlternatives = [...alternatives];
        newAlternatives[index].text = value;
        setAlternatives(newAlternatives);

        // Clear error if it exists for this alternative
        if (errors.alternatives.includes(index)) {
            setErrors(prev => ({
                ...prev,
                alternatives: prev.alternatives.filter(i => i !== index)
            }));
        }
    };

    const handleSubjectSelect = (subject: Subject) => {
        setSelectedSubject(subject);
        setSubjectSearch('');
        setIsSubjectDropdownOpen(false);
        if (errors.subject) setErrors(prev => ({ ...prev, subject: false }));
    };

    const handleClearSubject = () => {
        setSelectedSubject(null);
        setSubjectSearch('');
    };

    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validate()) {
            showToast('Preencha todos os campos obrigatórios', 'error');
            return;
        }

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

            if (isEditing && questionId) {
                await updateQuestion(questionId, formData);
                showToast('Questão atualizada com sucesso!', 'success');
                // Stay on page or redirect? Maybe redirect to the question page or back to admin list?
                // Let's redirect to the list for now, or the question itself.
                // Requirement says "same format", usually editing redirects back to where you came from or the item.
                router.push('/admin/questions');
                router.refresh();
            } else {
                const result = await createQuestion(formData);
                showToast('Questão criada com sucesso!', 'success');
                clearQuestionDraft();

                // Redirect to the created question
                if (result?.questionId) {
                    router.push(`/questoes/${result.questionId}`);
                } else {
                    router.push('/questoes');
                }
            }

        } catch (error: any) {
            showToast('Erro ao salvar questão', 'error');
            setIsSubmitting(false);
            setShowConfirmation(false);
        }
    };

    return (
        <>
            <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Searchable Subject Field */}
                <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${errors.subject ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        Matéria *
                    </label>
                    <div className="relative">
                        <input type="hidden" name="subjectId" value={selectedSubject?.id || ''} />

                        {selectedSubject ? (
                            // Selected subject display
                            <div className={`w-full p-3 rounded-lg border flex items-center justify-between ${errors.subject ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
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
                                            if (errors.subject) setErrors(prev => ({ ...prev, subject: false }));
                                        }}
                                        onFocus={() => setIsSubjectDropdownOpen(true)}
                                        className={`w-full pl-10 pr-4 p-3 rounded-lg border outline-none text-gray-900 dark:text-white focus:ring-2 ${errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500'}`}
                                    />
                                    <FaSearch className={`absolute left-3 top-4 ${errors.subject ? 'text-red-400' : 'text-gray-400'}`} />
                                </div>
                                {errors.subject && (
                                    <p className="mt-1 text-sm text-red-500">Selecione uma matéria</p>
                                )}

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
                    <label className={`block text-sm font-medium mb-2 ${errors.week ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        Semana *
                    </label>
                    <div className="relative">
                        <select
                            name="week"
                            value={week}
                            onChange={(e) => {
                                setWeek(e.target.value);
                                if (errors.week) setErrors(prev => ({ ...prev, week: false }));
                            }}
                            className={`w-full p-3 pr-10 rounded-lg border outline-none text-gray-900 dark:text-white focus:ring-2 appearance-none cursor-pointer ${errors.week ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500'}`}
                        >
                            <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Não especificado</option>
                            <option value="Semana 1" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Semana 1</option>
                            <option value="Semana 2" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Semana 2</option>
                            <option value="Semana 3" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Semana 3</option>
                            <option value="Semana 4" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Semana 4</option>
                            <option value="Semana 5" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Semana 5</option>
                            <option value="Semana 6" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Semana 6</option>
                            <option value="Semana 7" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Semana 7</option>
                        </select>
                        <FaChevronDown className="absolute right-3 top-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.week && (
                        <p className="mt-1 text-sm text-red-500">Selecione a semana</p>
                    )}
                </div>

                <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${errors.text ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        Detalhes da Questão *
                    </label>
                    <div className="space-y-4">
                        <div className={`prose dark:prose-invert max-w-none rounded-lg ${errors.text ? 'border border-red-500' : ''}`}>
                            <MarkdownEditor
                                value={text}
                                onChange={(val) => {
                                    setText(val);
                                    if (errors.text && val.trim()) setErrors(prev => ({ ...prev, text: false }));
                                }}
                                height={400}
                                placeholder="Digite o texto da questão aqui..."
                            />
                        </div>
                        {errors.text && (
                            <p className="mt-1 text-sm text-red-500">Digite o enunciado da questão</p>
                        )}

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
                    <h3 className={`text-lg font-semibold mb-4 ${errors.alternatives.length > 0 ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                        Alternativas *
                    </h3>
                    <input type="hidden" name="alternatives" value={JSON.stringify(alternatives)} />
                    <div className="space-y-3">
                        {alternatives.map((alt, index) => (
                            <div key={alt.id}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${errors.alternatives.includes(index) ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        {alt.id}
                                    </div>
                                    <input
                                        type="text"
                                        value={alt.text}
                                        onChange={(e) => handleAlternativeChange(index, e.target.value)}
                                        placeholder={`Alternativa ${alt.id}`}
                                        className={`flex-1 p-3 rounded-lg border outline-none text-gray-900 dark:text-white focus:ring-2 ${errors.alternatives.includes(index) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500'}`}
                                    />
                                </div>
                                {errors.alternatives.includes(index) && (
                                    <p className="mt-1 ml-11 text-xs text-red-500">Preencha esta alternativa</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-lg"
                >
                    {isSubmitting ? (isEditing ? 'Atualizando...' : 'Publicando...') : (isEditing ? 'Atualizar Pergunta' : 'Publicar Pergunta')}
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
                                        {isEditing ? 'Confirmar Edição' : 'Confirmar Publicação'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                        Revise todos os dados antes de {isEditing ? 'salvar' : 'publicar'}.
                                    </p>
                                    {!isEditing && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                                                ⚠️ Após a criação, a questão não poderá ser editada.
                                            </p>
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Tem certeza que deseja {isEditing ? 'atualizar' : 'publicar'} esta questão?
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
                                    {isSubmitting ? (isEditing ? 'Salvando...' : 'Publicando...') : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};