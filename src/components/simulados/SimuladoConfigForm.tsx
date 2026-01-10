'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMockExam } from '@/actions/mock-exam-actions';
import { FaBook, FaCheckCircle, FaSpinner } from 'react-icons/fa';

import { useToast } from '@/components/ToastProvider';

interface Subject {
    id: string;
    name: string;
    icon?: string | null;
    _count: { questions: number };
}

export function SimuladoConfigForm({ subjects }: { subjects: Subject[] }) {
    const [selectedids, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { showToast } = useToast();

    const toggleSubject = (id: string) => {
        if (selectedids.includes(id)) {
            setSelectedIds(prev => prev.filter(s => s !== id));
        } else {
            if (selectedids.length >= 10) {
                showToast({
                    message: "Máximo de 10 matérias permitidas.",
                    type: "error",
                });
                return;
            }
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const handleStart = async () => {
        if (selectedids.length === 0) {
            showToast({
                message: "Selecione pelo menos uma matéria.",
                type: "error",
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await createMockExam(selectedids);
            if (res.success && res.mockExamId) {
                showToast({
                    message: "Simulado gerado! Boa sorte.",
                    type: "success",
                });
                router.push(`/simulados/${res.mockExamId}`);
            }
        } catch (error) {
            showToast({
                message: "Erro ao gerar simulado. Tente novamente.",
                type: "error",
            });
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        1. Selecione as Matérias
                    </h2>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${selectedids.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {selectedids.length} selecionadas (Max 10)
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subjects.map(subject => {
                        const isSelected = selectedids.includes(subject.id);
                        const hasEnoughQuestions = subject._count.questions >= 8;

                        return (
                            <button
                                key={subject.id}
                                onClick={() => hasEnoughQuestions && toggleSubject(subject.id)}
                                disabled={!hasEnoughQuestions}
                                className={`
                                    relative p-4 rounded-xl border text-left transition-all
                                    ${!hasEnoughQuestions ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-zinc-800/50 border-gray-200' :
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                            : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className={`font-semibold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {subject.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {subject._count.questions} questões disponíveis
                                        </p>
                                    </div>
                                    {isSelected && <FaCheckCircle className="text-blue-500 text-lg" />}
                                </div>
                                {!hasEnoughQuestions && (
                                    <span className="text-[10px] text-red-500 font-medium block mt-2">
                                        Mínimo 8 questões necessárias
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                    2. Resumo do Simulado
                </h2>
                <div className="flex flex-col sm:flex-row gap-8 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                        <span className="block font-bold text-gray-900 dark:text-white text-lg">
                            {selectedids.length * 8}
                        </span>
                        Questões Totais
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 dark:text-white text-lg">
                            Todas
                        </span>
                        Validada pela Equipe
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 dark:text-white text-lg">
                            + XP
                        </span>
                        Recompensa ao final
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleStart}
                    disabled={isLoading || selectedids.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <FaSpinner className="animate-spin" /> : <FaBook />}
                    Gerar Simulado e Começar
                </button>
            </div>
        </div>
    );
}
