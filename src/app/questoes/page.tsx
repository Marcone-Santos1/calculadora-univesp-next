/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react';
import { QuestionCard } from '@/components/question/QuestionCard';
import { QuestionSidebar } from '@/components/question/QuestionSidebar';
import { getQuestions, getSubjectsWithCounts } from '@/actions/question-actions';
import Link from 'next/link';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { MobileFilterModal } from '@/components/question/MobileFilterModal';
import {SITE_CONFIG} from "@/utils/Constants";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string }> }): Promise<Metadata> {
    const params = await searchParams;
    const { q: query, subject: subjectName } = params;

    // Título e Descrição Padrão (Fallback)
    let title = "Banco de Questões UNIVESP | Provas Anteriores e Gabaritos";
    let description = "Acesse milhares de questões de provas passadas da UNIVESP. Estude por disciplina, veja gabaritos comentados e prepare-se para o bimestre.";
    
    // URL Canônica Base
    const baseUrl = SITE_CONFIG.BASE_URL;
    let canonical = baseUrl;

    // Lógica Dinâmica: Se houver filtro de Matéria, ajustamos o SEO
    if (subjectId) {
        // Reutilizamos a server action para pegar o nome da matéria sem custo extra (cache do Next.js)
        const subjects = await getSubjectsWithCounts(); 
        const activeSubject = subjects.find(s => s.name === subjectName);
        
        if (activeSubject) {
            title = `Questões de ${activeSubject.name} | UNIVESP - Provas e Exercícios`;
            description = `Lista de exercícios e questões de prova de ${activeSubject.name} da Univesp. Estude com gabarito comentado e passe na matéria.`;
            // IMPORTANTE: Indexamos a URL com parâmetro se for uma categoria relevante
            canonical = `${baseUrl}?subject=${subjectName}`;
        }
    } else if (query) {
        title = `Resultados para "${query}" | Questões Univesp`;
        // Páginas de busca interna geralmente não devem ser indexadas para evitar spam, 
        // mas aqui mantemos o canonical para a raiz para transferir autoridade.
        canonical = baseUrl;
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
                    alt: 'Banco de Questões Univesp',
                },
            ],
        },
        robots: {
            index: true,
            follow: true,
            // Evita que o Google indexe combinações infinitas de filtros (ex: sort + activity + verified)
            // Focamos apenas na URL limpa ou na URL de Categoria (Materia)
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
    const subjectId = params.subject;
    const verified = params.verified;
    const verificationRequested = params.verificationRequested;
    const activity = params.activity;
    const sort = params.sort;

    const [questions, subjects] = await Promise.all([
        getQuestions(query, subjectId, verified, verificationRequested, activity, sort),
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
                            <QuestionSidebar
                                subjects={subjects}
                                questions={questions.map(q => ({ id: q.id, title: q.title, subjectId: q.subjectId }))}
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
                                    questions={questions.map(q => ({ id: q.id, title: q.title, subjectId: q.subjectId }))}
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

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string; verified?: string; verificationRequested?: string; activity?: string; sort?: string }> }) {
    return (
        <Suspense fallback={<Loading />}>
            <QuestionsContent searchParams={searchParams} />
        </Suspense>
    );
}

