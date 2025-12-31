import React from 'react';
import { notFound } from 'next/navigation';
import { getQuestion } from '@/actions/question-actions';
import { getAllSubjects } from '@/actions/subject-actions';
import { QuestionForm } from '@/components/question/QuestionForm';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

interface AdminEditQuestionPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function AdminEditQuestionPage(props: AdminEditQuestionPageProps) {
    const params = await props.params;
    const { id } = params;

    const [question, subjects] = await Promise.all([
        getQuestion(id),
        getAllSubjects()
    ]);

    if (!question) {
        notFound();
    }

    // Transform question data to match form structure
    const initialData = {
        title: question.title,
        text: question.text,
        week: question.week || undefined,
        subjectId: question.subjectId,
        alternatives: question.alternatives.map(alt => ({
            id: alt.letter,
            text: alt.text
        }))
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="container mx-auto max-w-3xl">
                <Link href="/admin/questions" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 mb-6">
                    <FaArrowLeft /> Voltar para Admin Questions
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Editar Pergunta
                </h1>

                <QuestionForm
                    subjects={subjects}
                    initialData={initialData}
                    questionId={id}
                />
            </div>
        </div>
    );
}
