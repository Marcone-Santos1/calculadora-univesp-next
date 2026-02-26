/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getQuestion, getRelatedQuestions, voteOnAlternative } from '@/actions/question-actions';
import { AlternativeItem } from '@/components/question/AlternativeItem';
import { ShareButton } from '@/components/question/ShareButton';
import { ValidationButton } from '@/components/question/ValidationButton';
import { CommentSection } from '@/components/question/CommentSection';
import { ViewTracker } from '@/components/question/ViewTracker';
import { QuestionViewTracker } from '@/components/question/QuestionViewTracker';
import { ReportButton } from '@/components/report/ReportButton';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { FaArrowLeft, FaCheckCircle, FaEye, FaComment, FaUser, FaClock, FaPlus, FaQuestionCircle, FaBan } from 'react-icons/fa';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import { Loading } from '@/components/Loading';
import { SITE_CONFIG } from '@/utils/Constants';
import { QuestionCard } from '@/components/question/QuestionCard';
import { FaShield } from 'react-icons/fa6';
import { getAdsForFeed } from '@/actions/ad-engine';
import NativeAdCard from '@/components/feed/NativeAdCard';
import { injectAdsWithRandomInterval, extractQuestionIdFromSlug, getQuestionPath } from '@/utils/functions';
import SidebarAds from '@/components/feed/SidebarAds';
import { Comment } from '@/Contracts/Question';

