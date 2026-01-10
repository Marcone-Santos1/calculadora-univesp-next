'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaQuestionCircle, FaComment, FaClock } from 'react-icons/fa';

interface Question {
    id: string;
    title: string;
    createdAt: Date;
    subject: {
        name: string;
    };
    _count: {
        comments: number;
    };
}

interface Comment {
    id: string;
    text: string;
    createdAt: Date;
    question: {
        id: string;
        title: string;
        subject: {
            name: string;
        };
    };
}

import { Pagination } from '@/components/ui/Pagination';
import { useSearchParams } from 'next/navigation';

interface UserActivityListProps {
    questions: {
        data: Question[];
        meta: {
            page: number;
            totalPages: number;
            total: number;
        };
    };
    comments: {
        data: Comment[];
        meta: {
            page: number;
            totalPages: number;
            total: number;
        };
    };
}

export function UserActivityList({ questions, comments }: UserActivityListProps) {
    const [activeTab, setActiveTab] = useState<'questions' | 'comments'>('questions');
    const searchParams = useSearchParams();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${activeTab === 'questions'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <FaQuestionCircle />
                        Minhas Questões ({questions.meta.total})
                    </div>
                    {activeTab === 'questions' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${activeTab === 'comments'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <FaComment />
                        Meus Comentários ({comments.meta.total})
                    </div>
                    {activeTab === 'comments' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'questions' ? (
                    <div className="space-y-4">
                        {questions.data.length > 0 ? (
                            <>
                                {questions.data.map((question) => (
                                    <Link
                                        key={question.id}
                                        href={`/questoes/${question.id}`}
                                        className="block p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="inline-block px-2 py-1 mb-2 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                                    {question.subject.name}
                                                </span>
                                                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {question.title}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <FaClock className="text-xs" />
                                                        {new Date(question.createdAt).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaComment className="text-xs" />
                                                        {question._count.comments} comentários
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                <Pagination
                                    currentPage={questions.meta.page}
                                    totalPages={questions.meta.totalPages}
                                    baseUrl="/perfil"
                                    searchParams={Object.fromEntries(searchParams.entries())}
                                    pageParamName="qPage"
                                />
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                Você ainda não fez nenhuma pergunta.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.data.length > 0 ? (
                            <>
                                {comments.data.map((comment) => (
                                    <Link
                                        key={comment.id}
                                        href={`/questoes/${comment.question.id}`}
                                        className="block p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 transition-all group"
                                    >
                                        <div className="mb-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Em: <span className="font-medium text-gray-900 dark:text-white">{comment.question.title}</span>
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                                            "{comment.text}"
                                        </p>
                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <FaClock />
                                            {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    </Link>
                                ))}
                                <Pagination
                                    currentPage={comments.meta.page}
                                    totalPages={comments.meta.totalPages}
                                    baseUrl="/perfil"
                                    searchParams={Object.fromEntries(searchParams.entries())}
                                    pageParamName="cPage"
                                />
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                Você ainda não fez nenhum comentário.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
