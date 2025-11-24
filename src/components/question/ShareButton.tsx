'use client';

import { FaShare } from 'react-icons/fa';
import { useToast } from '@/components/ToastProvider';

interface ShareButtonProps {
    questionId: string;
    questionTitle: string;
}

export function ShareButton({ questionId, questionTitle }: ShareButtonProps) {
    const { showToast } = useToast();

    const handleShare = async () => {
        const url = `${window.location.origin}/questoes/${questionId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: questionTitle,
                    text: `Confira esta questão: ${questionTitle}`,
                    url: url,
                });
                showToast('Compartilhado com sucesso!', 'success');
            } catch {
                // User cancelled share
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(url);
                showToast('Link copiado para a área de transferência!', 'success');
            } catch {
                showToast('Erro ao copiar link.', 'error');
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition-colors"
        >
            <FaShare /> Compartilhar
        </button>
    );
}