function getQuestionIdFromParams(slug: string): string | null {
    return extractQuestionIdFromSlug(slug);
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ segment: string; slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const id = getQuestionIdFromParams(slug);
    if (!id) {
        return { title: 'Questão não encontrada | Calculadora Univesp', description: 'A questão que você procura não foi encontrada.', robots: { index: false, follow: false } };
    }
    const question = await getQuestion(id);
    if (!question) {
        return { title: 'Questão não encontrada | Calculadora Univesp', description: 'A questão que você procura não foi encontrada.', robots: { index: false, follow: false } };
    }
    const description = question.text.substring(0, 155) + (question.text.length > 155 ? '...' : '');
    let seoTitle = question.title;
    const isGenericTitle = question.title.length < 20 || /^(dúvida|ajuda|questão|pergunta|exercício)/i.test(question.title);
    if (isGenericTitle) {
        const cleanText = question.text.replace(/[#*`]/g, '').substring(0, 60);
        seoTitle = `${question.subjectName}: ${cleanText}...`;
    } else {
        seoTitle = `${question.title} | ${question.subjectName}`;
    }
    const fullTitle = `${seoTitle} | Calculadora Univesp`;
    const canonicalPath = getQuestionPath({ id: question.id, title: question.title, subjectName: question.subjectName, subject: question.subject ?? null });
    const pageUrl = `${SITE_CONFIG.BASE_URL}${canonicalPath}`;
    const ogImageUrl = `${pageUrl}/opengraph-image`;
    return {
        title: fullTitle,
        description,
        openGraph: { title: fullTitle, description, type: 'article', url: pageUrl, siteName: 'Calculadora Univesp', locale: 'pt_BR', images: [{ url: ogImageUrl, width: 1200, height: 630, alt: question.title }] },
        twitter: { card: 'summary_large_image', title: fullTitle, description, images: [ogImageUrl] },
        alternates: { canonical: pageUrl },
    };
}

const QuestionDetailContent = async ({ subjectSlug, slug, id }: { subjectSlug: string; slug: string; id: string }) => {
    const question = await getQuestion(id);
    if (!question) notFound();

    const [ads, session] = await Promise.all([getAdsForFeed(6, question.subject?.id), auth()]);
    const sidebarAds = ads.slice(0, 2);
    const middleAd = ads[2];
    const feedAds = ads.slice(3);
    const relatedQuestions = await getRelatedQuestions(question?.subject?.id || '', id);
    const feedItems = injectAdsWithRandomInterval(relatedQuestions, feedAds);

    const totalVotes = question.alternatives.reduce((acc: number, alt: any) => acc + alt.voteCount, 0);
    let userHasVoted = false;
    let userVotedAlternativeId: string | undefined;
    if (session?.user?.id) {
        for (const alt of question.alternatives) {
            const userVote = alt.votes.find((v: any) => v.userId === session.user.id);
            if (userVote) {
                userHasVoted = true;
                userVotedAlternativeId = alt.id;
                break;
            }
        }
    }

    const correctAlternative = question.alternatives.find((alt: any) => alt.isCorrect);
    let acceptedAnswer: any = undefined;
    if (correctAlternative) {
        acceptedAnswer = {
            '@type': 'Answer',
            text: `A resposta correta é a alternativa ${correctAlternative.letter}: ${correctAlternative.text}`,
            upvoteCount: correctAlternative.voteCount || 1,
            dateCreated: question.createdAt.toISOString(),
            author: { '@type': 'Organization', name: 'Calculadora Univesp Gabarito', url: SITE_CONFIG.BASE_URL },
        };
    }
    const totalAnswerCount = question.comments.length + (acceptedAnswer ? 1 : 0);
    const questionUrl = `${SITE_CONFIG.BASE_URL}${getQuestionPath(question)}`;

    const qaPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        mainEntity: {
            '@type': 'Question',
            name: question.title,
            text: question.text,
            answerCount: totalAnswerCount,
            upvoteCount: totalVotes,
            dateCreated: question.createdAt.toISOString(),
            author: { '@type': 'Person', name: question.userName || 'Usuário da Univesp', url: question.userId ? `${SITE_CONFIG.BASE_URL}/perfil/${question.userId}` : undefined },
            acceptedAnswer: acceptedAnswer,
            suggestedAnswer: question.comments
                .filter((c: Comment) => c.text && c.text.trim() !== '')
                .map((c: Comment) => ({
                    '@type': 'Answer',
                    text: c.text,
                    dateCreated: c.createdAt.toISOString(),
                    upvoteCount: c.votes.length,
                    url: `${questionUrl}#comment-${c.id}`,
                    author: { '@type': 'Person', name: c.userName || 'Usuário', url: c.userId ? `${SITE_CONFIG.BASE_URL}/perfil/${c.userId}` : undefined },
                })),
        },
    };

    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: question.title,
        description: question.text.substring(0, 160) + (question.text.length > 160 ? '...' : ''),
        url: questionUrl,
        datePublished: question.createdAt.toISOString(),
        dateModified: (question as any).updatedAt ? new Date((question as any).updatedAt).toISOString() : question.createdAt.toISOString(),
        author: { '@type': 'Person', name: question.userName || 'Usuário da Univesp', url: question.userId ? `${SITE_CONFIG.BASE_URL}/perfil/${question.userId}` : undefined },
    };

    const breadcrumbListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_CONFIG.BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Questões', item: `${SITE_CONFIG.BASE_URL}/questoes` },
            { '@type': 'ListItem', position: 3, name: question.subjectName, item: `${SITE_CONFIG.BASE_URL}/questoes/${subjectSlug}` },
            { '@type': 'ListItem', position: 4, name: question.title, item: questionUrl },
        ],
    };

    const relatedItemListJsonLd =
        relatedQuestions.length > 0
            ? {
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: 'Questões relacionadas',
                numberOfItems: relatedQuestions.length,
                itemListElement: relatedQuestions.map((q: any, i: number) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_CONFIG.BASE_URL}${getQuestionPath(q)}`, name: q.title })),
            }
            : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 relative">
            <SidebarAds ads={sidebarAds} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(qaPageJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd) }} />
            {relatedItemListJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedItemListJsonLd) }} />}

            <ViewTracker questionId={id} />
            <QuestionViewTracker questionId={id} />

            <div className="container mx-auto max-w-4xl">
                <Link href="/questoes" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 mb-6">
                    <FaArrowLeft /> Voltar para Questões
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                    <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Link href={`/questoes/${subjectSlug}`} className="px-3 py-1 bg-blue-100 hover:bg-blue-200 transition-colors text-blue-700 rounded-full text-sm font-medium cursor-pointer">
                                {question.subjectName}
                            </Link>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
                                Semana {question.week?.toLowerCase().replace('semana', '')}
                            </span>
                            {question.isVerified && (
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium flex items-center gap-1">
                                    <FaCheckCircle className="text-xs" /> Verificada
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{question.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <FaUser />
                                {question.userId ? (
                                    <Link href={`/perfil/${question.userId}`} className="hover:text-blue-600 hover:underline transition-colors font-medium">
                                        {question.userName || 'Usuário Univesp'}
                                    </Link>
                                ) : (
                                    <span>{question.userName || 'Anônimo'}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <FaClock />
                                <span>{new Date(question.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <FaEye />
                                <span>{question.views} visualizações</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <FaComment />
                                <span>{question.comments.length} comentários</span>
                            </div>
                            <ReportButton questionId={question.id} />
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <div className="prose dark:prose-invert max-w-none mb-8 text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                            <ReactMarkdown>{question.text}</ReactMarkdown>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Alternativas</h3>
                            <div className="grid gap-3">
                                {question.alternatives.map((alt: any) => (
                                    <AlternativeItem
                                        key={alt.id}
                                        alternative={alt}
                                        totalVotes={totalVotes}
                                        onVote={voteOnAlternative}
                                        hasVoted={userHasVoted}
                                        isVerified={question.isVerified}
                                        isLoggedIn={!!session}
                                        userVotedId={userVotedAlternativeId}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-between gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <ValidationButton questionId={question.id} isVerified={question.isVerified} isLoggedIn={!!session} verificationRequested={(question as any).verificationRequested} />
                            <ShareButton questionId={question.id} questionTitle={question.title} questionPath={getQuestionPath(question)} />
                        </div>
                        {question.isVerified && (
                            <div className="mt-8 flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-4 rounded">
                                <FaShield className="text-blue-500" />
                                <p className="text-gray-800 dark:text-gray-200">Esta questão foi verificada por um de nossos administradores.</p>
                            </div>
                        )}
                    </div>
                </div>

                {middleAd && (
                    <div className="mb-8">
                        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest mb-2 block text-center">Publicidade</span>
                        <NativeAdCard ad={middleAd} />
                    </div>
                )}

                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <FaComment className="text-blue-500" />
                        Discussão ({question.comments.length})
                    </h2>
                    <CommentSection questionId={question.id} comments={question.comments} isLoggedIn={!!session} currentUserId={session?.user?.id} />
                </div>

                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <FaQuestionCircle className="text-blue-500" />
                        Questões Relacionadas
                    </h2>
                    <div className="space-y-4">
                        {feedItems.map((item: any, index: number) => (
                            <React.Fragment key={index}>
                                {item.type === 'question' ? <QuestionCard key={item.data.id} question={item.data} /> : <NativeAdCard ad={item.data} />}
                            </React.Fragment>
                        ))}
                    </div>
                    {relatedQuestions.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaBan className="text-2xl text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhuma questão encontrada</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Nenhuma questão relacionada foi encontrada para esta pergunta.</p>
                            <Link href="/questoes/nova" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                                <FaPlus /> Adicionar Questão
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default async function QuestionDetailPage({ params }: { params: Promise<{ segment: string; slug: string }> }) {
    const { segment, slug } = await params;
    const id = getQuestionIdFromParams(slug);
    if (!id) notFound();
    return (
        <Suspense fallback={<Loading />}>
            <QuestionDetailContent subjectSlug={segment} slug={slug} id={id} />
        </Suspense>
    );
}
