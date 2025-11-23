'use client';

import { FaExclamationTriangle } from 'react-icons/fa';
import { useToast } from '@/components/ToastProvider';

interface ValidationButtonProps {
    questionId: string;
}

export function ValidationButton({ questionId }: ValidationButtonProps) {
    const { showToast } = useToast();

    const handleRequestValidation = () => {
        // TODO: Implement server action to request validation
        // For now, just show a toast
        showToast('Solicitação de validação enviada! Um moderador irá revisar em breve.', 'success');

        // In the future, this could:
        // 1. Create a notification for moderators
        // 2. Mark the question as "pending validation"
        // 3. Send an email to moderators
    };

    return (
        <button
            onClick={handleRequestValidation}
            className="text-sm text-gray-500 hover:text-orange-500 flex items-center gap-2 transition-colors"
        >
            <FaExclamationTriangle /> Pedir Validação
        </button>
    );
}
