/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { QuestionCard } from '@/components/question/QuestionCard';
import { QuestionSidebar } from '@/components/question/QuestionSidebar';
import { getQuestion, getQuestions, getSubjectsWithCounts } from '@/actions/question-actions';
import { getAdsForFeed } from '@/actions/ad-engine';
import NativeAdCard from '@/components/feed/NativeAdCard';
import SidebarAds from '@/components/feed/SidebarAds';
import Link from 'next/link';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { MobileFilterModal } from '@/components/question/MobileFilterModal';
import { SITE_CONFIG } from '@/utils/Constants';
import { Pagination } from '@/components/ui/Pagination';
import { Metadata } from 'next';
import { Loading } from '@/components/Loading';
import { generateSlug, injectAdsWithRandomInterval, getQuestionPath } from '@/utils/functions';

// Garante que a rota não seja cacheada; o redirect principal é feito no middleware para evitar
// falha do permanentRedirect quando o usuário está logado (streaming/cookies).
export const dynamic = 'force-dynamic';

/**
 * Resolve o slug da disciplina para o nome (busca no banco).
 */
async function getSubjectBySlug(slug: string) {
    const subjects = await getSubjectsWithCounts();
    return subjects.find((s) => generateSlug(s.name) === slug) ?? null;
}

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ segment: string }>;
    searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
    const { segment } = await params;
    const { page } = await searchParams;
    const question = await getQuestion(segment);
    if (question) {
        const canonicalPath = getQuestionPath(question);
        return {
            title: `${question.title} | Calculadora Univesp`,
            robots: { index: false, follow: true },
        };
    }
    const subject = await getSubjectBySlug(segment);
    if (!subject) {
        return {
            title: 'Disciplina não encontrada | Calculadora Univesp',
            robots: { index: false, follow: false },
        };
    }
    const baseUrl = SITE_CONFIG.BASE_URL;
    const pageNum = page ? Number(page) : 1;
    let canonical = `${baseUrl}/questoes/${segment}`;
    if (pageNum > 1) {
        canonical = `${canonical}?page=${pageNum}`;
    }
    let title = `Questões de ${subject.name} Univesp | Gabaritos e Revisão`;
    if (pageNum > 1) {
        title = `${title} - Página ${pageNum}`;
    }
    const description = `Está estudando ${subject.name}? Acesse exercícios resolvidos e questões de provas anteriores da Univesp para treinar e tirar suas dúvidas.`;
    const ogImageUrl = `${baseUrl}/og-questoes.png`;
    return {
        title,
        description,
        alternates: { canonical },
        openGraph: { title, description, url: canonical, type: 'website', siteName: 'Calculadora Univesp', locale: 'pt_BR', images: [{ url: ogImageUrl, width: 1200, height: 630, alt: subject.name }] },
        twitter: { card: 'summary_large_image', title, description, images: [ogImageUrl] },
        robots: { index: true, follow: true },
    };
}

type SegmentSearchParams = {
    page?: string;
    q?: string;
    sort?: string;
    activity?: string;
    verified?: string;
    verificationRequested?: string;
};

const SubjectQuestionsContent = async ({
    segmentSlug,
    searchParams,
}: {
    segmentSlug: string;
    searchParams: Promise<SegmentSearchParams>;
}) => {
    const subject = await getSubjectBySlug(segmentSlug);
    if (!subject) notFound();

    const params = await searchParams;
    const page = Number(params.page) || 1;

    // Fetch all data in parallel — saves ~2x latency vs sequential calls
    const [data, subjects, allAds] = await Promise.all([
        getQuestions(
            params.q,
            subject.name,
            params.verified,
            params.verificationRequested,
            params.activity,
            params.sort,
            page,
        ),
        getSubjectsWithCounts(),
        getAdsForFeed(12, subject.id),
    ]);

    const { questions, meta } = data;
    const sidebarAds = allAds.slice(0, 2);
    const feedAds = allAds;
    const feedItems = injectAdsWithRandomInterval(questions, feedAds);

    const baseUrl = SITE_CONFIG.BASE_URL;
    const canonical = `${baseUrl}/questoes/${segmentSlug}`;

    const breadcrumbListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: 'Questões', item: `${baseUrl}/questoes` },
            { '@type': 'ListItem', position: 3, name: subject.name, item: canonical },
        ],
    };

    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        numberOfItems: meta.total,
        itemListElement: questions.slice(0, 20).map((q: any, i: number) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${baseUrl}${getQuestionPath(q)}`,
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
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <Link href="/questoes/nova" className="flex items-center justify-center gap-2 w-full lg:w-72 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40 mb-6">
                                <FaPlus /> Nova Pergunta
                            </Link>
                            <QuestionSidebar
                                subjects={subjects}
                                questions={questions.map((q: any) => ({ id: q.id, title: q.title, subjectName: q.subjectName }))}
                                currentSubjectSlug={segmentSlug}
                            />
                        </div>
                    </aside>
                    <main className="flex-1">
                        <div className="lg:hidden mb-6">
                            <div className="flex gap-3 mb-4">
                                <Link href="/questoes/nova" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20">
                                    <FaPlus /> Nova
                                </Link>
                                <MobileFilterModal subjects={subjects} questions={questions.map((q: any) => ({ id: q.id, title: q.title, subjectName: q.subjectName }))} currentSubjectSlug={segmentSlug} />
                            </div>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-600 dark:text-gray-400">
                                {meta.total} {meta.total === 1 ? 'questão encontrada' : 'questões encontradas'}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-4 mb-6 text-white flex justify-between items-center shadow-lg">
                                <div>
                                    <h3 className="font-bold text-lg">Quer divulgar sua marca aqui?</h3>
                                    <p className="text-blue-100 text-sm">Alcance milhares de estudantes da Univesp.</p>
                                </div>
                                <Link href="/anuncie" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition">Saiba mais</Link>
                            </div>
                            {feedItems.map((item: any, index: number) => (
                                <React.Fragment key={index}>
                                    {item.type === 'question' ? <QuestionCard question={item.data} /> : <NativeAdCard ad={item.data} />}
                                </React.Fragment>
                            ))}
                            {questions.length === 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaFilter className="text-2xl text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhuma questão nesta disciplina</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">Seja o primeiro a publicar uma questão aqui.</p>
                                    <Link href="/questoes/nova" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                                        <FaPlus /> Criar Pergunta
                                    </Link>
                                </div>
                            )}
                        </div>
                        <Pagination currentPage={meta.page} totalPages={meta.totalPages} baseUrl={`/questoes/${segmentSlug}`} searchParams={params} pageParamName="page" />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default async function SegmentPage({
    params,
    searchParams,
}: {
    params: Promise<{ segment: string }>;
    searchParams: Promise<SegmentSearchParams>;
}) {
    const { segment } = await params;

    const question = await getQuestion(segment);
    if (question) {
        permanentRedirect(getQuestionPath({ id: question.id, title: question.title, subjectName: question.subjectName, subject: question.subject ?? null }));
    }

    // Deriva um título legível do slug para pintar o H1 antes dos DB queries resolverem
    const slugTitle = segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto max-w-7xl px-4 pt-8 pb-2">
                {/* H1 fora do Suspense — é o LCP candidate */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {slugTitle}
                </h1>
            </div>
            <Suspense fallback={<Loading />}>
                <SubjectQuestionsContent segmentSlug={segment} searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
