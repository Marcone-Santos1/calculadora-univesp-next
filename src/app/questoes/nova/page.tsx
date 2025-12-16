import React from 'react';
import { QuestionForm } from '@/components/question/QuestionForm';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { getAllSubjects } from '@/actions/subject-actions';

export default async function NewQuestionPage() {
    const subjects = await getAllSubjects();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="container mx-auto max-w-3xl">
                <Link href="/questoes" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 mb-6">
                    <FaArrowLeft /> Voltar para Questões
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Nova Pergunta
                </h1>

                <QuestionForm subjects={subjects} />
            </div>
        </div>
    );
}
