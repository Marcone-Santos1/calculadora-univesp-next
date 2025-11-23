import React, { Suspense } from 'react';
import { QuestionSearchBar } from '@/components/question/QuestionSearchBar';
import { SubjectCarousel } from '@/components/question/SubjectCarousel';
import { QuestionCard } from '@/components/question/QuestionCard';
import { getQuestions } from '@/actions/question-actions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';

// Server Component
const QuestionsContent = async ({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string }> }) => {
    const params = await searchParams;
    const query = params.q;
    const subjectId = params.subject;

    const questions = await getQuestions(query, subjectId);
    const subjects = await prisma.subject.findMany();

    const isSearchActive = !!query || !!subjectId;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Hero Section / Search Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm pb-8 pt-4 px-4">
                <div className="container mx-auto max-w-5xl">
                    {!isSearchActive ? (
                        <>
                            <QuestionSearchBar />
                            <SubjectCarousel subjects={subjects} />
                        </>
                    ) : (
                        <div className="flex items-center justify-between py-4">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {query ? `Resultados para "${query}"` : 'Questões por Matéria'}
                            </h1>
                            <Link href="/questoes" className="text-blue-600 hover:underline">
                                Voltar para o início
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto max-w-5xl px-4 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {isSearchActive ? `${questions.length} questões encontradas` : 'Últimas Questões'}
                    </h2>
                    <Link
                        href="/questoes/nova"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <FaPlus /> Nova Pergunta
                    </Link>
                </div>

                <div className="grid gap-4">
                    {questions.map((question: any) => (
                        <QuestionCard key={question.id} question={question} />
                    ))}

                    {questions.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            Nenhuma questão encontrada. Seja o primeiro a perguntar!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string }> }) {
    return (
        <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
            <QuestionsContent searchParams={searchParams} />
        </Suspense>
    );
}
