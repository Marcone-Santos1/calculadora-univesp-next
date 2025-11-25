'use client';

import { useState } from 'react';
import { FaFlag } from 'react-icons/fa';
import { createReport } from '@/actions/report-actions';
import { useToast } from '@/components/ToastProvider';

interface ReportButtonProps {
    questionId?: string;
    commentId?: string;
}

export function ReportButton({ questionId, commentId }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setIsSubmitting(true);
        try {
            await createReport({
                reason,
                questionId,
                commentId
            });
            showToast('Denúncia enviada com sucesso.', 'success');
            setIsOpen(false);
            setReason('');
        } catch {
            showToast('Erro ao enviar denúncia.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Denunciar"
            >
                <FaFlag className="text-xs" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Denunciar Conteúdo
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Descreva o motivo da denúncia..."
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                rows={4}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
