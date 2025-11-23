import React from 'react';
import Link from 'next/link';
import { Question } from '@/Contracts/Question';
import { FaCheckCircle, FaComment, FaEye } from 'react-icons/fa';

interface QuestionCardProps {
    question: Question;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
    return (
        <Link href={`/questoes/${question.id}`} className="block group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {question.subjectName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {question.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                    {question.text}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <FaEye /> {question.views}
                    </div>
                    <div className="flex items-center gap-1">
                        <FaComment /> {question.comments.length}
                    </div>
                    {question.isVerified && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                            <FaCheckCircle /> Verificada
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};
