'use client';

import { useState, useTransition } from 'react';
import { FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { deleteComment } from '@/actions/admin-actions';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Comment {
    id: string;
    text: string;
    createdAt: Date;
    user: { name: string | null; email: string | null };
    question: { id: string; title: string };
    _count: { replies: number };
}

interface CommentsListProps {
    comments: Comment[];
}

export function CommentsList({ comments }: CommentsListProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();
    const router = useRouter();

    const handleDelete = (id: string) => {
        startTransition(async () => {
            try {
                await deleteComment(id);
                showToast('Comment deleted successfully', 'success');
                router.refresh();
            } catch {
                showToast('Failed to delete comment', 'error');
            }
        });
    };

    return (
        <>
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-gray-900 dark:text-white mb-3 whitespace-pre-wrap">
                                    {comment.text}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>By: {comment.user.name || comment.user.email}</span>
                                    <span>•</span>
                                    <span>{comment._count.replies} replies</span>
                                    <span>•</span>
                                    <span>{new Date(comment.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <Link
                                    href={`/questoes/${comment.question.id}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    On: {comment.question.title}
                                    <FaExternalLinkAlt className="text-xs" />
                                </Link>
                            </div>
                            <button
                                onClick={() => setDeleteId(comment.id)}
                                disabled={isPending}
                                className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                                title="Delete"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No comments found</p>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && handleDelete(deleteId)}
                title="Delete Comment"
                message="Are you sure you want to delete this comment? This will also delete all replies. This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </>
    );
}
