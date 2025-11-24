/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react';
import { QuestionCard } from '@/components/question/QuestionCard';
import { QuestionSidebar } from '@/components/question/QuestionSidebar';
import { getQuestions, getSubjectsWithCounts } from '@/actions/question-actions';
import Link from 'next/link';
import { FaPlus, FaFilter } from 'react-icons/fa';

// Server Component
const QuestionsContent = async ({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string; verified?: string }> }) => {
    const params = await searchParams;
    const query = params.q;
    const subjectId = params.subject;
    const verified = params.verified;

    const [questions, subjects] = await Promise.all([
        getQuestions(query, subjectId, verified),
        getSubjectsWithCounts()
    ]);

    const activeSubject = subjects.find(s => s.id === subjectId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <Link
                                href="/questoes/nova"
                                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40 mb-6"
                            >
                                <FaPlus /> Nova Pergunta
                            </Link>
                            <QuestionSidebar subjects={subjects} />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Mobile Header & Actions */}
                        <div className="lg:hidden mb-6 space-y-4">
                            <Link
                                href="/questoes/nova"
                                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20"
                            >
                                <FaPlus /> Nova Pergunta
                            </Link>
                            {/* Mobile Filter Toggle could go here */}
                        </div>

                        {/* Page Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {query
                                    ? `Resultados para "${query}"`
                                    : activeSubject
                                        ? activeSubject.name
                                        : 'Todas as Questões'
                                }
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {questions.length} {questions.length === 1 ? 'questão encontrada' : 'questões encontradas'}
                            </p>
                        </div>

                        {/* Questions Grid */}
                        <div className="space-y-4">
                            {questions.map((question: any) => (
                                <QuestionCard key={question.id} question={question} />
                            ))}

                            {questions.length === 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaFilter className="text-2xl text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        Nenhuma questão encontrada
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Tente ajustar seus filtros ou faça uma nova pergunta.
                                    </p>
                                    <Link
                                        href="/questoes/nova"
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                                    >
                                        <FaPlus /> Criar Pergunta
                                    </Link>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

import { Loading } from '@/components/Loading';

// ...

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string; verified?: string }> }) {
    return (
        <Suspense fallback={<Loading />}>
            <QuestionsContent searchParams={searchParams} />
        </Suspense>
    );
}
