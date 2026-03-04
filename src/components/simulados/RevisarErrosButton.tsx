'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRevisionMockExam } from '@/actions/mock-exam-actions';
import { useToast } from '@/components/ToastProvider';
import { FaRedo, FaSpinner } from 'react-icons/fa';

interface RevisarErrosButtonProps {
    wrongCount: number;
    variant?: 'card' | 'button';
}

export function RevisarErrosButton({ wrongCount, variant = 'button' }: RevisarErrosButtonProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (wrongCount === 0) {
            showToast({
                message: 'Você ainda não tem questões erradas para revisar. Faça simulados e volte aqui!',
                type: 'info',
            });
            return;
        }
        setIsLoading(true);
        try {
            const result = await createRevisionMockExam();
            if (result.success && result.mockExamId) {
                showToast({
                    message: `Simulado de revisão com ${wrongCount > 50 ? 50 : wrongCount} questões. Boa sorte!`,
                    type: 'success',
                });
                router.push(`/simulados/${result.mockExamId}`);
            } else if (!result.success && result.error === 'NO_WRONG_QUESTIONS') {
                showToast({
                    message: 'Você ainda não tem questões erradas para revisar.',
                    type: 'info',
                });
            } else {
                showToast({ message: 'Erro ao criar simulado de revisão.', type: 'error' });
            }
        } catch {
            showToast({ message: 'Erro ao criar simulado de revisão.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === 'card') {
        return (
            <button
                onClick={handleClick}
                disabled={isLoading}
                className="w-full p-6 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-all text-left group disabled:opacity-70"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-200 dark:bg-amber-800/50 flex items-center justify-center text-amber-700 dark:text-amber-300 text-xl group-hover:scale-110 transition-transform">
                        {isLoading ? <FaSpinner className="animate-spin" /> : <FaRedo />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 dark:text-gray-100">Revisar erros</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {wrongCount === 0
                                ? 'Refaça apenas as questões que você errou em simulados anteriores.'
                                : `${wrongCount} questão${wrongCount !== 1 ? 'ões' : ''} para revisar (máx. 50 por simulado).`}
                        </p>
                    </div>
                </div>
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={isLoading || wrongCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaRedo />}
            Revisar erros {wrongCount > 0 && `(${wrongCount})`}
        </button>
    );
}
