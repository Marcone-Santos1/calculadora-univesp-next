'use client';

import { useState } from 'react';
import { FaUser, FaReply } from 'react-icons/fa';

interface Comment {
    id: string;
    text: string;
    userName: string;
    createdAt: Date;
    replies?: Comment[];
}

interface CommentItemProps {
    comment: Comment;
    isLoggedIn: boolean;
    onReply: (parentId: string, text: string) => Promise<void>;
    isPending: boolean;
    depth?: number;
}

export function CommentItem({ comment, isLoggedIn, onReply, isPending, depth = 0 }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleSubmitReply = async () => {
        if (!replyText.trim()) return;

        await onReply(comment.id, replyText);
        setReplyText('');
        setIsReplying(false);
    };

    // Limit indentation depth visually to prevent squashed content on deep threads
    const indentClass = depth > 0 ? 'ml-4 md:ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : '';

    return (
        <div className={`mt-4 ${indentClass}`}>
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-gray-500 dark:text-gray-400 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            {comment.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap break-words">
                        {comment.text}
                    </p>

                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                    >
                        <FaReply /> Responder
                    </button>

                    {isReplying && (
                        <div className="mt-3 animate-fadeIn">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={isLoggedIn ? "Escreva sua resposta..." : "Faça login para responder"}
                                disabled={!isLoggedIn || isPending}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                                autoFocus
                            />
                            <div className="mt-2 flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsReplying(false);
                                        setReplyText('');
                                    }}
                                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitReply}
                                    disabled={!isLoggedIn || isPending || !replyText.trim()}
                                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
                                >
                                    {isPending ? 'Enviando...' : 'Responder'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recursive Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-4">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            isLoggedIn={isLoggedIn}
                            onReply={onReply}
                            isPending={isPending}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
