'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRevisionFromExam } from '@/actions/mock-exam-actions';
import { useToast } from '@/components/ToastProvider';
import { FaRedo, FaSpinner } from 'react-icons/fa';

interface RevisarErrosDesteSimuladoButtonProps {
    examId: string;
    wrongCount: number;
}

export function RevisarErrosDesteSimuladoButton({ examId, wrongCount }: RevisarErrosDesteSimuladoButtonProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    if (wrongCount === 0) return null;

    const handleClick = async () => {
        setIsLoading(true);
        try {
            const result = await createRevisionFromExam(examId);
            if (result.success && result.mockExamId) {
                showToast({
                    message: `Simulado de revisão com ${wrongCount} questão${wrongCount !== 1 ? 'ões' : ''}. Boa sorte!`,
                    type: 'success',
                });
                router.push(`/simulados/${result.mockExamId}`);
            } else if (!result.success && result.error === 'NO_WRONG_QUESTIONS') {
                showToast({ message: 'Nenhuma questão errada neste simulado.', type: 'info' });
            } else {
                showToast({ message: 'Erro ao criar simulado de revisão.', type: 'error' });
            }
        } catch {
            showToast({ message: 'Erro ao criar simulado de revisão.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-70"
        >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaRedo />}
            Revisar erros deste simulado ({wrongCount})
        </button>
    );
}
