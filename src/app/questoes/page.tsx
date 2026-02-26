/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react';
import { permanentRedirect } from 'next/navigation';
import { QuestionCard } from '@/components/question/QuestionCard';
import { QuestionSidebar } from '@/components/question/QuestionSidebar';
import { getQuestions, getSubjectsWithCounts } from '@/actions/question-actions';
import { getAdsForFeed } from '@/actions/ad-engine';
import NativeAdCard from '@/components/feed/NativeAdCard';
import SidebarAds from '@/components/feed/SidebarAds';
import Link from 'next/link';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { MobileFilterModal } from '@/components/question/MobileFilterModal';
import { SITE_CONFIG } from "@/utils/Constants";
import { Pagination } from '@/components/ui/Pagination';
import { Metadata } from "next";
import { Loading } from '@/components/Loading';
import { generateSlug, injectAdsWithRandomInterval, getQuestionPath } from '@/utils/functions';

export async function generateMetadata({ searchParams }: {
    searchParams: Promise<{
        q?: string;
        page?: string;
        verified?: string;
        verificationRequested?: string;
        activity?: string;
        sort?: string;
    }>;
}): Promise<Metadata> {
    const params = await searchParams;
    const {
        q: query,
        page,
        verified,
        verificationRequested,
        activity,
        sort,
    } = params;

    const baseUrl = SITE_CONFIG.BASE_URL;

    const hasNonIndexableFilters =
        !!query ||
        !!verified ||
        !!verificationRequested ||
        !!activity ||
        !!sort;

    const canonical = `${baseUrl}/questoes`;
    let title = "Questões Univesp Resolvidas: Estude para as Provas (Comunidade)";
    let description = "Prepare-se para o bimestre com questões reais e exercícios compartilhados por alunos. Filtre por disciplina, veja gabaritos comentados e passe sem sufoco.";

    const pageNum = page ? Number(page) : 1;
    if (pageNum > 1) {
        title = `${title} - Página ${pageNum}`;
    }

    const shouldIndex = !hasNonIndexableFilters;

    const ogImageUrl = `${baseUrl}/og-questoes.png`;

    const canonicalWithPage = pageNum > 1 ? `${canonical}?page=${pageNum}` : canonical;

    return {
        title: title,
        description: description,
        alternates: {
            canonical: canonicalWithPage,
        },
        openGraph: {
            title: title,
            description: description,
            url: canonicalWithPage,
            type: 'website',
            siteName: 'Calculadora Univesp',
            locale: 'pt_BR',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: 'Plataforma de Estudos Univesp',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [ogImageUrl],
        },
        robots: {
            index: shouldIndex,
            follow: true,
            googleBot: {
                index: shouldIndex,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

// Server Component (listagem geral — sem ?subject=; disciplina é sempre via /questoes/[slug])
const QuestionsContent = async ({ searchParams }: { searchParams: Promise<{ q?: string; verified?: string; verificationRequested?: string; activity?: string; sort?: string; page?: string }> }) => {
    const params = await searchParams;
    const query = params.q;
    const verified = params.verified;
    const verificationRequested = params.verificationRequested;
    const activity = params.activity;
    const sort = params.sort;
    const page = Number(params.page) || 1;

    // Fetch all data in parallel — saves ~2x latency vs sequential calls
    const [data, subjects, allAds] = await Promise.all([
        getQuestions(query, undefined, verified, verificationRequested, activity, sort, page),
        getSubjectsWithCounts(),
        getAdsForFeed(12, undefined),
    ]);

    const sidebarAds = allAds.slice(0, 2);
    const feedAds = allAds;
    const { questions, meta } = data;

    // Process feed items
    const feedItems = injectAdsWithRandomInterval(questions, feedAds);

    const breadcrumbListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_CONFIG.BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Questões', item: `${SITE_CONFIG.BASE_URL}/questoes` },
        ],
    };

    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        numberOfItems: meta.total,
        itemListElement: questions.slice(0, 20).map((q: any, i: number) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_CONFIG.BASE_URL}${getQuestionPath(q)}`,
            name: q.title,
        })),
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
            <SidebarAds ads={sidebarAds} />
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <Link
                                href="/questoes/nova"
                                className="flex items-center justify-center gap-2 w-full lg:w-72 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40 mb-6"
                            >
                                <FaPlus /> Nova Pergunta
                            </Link>
                            <QuestionSidebar
                                subjects={subjects}
                                questions={questions.map((q: any) => ({ id: q.id, title: q.title, subjectName: q.subjectName }))}
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
                                    questions={questions.map((q: any) => ({ id: q.id, title: q.title, subjectName: q.subjectName }))}
                                />
                            </div>
                        </div>

                        {/* Page Header — renderizado DENTRO do Suspense para mostrar query e total */}
                        <div className="mb-6">
                            <p className="text-gray-600 dark:text-gray-400">
                                {meta.total} {meta.total === 1 ? 'questão encontrada' : 'questões encontradas'}
                            </p>
                        </div>

                        {/* Questions Grid */}
                        <div className="space-y-4">
                            <div className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-4 mb-6 text-white flex justify-between items-center shadow-lg">
                                <div>
                                    <h3 className="font-bold text-lg">Quer divulgar sua marca aqui?</h3>
                                    <p className="text-blue-100 text-sm">Alcance milhares de estudantes da Univesp.</p>
                                </div>
                                <Link
                                    href="/anuncie"
                                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition"
                                >
                                    Saiba mais
                                </Link>
                            </div>
                            {feedItems.map((item: any, index: number) => (
                                <React.Fragment key={index}>
                                    {item.type === 'question' ? (
                                        <QuestionCard question={item.data} />
                                    ) : (
                                        <NativeAdCard ad={item.data} />
                                    )}
                                </React.Fragment>
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

                        {/* Pagination — sem subject nos params (disciplina é só via /questoes/[slug]) */}
                        <Pagination
                            currentPage={meta.page}
                            totalPages={meta.totalPages}
                            baseUrl="/questoes"
                            searchParams={Object.fromEntries(Object.entries(params).filter(([key]) => key !== 'subject'))}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string; verified?: string; verificationRequested?: string; activity?: string; sort?: string; page?: string }> }) {
    const params = await searchParams;
    if (params.subject) {
        const subjects = await getSubjectsWithCounts();
        const activeSubject = subjects.find((s) => s.name === params.subject);
        if (activeSubject) {
            permanentRedirect(`/questoes/${generateSlug(activeSubject.name)}`);
        }
    }

    // H1 title acima do Suspense — pinta imediatamente com o shell HTML em vez de esperar os DB queries
    // Isso faz o LCP acontecer junto ao FCP (~1.2s) em vez de esperar (~3.3s)
    const pageTitle = params.q ? `Resultados para "${params.q}"` : 'Todas as Questões';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto max-w-7xl px-4 pt-8 pb-2">
                {/* H1 fora do Suspense — é o LCP candidate; pinta antes dos dados carregarem */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pageTitle}
                </h1>
            </div>
            <Suspense fallback={<Loading />}>
                <QuestionsContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
