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
import { SITE_CONFIG } from "@/utils/Constants";
import { QuestionCard } from '@/components/question/QuestionCard';
import { FaShield } from 'react-icons/fa6';
import { getAdsForFeed } from '@/actions/ad-engine';
import NativeAdCard from '@/components/feed/NativeAdCard';
import { injectAdsWithRandomInterval } from '@/utils/functions';
import SidebarAds from '@/components/feed/SidebarAds';
import { Comment } from '@/Contracts/Question';

// Generate Dynamic Metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const question = await getQuestion(resolvedParams.id);

    if (!question) {
        return {
            title: 'Questão não encontrada | Calculadora Univesp',
            description: 'A questão que você procura não foi encontrada.',
            robots: {
                index: false,
                follow: false,
            }
        };
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

    return {
        title: `${seoTitle} | Calculadora Univesp`,
        description: description,
        openGraph: {
            title: question.title,
            description: description,
            type: 'article',
            url: `${SITE_CONFIG.BASE_URL}/questoes/${question.id}`,
            siteName: 'Calculadora Univesp',
        },
        alternates: {
            canonical: `${SITE_CONFIG.BASE_URL}/questoes/${question.id}`,
        },
    };
}

// Server Component
const QuestionDetailContent = async ({ id }: { id: string }) => {


    const question = await getQuestion(id);

    if (!question) {
        notFound();
    }

    const [ads, session] = await Promise.all([
        getAdsForFeed(6, question.subject?.id),
        auth()
    ]);

    const sidebarAds = ads.slice(0, 2);
    const middleAd = ads[2];
    const feedAds = ads.slice(3);

    const relatedQuestions = await getRelatedQuestions(question?.subject?.id || '', id);

    // Process feed items with remaining ads
    const feedItems = injectAdsWithRandomInterval(relatedQuestions, feedAds);


    const totalVotes = question.alternatives.reduce((acc: number, alt: any) => acc + alt.voteCount, 0);

    // Check if the current user has voted on this question
    let userHasVoted = false;
    let userVotedAlternativeId: string | undefined;

    if (session?.user?.id) {
        // Check if any alternative in this question has a vote from this user
        for (const alt of question.alternatives) {
            const userVote = alt.votes.find((vote: any) => vote.userId === session.user.id);
            if (userVote) {
                userHasVoted = true;
                userVotedAlternativeId = alt.id;
                break;
            }
        }
    }

    // JSON-LD Structured Data for Q&A Page
    const correctAlternative = question.alternatives.find((alt: any) => alt.isCorrect);

    // 2. Preparar a resposta aceita (se existir gabarito)
    let acceptedAnswer = undefined;
    if (correctAlternative) {
        acceptedAnswer = {
            '@type': 'Answer',
            text: `A resposta correta é a alternativa ${correctAlternative.letter}: ${correctAlternative.text}`,
            upvoteCount: correctAlternative.voteCount || 1,
            dateCreated: question.createdAt.toISOString(),
            author: {
                '@type': 'Organization',
                name: 'Calculadora Univesp Gabarito',
                url: SITE_CONFIG.BASE_URL
            }
        };
    }

    // 3. Contar total de respostas (Gabarito + Comentários)
    const totalAnswerCount = question.comments.length + (acceptedAnswer ? 1 : 0);

    // JSON-LD Structured Data for Q&A Page
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        mainEntity: {
            '@type': 'Question',
            name: question.title,
            text: question.text,
            answerCount: totalAnswerCount, // Atualizado
            upvoteCount: totalVotes,
            dateCreated: question.createdAt.toISOString(),
            author: {
                '@type': 'Person',
                name: question.userName || 'Usuário da Univesp',
                url: question.userId ? `${SITE_CONFIG.BASE_URL}/perfil/${question.userId}` : undefined,
            },
            acceptedAnswer: acceptedAnswer,
            suggestedAnswer: question.comments
                .filter((comment: Comment) => comment.text && comment.text.trim() !== "")
                .map((comment: Comment) => ({
                    '@type': 'Answer',
                    text: comment.text,
                    dateCreated: comment.createdAt.toISOString(),
                    upvoteCount: comment.votes.length,
                    url: `${SITE_CONFIG.BASE_URL}/questoes/${question.id}#comment-${comment.id}`,
                    author: {
                        '@type': 'Person',
                        name: comment.userName || 'Usuário',
                        url: comment.userId ? `${SITE_CONFIG.BASE_URL}/perfil/${comment.userId}` : undefined,
                    },
                })),
            relatedQuestions: relatedQuestions.map((question: any) => ({
                '@type': 'Question',
                name: question.title,
                text: question.text,
                answerCount: question.comments.length,
                upvoteCount: question.totalVotes,
                dateCreated: question.createdAt.toISOString(),
                url: `${SITE_CONFIG.BASE_URL}/questoes/${question.id}`,
                author: {
                    '@type': 'Person',
                    name: question.userName || 'Usuário da Univesp',
                    url: question.userId ? `${SITE_CONFIG.BASE_URL}/perfil/${question.userId}` : undefined,
                },
            })),
        },
    };
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 relative">
            <SidebarAds ads={sidebarAds} />
            {/* Structured Data Script */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <ViewTracker questionId={id} />
            <QuestionViewTracker questionId={id} />

            <div className="container mx-auto max-w-4xl">
                <Link href="/questoes" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 mb-6">
                    <FaArrowLeft /> Voltar para Questões
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex flex-wrap gap-2 mb-4">

                            <Link
                                href={`/questoes?subject=${encodeURIComponent(question.subjectName)}`}
                                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 transition-colors text-blue-700 rounded-full text-sm font-medium cursor-pointer"
                            >
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

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {question.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <FaUser />
                                {question.userId ? (
                                    <Link
                                        href={`/perfil/${question.userId}`}
                                        className="hover:text-blue-600 hover:underline transition-colors font-medium"
                                    >
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

                    {/* Content */}
                    <div className="p-6 md:p-8">
                        <div className="prose dark:prose-invert max-w-none mb-8 text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                            <ReactMarkdown>{question.text}</ReactMarkdown>
                        </div>

                        {/* Alternatives */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Alternativas
                            </h3>
                            <div className="grid gap-3">
                                {question.alternatives.map((alternative: any) => {
                                    return (
                                        <AlternativeItem
                                            key={alternative.id}
                                            alternative={alternative}
                                            totalVotes={totalVotes}
                                            onVote={async (id) => {
                                                'use server';
                                                if (!session?.user?.id) return;
                                                await voteOnAlternative(id);
                                            }}
                                            hasVoted={userHasVoted}
                                            isVerified={question.isVerified}
                                            isLoggedIn={!!session}
                                            userVotedId={userVotedAlternativeId}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-between gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <ValidationButton
                                questionId={question.id}
                                isVerified={question.isVerified}
                                isLoggedIn={!!session}
                                verificationRequested={(question as any).verificationRequested}
                            />

                            <ShareButton
                                questionId={question.id}
                                questionTitle={question.title}
                            />
                        </div>

                        {question.isVerified && (
                            <div className="mt-8 flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-4 rounded">
                                <FaShield className="text-blue-500" />
                                <p className="text-gray-800 dark:text-gray-200">
                                    Esta questão foi verificada por um de nossos administradores.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Ad Slot */}
                {middleAd && (
                    <div className="mb-8">
                        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest mb-2 block text-center">Publicidade</span>
                        <NativeAdCard ad={middleAd} />
                    </div>
                )}

                {/* Comments Section */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <FaComment className="text-blue-500" />
                        Discussão ({question.comments.length})
                    </h2>

                    <CommentSection
                        questionId={question.id}
                        comments={question.comments}
                        isLoggedIn={!!session}
                        currentUserId={session?.user?.id}
                    />
                </div>

                {/* Related Questions */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <FaQuestionCircle className="text-blue-500" />
                        Questões Relacionadas
                    </h2>

                    <div className="space-y-4">
                        {feedItems.map((item: any, index: number) => (
                            <React.Fragment key={index}>
                                {item.type === 'question' ? (
                                    <QuestionCard key={item.data.id} question={item.data} />
                                ) : (
                                    <NativeAdCard ad={item.data} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {relatedQuestions.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaBan className="text-2xl text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Nenhuma questão encontrada
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Nenhuma questão relacionada foi encontrada para esta pergunta.
                            </p>
                            <Link
                                href="/questoes/nova"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                <FaPlus /> Adicionar Questão
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return (
        <Suspense fallback={<Loading />}>
            <QuestionDetailContent id={resolvedParams.id} />
        </Suspense>
    );
}
