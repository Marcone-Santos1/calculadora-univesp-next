/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getQuestion, voteOnAlternative } from '@/actions/question-actions';
import { AlternativeItem } from '@/components/question/AlternativeItem';
import { ShareButton } from '@/components/question/ShareButton';
import { ValidationButton } from '@/components/question/ValidationButton';
import { CommentSection } from '@/components/question/CommentSection';
import { ViewTracker } from '@/components/question/ViewTracker';
import { QuestionViewTracker } from '@/components/question/QuestionViewTracker';
import { ReportButton } from '@/components/report/ReportButton';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { FaArrowLeft, FaCheckCircle, FaEye, FaComment, FaUser, FaClock } from 'react-icons/fa';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import { Loading } from '@/components/Loading';
import {SITE_CONFIG} from "@/utils/Constants";

// Generate Dynamic Metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const question = await getQuestion(resolvedParams.id);

    if (!question) {
        return {
            title: 'Questão não encontrada | Calculadora Univesp',
            description: 'A questão que você procura não foi encontrada.',
        };
    }

    const description = question.text.substring(0, 155) + (question.text.length > 155 ? '...' : '');

    return {
        title: `${question.title} | Calculadora Univesp`,
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
    const session = await auth();

    if (!question) {
        notFound();
    }

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
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        mainEntity: {
            '@type': 'Question',
            name: question.title,
            text: question.text,
            answerCount: question.comments.length,
            upvoteCount: totalVotes,
            dateCreated: question.createdAt.toISOString(),
            author: {
                '@type': 'Person',
                name: question.userName || 'Usuário da Univesp',
            },
            suggestedAnswer: question.comments.map((comment: any) => ({
                '@type': 'Answer',
                text: comment.content,
                dateCreated: comment.createdAt.toISOString(),
                upvoteCount: 0, // Assuming no comment voting yet
                author: {
                    '@type': 'Person',
                    name: comment.userName || 'Usuário',
                },
            })),
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
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
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                {question.subjectName}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
                                Semana {question.week}
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
                                <span>{question.userName || 'Anônimo'}</span>
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
                    </div>
                </div>

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
                    />
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
