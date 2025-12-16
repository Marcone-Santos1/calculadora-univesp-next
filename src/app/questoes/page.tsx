/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react';
import { QuestionCard } from '@/components/question/QuestionCard';
import { QuestionSidebar } from '@/components/question/QuestionSidebar';
import { getQuestions, getSubjectsWithCounts } from '@/actions/question-actions';
import Link from 'next/link';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { MobileFilterModal } from '@/components/question/MobileFilterModal';
import { SITE_CONFIG } from "@/utils/Constants";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string }> }): Promise<Metadata> {
    const params = await searchParams;
    const { q: query, subject: subjectName } = params;

    // URL base para Canonical (Evita duplicação de conteúdo)
    const baseUrl = SITE_CONFIG.BASE_URL;
    let canonical = baseUrl;

    // 1. Copywriting Padrão (Forte e Focado em Resultado)
    let title = "Questões Univesp Resolvidas: Estude para as Provas (Comunidade)";
    let description = "Prepare-se para o bimestre com questões reais e exercícios compartilhados por alunos. Filtre por disciplina, veja gabaritos comentados e passe sem sufoco.";

    // 2. Lógica Dinâmica para Matérias (O Pulo do Gato para o Google)
    if (subjectName) {
        // Buscamos o nome da matéria para colocar no Título do Google
        const subjects = await getSubjectsWithCounts();
        const activeSubject = subjects.find(s => s.name === subjectName); // Ajuste se seu objeto usar 'id' ou 'name'

        if (activeSubject) {
            title = `Questões de ${activeSubject.name} Univesp | Gabaritos e Revisão`;
            description = `Está estudando ${activeSubject.name}? Acesse exercícios resolvidos e questões de provas anteriores da Univesp para treinar e tirar suas dúvidas.`;
            canonical = `${baseUrl}?subject=${subjectName}`;
        }
    }
    // 3. Lógica para Busca Interna
    else if (query) {
        title = `Busca por "${query}" | Questões e Dúvidas Univesp`;
        description = `Resultados encontrados para "${query}" na nossa base colaborativa de questões e estudos.`;
        canonical = baseUrl; // Mantém a autoridade na raiz em buscas aleatórias
    }

    return {
        title: title,
        description: description,
        alternates: {
            canonical: canonical,
        },
        openGraph: {
            title: title,
            description: description,
            url: canonical,
            type: 'website',
            siteName: 'Calculadora Univesp',
            locale: 'pt_BR',
            images: [
                {
                    url: '/og-questoes.png',
                    width: 1200,
                    height: 630,
                    alt: 'Plataforma de Estudos Univesp',
                },
            ],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

// Server Component
const QuestionsContent = async ({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string; verified?: string; verificationRequested?: string; activity?: string; sort?: string }> }) => {
    const params = await searchParams;
    const query = params.q;
    const subject = params.subject;
    const verified = params.verified;
    const verificationRequested = params.verificationRequested;
    const activity = params.activity;
    const sort = params.sort;

    const [questions, subjects] = await Promise.all([
        getQuestions(query, subject, verified, verificationRequested, activity, sort),
        getSubjectsWithCounts()
    ]);

    const activeSubject = subjects.find(s => s.name === subject);

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
                            <QuestionSidebar
                                subjects={subjects}
                                questions={questions.map(q => ({ id: q.id, title: q.title, subjectName: q.subjectName }))}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Mobile Header & Actions */}
                        <div className="lg:hidden mb-6">
                            <div className="flex gap-3 mb-4">
                                <Link
                                    href="/questoes/nova"
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20"
                                >
                                    <FaPlus /> Nova
                                </Link>
                                <MobileFilterModal
                                    subjects={subjects}
                                    questions={questions.map(q => ({ id: q.id, title: q.title, subjectName: q.subjectName }))}
                                />
                            </div>
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
import { Metadata } from "next";

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string; verified?: string; verificationRequested?: string; activity?: string; sort?: string }> }) {
    return (
        <Suspense fallback={<Loading />}>
            <QuestionsContent searchParams={searchParams} />
        </Suspense>
    );
}

