'use client';

import { useTransition } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useToast } from '@/components/ToastProvider';
import { requestVerification } from '@/actions/question-actions';

interface ValidationButtonProps {
    questionId: string;
    isLoggedIn: boolean;
    isVerified: boolean;
    verificationRequested?: boolean;
}

export function ValidationButton({ questionId, isLoggedIn, isVerified, verificationRequested }: ValidationButtonProps) {
    const { showToast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleRequestValidation = () => {
        if (!isLoggedIn) {
            showToast('Você precisa estar logado para pedir validação.', 'warning');
            return;
        }

        startTransition(async () => {
            try {
                await requestVerification(questionId);
                showToast('Pedido de validação enviado com sucesso!', 'success');
            } catch {
                showToast('Erro ao enviar pedido de validação.', 'error');
            }
        });
    };

    if (isVerified) {
        return (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <FaCheckCircle />
                <span>Verificada</span>
            </div>
        );
    }

    if (verificationRequested) {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg font-medium cursor-not-allowed opacity-80"
            >
                <FaCheckCircle />
                <span>Validação Solicitada</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleRequestValidation}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
            <FaCheckCircle />
            <span>Pedir Validação</span>
        </button>
    );
}
