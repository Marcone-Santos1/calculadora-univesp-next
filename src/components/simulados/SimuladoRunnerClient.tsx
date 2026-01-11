'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitMockExamAnswer, finishMockExam } from '@/actions/mock-exam-actions';
import { FaClock, FaChevronLeft, FaChevronRight, FaCheck, FaFire } from 'react-icons/fa';
import { useToast } from '@/components/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

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
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
            {/* Modern Glassmorphic Header */}
            <div className="sticky top-20 z-30 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-gray-200/50 dark:border-zinc-800/50 px-6 py-4 shadow-sm transition-all">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">

                    {/* Progress Area */}
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Questão <span className="text-gray-900 dark:text-white text-lg">{currentIndex + 1}</span>
                                <span className="text-gray-400 font-normal ml-1">/ {exam.totalQuestions}</span>
                            </span>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                                {Math.round(progress)}% Concluído
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Timer & Focus Badge */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-500 border border-amber-200/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                            <FaFire /> Modo Foco
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xl font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-zinc-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-inner">
                            <FaClock className="text-gray-400 text-sm" />
                            {formatTime(secondsElapsed)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col">
                <div className="flex-1 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20, filter: 'blur(5px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-zinc-950/50 border border-white dark:border-zinc-800 p-8 md:p-10 mb-24 relative overflow-hidden"
                        >
                            {/* Decorative gradient overlay */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                            {/* Question Text */}
                            <div className="prose prose-lg dark:prose-invert max-w-none mb-10 text-gray-800 dark:text-gray-200 leading-relaxed">
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{currentQ.question.text}</ReactMarkdown>
                            </div>

                            {/* Alternatives */}
                            <div className="space-y-4">
                                {currentQ.question.alternatives.map((alt) => {
                                    const isSelected = answers[currentQ.id] === alt.id;
                                    return (
                                        <motion.button
                                            key={alt.id}
                                            onClick={() => handleSelect(alt.id)}
                                            whileHover={{ scale: 1.005, backgroundColor: isSelected ? undefined : 'rgba(59, 130, 246, 0.05)' }}
                                            whileTap={{ scale: 0.995 }}
                                            className={clsx(
                                                "w-full text-left p-0.5 rounded-2xl transition-all duration-300 relative group overflow-hidden",
                                                isSelected
                                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20"
                                                    : "bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700"
                                            )}
                                        >
                                            <div className={clsx(
                                                "flex items-start gap-5 p-5 w-full h-full rounded-[14px]",
                                                isSelected ? "bg-white dark:bg-zinc-900 bg-opacity-95 backdrop-blur-sm" : "bg-transparent"
                                            )}>
                                                {/* Letter Circle */}
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 transition-all shadow-sm",
                                                    isSelected
                                                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                                                        : "bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 group-hover:border-blue-300 dark:group-hover:border-blue-700 group-hover:text-blue-500"
                                                )}>
                                                    {alt.letter}
                                                </div>

                                                {/* Text */}
                                                <div className={clsx(
                                                    "pt-1.5 font-medium text-lg transition-colors",
                                                    isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                                                )}>
                                                    {alt.text}
                                                </div>

                                                {/* Check Icon (Visible only when selected) */}
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 text-xl"
                                                    >
                                                        <FaCheck />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Fixed Bottom Navigation Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border-t border-gray-200 dark:border-zinc-800 z-40">
                    <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
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

                </div>
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
    );
}
