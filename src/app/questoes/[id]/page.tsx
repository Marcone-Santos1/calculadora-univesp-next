import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getQuestion, voteOnAlternative } from '@/actions/question-actions';
import { AlternativeItem } from '@/components/question/AlternativeItem';
import { ShareButton } from '@/components/question/ShareButton';
import { ValidationButton } from '@/components/question/ValidationButton';
import { CommentSection } from '@/components/question/CommentSection';
import Link from 'next/link';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { auth } from '@/lib/auth';

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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                <Link href="/questoes" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 mb-6">
                    <FaArrowLeft /> Voltar para Questões
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">
                                        {question.subjectName}
                                    </span>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {question.title}
                                    </h1>
                                </div>
                                {question.isVerified && (
                                    <div className="flex flex-col items-end text-green-600 dark:text-green-400">
                                        <FaCheckCircle className="text-2xl" />
                                        <span className="text-xs font-bold">Verificada</span>
                                    </div>
                                )}
                            </div>

                            <div className="prose dark:prose-invert max-w-none mb-8 text-gray-800 dark:text-gray-200">
                                <p>{question.text}</p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Alternativas</h3>
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

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <ValidationButton
                                    questionId={question.id}
                                    isLoggedIn={!!session}
                                    isVerified={question.isVerified}
                                    verificationRequested={question.verificationRequested}
                                />
                                <ShareButton questionId={question.id} questionTitle={question.title} />
                            </div>
                        </div>


                        {/* Comments Section */}
                        <CommentSection
                            questionId={question.id}
                            comments={question.comments}
                            isLoggedIn={!!session}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Estatísticas</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Visualizações</span>
                                    <span className="font-medium dark:text-white">{question.views}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total de Votos</span>
                                    <span className="font-medium dark:text-white">{totalVotes}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Criado por</span>
                                    <span className="font-medium dark:text-white">{question.userName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Semana</span>
                                    <span className="font-medium dark:text-white">{question.week || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return (
        <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
            <QuestionDetailContent id={resolvedParams.id} />
        </Suspense>
    );
}
