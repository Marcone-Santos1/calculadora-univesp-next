import React from 'react';
import Link from 'next/link';
import { Question } from '@/Contracts/Question';
import { FaCheckCircle, FaComment, FaEye, FaClock, FaUser } from 'react-icons/fa';

interface QuestionCardProps {
    question: Question;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${question.subject?.color
                            ? 'bg-opacity-10 text-opacity-100'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`} style={question.subject?.color ? { backgroundColor: `${question.subject.color}20`, color: question.subject.color } : {}}>
                        {question.subjectName}
                    </span>
                </div>

                {/* Title & Content */}
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {question.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
                        {question.text}
                    </p>
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
                </div>
            </div>
        </Link>
    );
};
