'use client';

import { useState, useTransition } from 'react';
import { FaUser, FaReply } from 'react-icons/fa';
import { createComment } from '@/actions/question-actions';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

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
}

export function CommentSection({ questionId, comments, isLoggedIn }: CommentSectionProps) {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
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
            } catch (error) {
                showToast('Erro ao adicionar comentário.', 'error');
            }
        });
    };

    const handleSubmitReply = async (parentId: string) => {
        if (!isLoggedIn) {
            showToast('Você precisa estar logado para responder.', 'warning');
            return;
        }

        if (!replyText.trim()) {
            showToast('A resposta não pode estar vazia.', 'warning');
            return;
        }

        startTransition(async () => {
            try {
                await createComment(questionId, replyText, parentId);
                setReplyText('');
                setReplyingTo(null);
                showToast('Resposta adicionada com sucesso!', 'success');
                router.refresh();
            } catch (error) {
                showToast('Erro ao adicionar resposta.', 'error');
            }
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Comentários e Explicações ({comments.length})
            </h3>

            {/* New Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={isLoggedIn ? "Adicione um comentário ou explicação..." : "Faça login para comentar"}
                    disabled={!isLoggedIn || isPending}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                />
                <div className="mt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={!isLoggedIn || isPending || !newComment.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                        {isPending ? 'Enviando...' : 'Comentar'}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id}>
                        {/* Main Comment */}
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                <FaUser className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 dark:text-white">{comment.userName}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 whitespace-pre-wrap">
                                    {comment.text}
                                </p>
                                <button
                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                                >
                                    <FaReply /> Responder
                                </button>

                                {/* Reply Form */}
                                {replyingTo === comment.id && (
                                    <div className="mt-3">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Escreva sua resposta..."
                                            disabled={isPending}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                                            rows={2}
                                        />
                                        <div className="mt-2 flex gap-2 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setReplyingTo(null);
                                                    setReplyText('');
                                                }}
                                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSubmitReply(comment.id)}
                                                disabled={isPending || !replyText.trim()}
                                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded font-medium"
                                            >
                                                {isPending ? 'Enviando...' : 'Responder'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-4 ml-6 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                        {comment.replies.map((reply) => (
                                            <div key={reply.id} className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                                    <FaUser className="text-gray-500 dark:text-gray-400 text-sm" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                            {reply.userName}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(reply.createdAt).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                                        {reply.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                )}
            </div>
        </div>
    );
}
