'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMockExam } from '@/actions/mock-exam-actions';
import { FaBook, FaCheckCircle, FaSpinner, FaBolt, FaRunning, FaLayerGroup } from 'react-icons/fa';

import { useToast } from '@/components/ToastProvider';

interface Subject {
    id: string;
    name: string;
    icon?: string | null;
    _count: { questions: number };
}

type ExamMode = 'STANDARD' | 'FAST' | 'MARATHON';

export function SimuladoConfigForm({ subjects }: { subjects: Subject[] }) {
    const [selectedids, setSelectedIds] = useState<string[]>([]);
    const [mode, setMode] = useState<ExamMode>('STANDARD');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { showToast } = useToast();

    const toggleSubject = (id: string) => {
        if (selectedids.includes(id)) {
            setSelectedIds(prev => prev.filter(s => s !== id));
        } else {
            // Limits only apply to STANDARD mode
            if (mode === 'STANDARD' && selectedids.length >= 10) {
                showToast({
                    message: "Máximo de 10 matérias permitidas no modo Padrão.",
                    type: "error",
                });
                return;
            }
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const handlePreset = (newMode: ExamMode) => {
        setMode(newMode);
        if (newMode === 'FAST' || newMode === 'MARATHON') {
            // Auto-select all subjects with enough questions (or just all valid ones)
            // Ideally we select all available.
            const allIds = subjects.filter(s => s._count.questions > 0).map(s => s.id);
            setSelectedIds(allIds);
            showToast({
                message: `Modo ${newMode === 'FAST' ? 'Rápido' : 'Maratona'} ativado! Todas as matérias selecionadas.`,
                type: "success",
            });
        } else {
            setSelectedIds([]); // Clear for custom selection
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
            const res = await createMockExam(selectedids, mode);
            if (res.success && res.mockExamId) {
                showToast({
                    message: "Simulado gerado! Boa sorte.",
                    type: "success",
                });
                router.push(`/simulados/${res.mockExamId}`);
            }
        } catch (error) {
            showToast({
                message: error instanceof Error ? error.message : "Erro ao gerar simulado.",
                type: "error",
            });
            console.error(error);
            setIsLoading(false);
        }
    };

    const getModeDescription = () => {
        switch (mode) {
            case 'FAST': return '10 Questões • 100% Aleatório • Rápido';
            case 'MARATHON': return '50 Questões • Desafio de Resistência';
            default: return '8 Questões por Matéria (Max 10 Matérias)';
        }
    };

    const estimatedQuestions = () => {
        if (mode === 'FAST') return 10;
        if (mode === 'MARATHON') return 50;
        return selectedids.length * 8;
    };

    return (
        <div className="space-y-8">
            {/* Mode Selection */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                    1. Escolha o Modo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => handlePreset('STANDARD')}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${mode === 'STANDARD' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:border-zinc-700'}`}
                    >
                        <div className={`p-2 rounded-lg w-fit ${mode === 'STANDARD' ? 'bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                            <FaLayerGroup />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">Personalizado</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Você escolhe as matérias e quantidade.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handlePreset('FAST')}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${mode === 'FAST' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 ring-1 ring-yellow-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:border-zinc-700'}`}
                    >
                        <div className={`p-2 rounded-lg w-fit ${mode === 'FAST' ? 'bg-yellow-200 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                            <FaBolt />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">Rápido</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">10 questões aleatórias. Tufão!</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handlePreset('MARATHON')}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${mode === 'MARATHON' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 ring-1 ring-red-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:border-zinc-700'}`}
                    >
                        <div className={`p-2 rounded-lg w-fit ${mode === 'MARATHON' ? 'bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                            <FaRunning />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">Maratona</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">50 questões. Teste sua resistência.</p>
                        </div>
                    </button>
                </div>
            </div>

            <div className={`bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all ${mode !== 'STANDARD' ? 'opacity-70 grayscale-[50%] pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        2. Selecione as Matérias {mode !== 'STANDARD' && "(Automático)"}
                    </h2>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${selectedids.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {selectedids.length} selecionadas
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subjects.map(subject => {
                        const isSelected = selectedids.includes(subject.id);
                        const hasEnoughQuestions = subject._count.questions >= 8; // Warning: This logic assumes 8 per subject. For FAST/MARATHON we might not need 8 per subject.

                        return (
                            <button
                                key={subject.id}
                                onClick={() => (hasEnoughQuestions || mode !== 'STANDARD') && toggleSubject(subject.id)}
                                disabled={(!hasEnoughQuestions && mode === 'STANDARD')}
                                className={`
                                    relative p-4 rounded-xl border text-left transition-all group
                                    ${(!hasEnoughQuestions && mode === 'STANDARD') ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-zinc-800/50 border-gray-200' :
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
                                {(!hasEnoughQuestions && mode === 'STANDARD') && (
                                    <span className="text-[10px] text-red-500 font-medium block mt-2">
                                        Mínimo 8 questões necessárias
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm sticky bottom-4 z-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 uppercase font-bold">Resumo Estimado</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-800 dark:text-white">{estimatedQuestions()}</span>
                            <span className="text-gray-600 dark:text-gray-400">questões</span>
                        </div>
                        <p className="text-xs text-blue-500 font-medium">{getModeDescription()}</p>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={isLoading || selectedids.length === 0}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? <FaSpinner className="animate-spin" /> : <FaBook className="group-hover:scale-110 transition-transform" />}
                        Gerar Simulado
                    </button>
                </div>
            </div>
        </div>
    );
}
