'use client';

import React from 'react';
import Link from 'next/link';
import { Question } from '@/Contracts/Question';
import { FaCheckCircle, FaComment, FaEye, FaClock, FaUser, FaCheck } from 'react-icons/fa';
import { FavoriteButton } from './FavoriteButton';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import ReactMarkdown from 'react-markdown';

interface QuestionCardProps {
    question: Question;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
    const { isRead } = useUserPreferences();

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <Link href={`/questoes/${question.id}`} className="block group">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-200">
                {/* Header: User & Meta */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-bold">
                            {question.userName?.charAt(0).toUpperCase() || <FaUser />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {question.userName || 'Anônimo'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <FaClock className="text-[10px]" />
                                {formatDate(question.createdAt)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isRead(question.id) && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium" title="Já visualizada">
                                <FaCheck className="text-[10px]" />
                                <span>Lida</span>
                            </div>
                        )}
                        <FavoriteButton questionId={question.id} className="text-lg" />
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {question.subjectName}
                        </span>
                    </div>
                </div>

                {/* Title & Content */}
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {question.title}
                    </h3>
                    <div className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                            components={{
                                // Override elements to prevent layout issues in preview
                                img: () => null, // Hide images in preview
                                h1: ({ children }: { children?: React.ReactNode }) => <span className="font-bold">{children}</span>,
                                h2: ({ children }: { children?: React.ReactNode }) => <span className="font-bold">{children}</span>,
                                h3: ({ children }: { children?: React.ReactNode }) => <span className="font-bold">{children}</span>,
                                p: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
                            }}
                        >
                            {question.text}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Footer: Stats & Status */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5" title="Visualizações">
                            <FaEye />
                            <span>{question.views}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Comentários">
                            <FaComment />
                            <span>{question.comments.length}</span>
                        </div>
                    </div>

                    {question.isVerified && (
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <FaCheckCircle />
                            <span>Verificada</span>
                        </div>
                    )}

                    {question.verificationRequested && !question.isVerified && (
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm font-medium px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <FaCheckCircle />
                            <span>Verificação Solicitada</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};
