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

    const handleDismiss = async () => {
        try {
            await resolveReport(reportId, 'DISMISSED');
            showToast('Denúncia ignorada.', 'info');
        } catch (error) {
            showToast('Erro ao ignorar denúncia.', 'error');
        }
    };

    const handleResolve = async () => {
        try {
            await resolveReport(reportId, 'RESOLVED');
            showToast('Denúncia marcada como resolvida.', 'success');
        } catch (error) {
            showToast('Erro ao resolver denúncia.', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteReportedContent(reportId);
            showToast('Conteúdo excluído e denúncia resolvida.', 'success');
        } catch (error) {
            showToast('Erro ao excluir conteúdo.', 'error');
        }
    };

    if (status !== 'PENDING') return null;

    return (
        <>
            <div className="flex justify-end gap-2">
                <button
                    onClick={handleDismiss}
                    title="Ignorar"
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <FaTimes />
                </button>
                <button
                    onClick={handleResolve}
                    title="Marcar como Resolvido (Manter Conteúdo)"
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                    <FaCheck />
                </button>
                <button
                    onClick={() => setIsDeleteOpen(true)}
                    title={`Excluir ${contentType === 'question' ? 'Questão' : 'Comentário'}`}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
