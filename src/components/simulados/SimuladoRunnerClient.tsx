'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitMockExamAnswer, finishMockExam } from '@/actions/mock-exam-actions';
import { FaClock, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';
import { useToast } from '@/components/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Question {
    id: string;
    text: string;
    alternatives: { id: string; letter: string; text: string }[];
}

interface MockExamQuestion {
    id: string; // The link ID
    selectedAlternativeId?: string | null;
    question: Question;
}

interface MockExam {
    id: string;
    totalQuestions: number;
    questions: MockExamQuestion[];
}

export function SimuladoRunnerClient({ exam }: { exam: MockExam }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // mockQuestionId -> alternativeId
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();
    const currentQ = exam.questions[currentIndex];

    // Initialize answers from DB if resuming
    useEffect(() => {
        const initialAnswers: Record<string, string> = {};
        exam.questions.forEach(q => {
            if (q.selectedAlternativeId) {
                initialAnswers[q.id] = q.selectedAlternativeId;
            }
        });
        setAnswers(initialAnswers);
    }, [exam]);

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSelect = async (alternativeId: string) => {
        // Optimistic UI
        setAnswers(prev => ({ ...prev, [currentQ.id]: alternativeId }));

        // Background save
        try {
            await submitMockExamAnswer(currentQ.id, alternativeId);
        } catch (error) {
            console.error("Failed to save answer", error);
            showToast({
                message: "Erro ao salvar resposta.",
                type: "error",
            });
        }
    };

    const handleFinishClick = () => {
        setIsConfirmOpen(true);
    };

    const confirmFinish = async () => {
        setIsConfirmOpen(false);
        setIsSubmitting(true);
        try {
            const res = await finishMockExam(exam.id, secondsElapsed);

            showToast({
                message: "Simulado finalizado com sucesso.",
                type: "success",
            });

            if (res.redirectUrl) {
                router.push(res.redirectUrl);
            }
        } catch (error) {
            console.error("Failed to finish exam", error);
            showToast({
                message: "Erro ao finalizar simulado.",
                type: "error",
            });
            setIsSubmitting(false);
        }
    };

    // Calculate progress
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / exam.totalQuestions) * 100;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
            {/* Header / Focus Bar */}
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-700 dark:text-gray-200">
                        Questão {currentIndex + 1} <span className="text-gray-400 font-normal">/ {exam.totalQuestions}</span>
                    </span>
                    <div className="h-2 w-32 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xl text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 px-3 py-1 rounded-lg">
                    <FaClock className="text-sm" />
                    {formatTime(secondsElapsed)}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8 mb-8">
                    {/* Question Text */}
                    <div className="prose dark:prose-invert max-w-none mb-8 text-lg">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{currentQ.question.text}</ReactMarkdown>
                    </div>

                    {/* Alternatives */}
                    <div className="space-y-3">
                        {currentQ.question.alternatives.map((alt) => {
                            const isSelected = answers[currentQ.id] === alt.id;
                            return (
                                <button
                                    key={alt.id}
                                    onClick={() => handleSelect(alt.id)}
                                    className={`
                                        w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 group
                                        ${isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500'
                                            : 'border-gray-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors
                                        ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40'}
                                    `}>
                                        {alt.letter}
                                    </div>
                                    <div className={`pt-1 ${isSelected ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {alt.text}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaChevronLeft /> Anterior
                    </button>

                    {currentIndex === exam.totalQuestions - 1 ? (
                        <button
                            onClick={handleFinishClick}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-all"
                        >
                            {isSubmitting ? 'Enviando...' : (
                                <>
                                    <FaCheck /> Finalizar Simulado
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentIndex(prev => Math.min(exam.totalQuestions - 1, prev + 1))}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
                        >
                            Próxima <FaChevronRight />
                        </button>
                    )}
                </div>

                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmFinish}
                    title="Finalizar Simulado?"
                    description="Tem certeza que deseja finalizar? Verifique se respondeu todas as questões. Você não poderá alterar suas respostas depois."
                    confirmText="Sim, Finalizar"
                    cancelText="Cancelar"
                    variant="warning"
                />
            </div>
        </div>
    );
}
