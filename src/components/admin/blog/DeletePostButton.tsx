'use client';

import { useState } from 'react';
import { deleteBlogPost } from '@/actions/blog-actions';
import { FaTrash } from 'react-icons/fa';
import { useToast } from '@/components/ToastProvider';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

interface DeletePostButtonProps {
    postId: string;
    postTitle: string;
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
    const { showToast } = useToast();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteBlogPost(postId);
            showToast('Artigo excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir artigo:', error);
            showToast('Erro ao excluir artigo. Tente novamente.', 'error');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsConfirmOpen(true)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Excluir"
            >
                <FaTrash />
            </button>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Artigo"
                message={`Tem certeza que deseja excluir o artigo "${postTitle}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                variant="danger"
            />
        </>
    );
}
