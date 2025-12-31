'use client';

import { useState, useTransition } from 'react';
import { createComment } from '@/actions/question-actions';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import { CommentItem } from './CommentItem';

interface Comment {
    id: string;
    text: string;
    userName: string;
    createdAt: Date;
    replies?: Comment[];
}

interface CommentSectionProps {
    questionId: string;
    comments: Comment[];
    isLoggedIn: boolean;
    currentUserId?: string;
}

export function CommentSection({ questionId, comments, isLoggedIn, currentUserId }: CommentSectionProps) {
    const [newComment, setNewComment] = useState('');
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();
    const router = useRouter();

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoggedIn) {
            showToast('Você precisa estar logado para comentar.', 'warning');
            return;
        }

        if (!newComment.trim()) {
            showToast('O comentário não pode estar vazio.', 'warning');
            return;
        }

        startTransition(async () => {
            try {
                await createComment(questionId, newComment);
                setNewComment('');
                showToast('Comentário adicionado com sucesso!', 'success');
                router.refresh();
            } catch {
                showToast('Erro ao adicionar comentário.', 'error');
            }
        });
    };

    const handleReply = async (parentId: string, text: string) => {
        if (!isLoggedIn) {
            showToast('Você precisa estar logado para responder.', 'warning');
            return;
        }

        return new Promise<void>((resolve, reject) => {
            startTransition(async () => {
                try {
                    await createComment(questionId, text, parentId);
                    showToast('Resposta adicionada com sucesso!', 'success');
                    router.refresh();
                    resolve();
                } catch {
                    showToast('Erro ao adicionar resposta.', 'error');
                    reject();
                }
            });
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Comentários e Explicações ({comments.length > 0 ? 'Discussão' : '0'})
            </h3>

            {/* New Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-8">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={isLoggedIn ? "Adicione um comentário ou explicação..." : "Faça login para comentar"}
                    disabled={!isLoggedIn || isPending}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
                    rows={3}
                />
                <div className="mt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={!isLoggedIn || isPending || !newComment.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        {isPending ? 'Enviando...' : 'Comentar'}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        isLoggedIn={isLoggedIn}
                        onReply={handleReply}
                        isPending={isPending}
                        currentUserId={currentUserId}
                    />
                ))}
                {comments.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
