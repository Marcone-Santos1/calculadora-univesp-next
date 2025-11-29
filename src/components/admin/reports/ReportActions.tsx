'use client';

import { useState } from 'react';
import { resolveReport, deleteReportedContent } from '@/actions/report-actions';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/ToastProvider';

interface ReportActionsProps {
    reportId: string;
    status: string;
    contentType: 'question' | 'comment';
}

export function ReportActions({ reportId, status, contentType }: ReportActionsProps) {
    const { showToast } = useToast();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleDismiss = async () => {
        setIsLoading(true);
        try {
            await resolveReport(reportId, 'DISMISSED');
            showToast('Denúncia ignorada.', 'info');
        } catch {
            showToast('Erro ao ignorar denúncia.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async () => {
        setIsLoading(true);
        try {
            await resolveReport(reportId, 'RESOLVED');
            showToast('Denúncia marcada como resolvida.', 'success');
        } catch {
            showToast('Erro ao resolver denúncia.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteReportedContent(reportId);
            showToast('Conteúdo excluído e denúncia resolvida.', 'success');
        } catch {
            showToast('Erro ao excluir conteúdo.', 'error');
        } finally {
            setIsLoading(false);
            setIsDeleteOpen(false);
        }
    };

    if (status !== 'PENDING') return null;

    return (
        <>
            <div className="flex justify-end gap-2">
                <button
                    onClick={handleDismiss}
                    disabled={isLoading}
                    title="Ignorar"
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    <FaTimes />
                </button>
                <button
                    onClick={handleResolve}
                    disabled={isLoading}
                    title="Marcar como Resolvido (Manter Conteúdo)"
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                    <FaCheck />
                </button>
                <button
                    onClick={() => setIsDeleteOpen(true)}
                    disabled={isLoading}
                    title={`Excluir ${contentType === 'question' ? 'Questão' : 'Comentário'}`}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                    <FaTrash />
                </button>
            </div>

            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title={`Excluir ${contentType === 'question' ? 'Questão' : 'Comentário'}`}
                message={`Tem certeza que deseja excluir est${contentType === 'question' ? 'a' : 'e'} ${contentType === 'question' ? 'questão' : 'comentário'}? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                variant="danger"
            />
        </>
    );
}
