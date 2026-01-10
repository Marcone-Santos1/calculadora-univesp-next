'use client';

import React from 'react';
import Link from 'next/link';
import { Question } from '@/Contracts/Question';
import { FaCheckCircle, FaComment, FaEye, FaClock, FaUser, FaCheck } from 'react-icons/fa';
import { FavoriteButton } from './FavoriteButton';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import ReactMarkdown from 'react-markdown';
import { UserBadge } from '@/components/gamification/UserBadge';

import Image from 'next/image';

interface QuestionCardProps {
    question: Question & {
        user?: {
            id: string;
            name: string | null;
            image: string | null;
            reputation: number;
        };
    };
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
        <div className="block group">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-200">
                {/* Header: User & Meta */}
                <div className="flex items-start md:items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm md:text-base font-bold overflow-hidden relative flex-shrink-0">
                            {question.user ? (
                                <Link href={`/perfil/${question.user.id}`} className="w-full h-full flex items-center justify-center hover:opacity-80 transition-opacity relative">
                                    {question.user.image ? (
                                        <Image
                                            src={question.user.image}
                                            alt={question.userName || 'User'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 32px, 40px"
                                        />
                                    ) : (
                                        question.userName?.charAt(0).toUpperCase() || <FaUser />
                                    )}
                                </Link>
                            ) : (
                                question.userName?.charAt(0).toUpperCase() || <FaUser />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap">
                                {question.user ? (
                                    <Link
                                        href={`/perfil/${question.user.id}`}
                                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        {question.userName || 'Anônimo'}
                                    </Link>
                                ) : (
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {question.userName || 'Anônimo'}
                                    </span>
                                )}
                                <span className="hidden md:block">
                                    {question.user && <UserBadge reputation={question.user.reputation} />}
                                </span>
                            </div>
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
                                <span className="hidden sm:inline">Lida</span>
                            </div>
                        )}
                        <FavoriteButton questionId={question.id} className="text-lg" />
                    </div>
                </div>

                {/* Title & Content */}
                <div className="mb-4">
                    <Link href={`/questoes/${question.id}`} className="block">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {question.title}
                        </h3>
                    </Link>
                    <div className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed prose dark:prose-invert prose-sm max-w-none">
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
                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 gap-y-3">
                    <div className="flex items-center gap-3">
                        <a href={`/questoes?subject=${question.subject?.name}`} className="inline-block px-2.5 py-1 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 max-w-[140px] truncate">
                            {question.subject?.name}
                        </a>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5" title="Visualizações">
                                <FaEye className="text-xs" />
                                <span>{question.views}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Comentários">
                                <FaComment className="text-xs" />
                                <span>{question.comments.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {question.isVerified && (
                            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-medium px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <FaCheckCircle />
                                <span className="hidden sm:inline">Verificada</span>
                            </div>
                        )}

                        {question.verificationRequested && !question.isVerified && (
                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-medium px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <FaCheckCircle />
                                <span className="hidden sm:inline">Em análise</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
