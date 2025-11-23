'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getQuestions(query?: string, subjectId?: string) {
    const where: any = {};

    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { text: { contains: query, mode: 'insensitive' } },
        ];
    }

    if (subjectId) {
        where.subjectId = subjectId;
    }

    const questions = await prisma.question.findMany({
        where,
        include: {
            user: true,
            subject: true,
            alternatives: {
                include: {
                    votes: true
                }
            },
            comments: true,
            _count: {
                select: { comments: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return questions.map(q => ({
        ...q,
        userName: q.user.name || 'Anônimo',
        subjectName: q.subject.name,
        alternatives: q.alternatives.map(alt => ({
            ...alt,
            votes: alt.votes.length
        }))
    }));
}

export async function getQuestion(id: string) {
    const question = await prisma.question.findUnique({
        where: { id },
        include: {
            user: true,
            subject: true,
            alternatives: {
                include: {
                    votes: true
                },
                orderBy: { letter: 'asc' }
            },
            comments: {
                include: {
                    user: true,
                    replies: {
                        include: {
                            user: true
                        },
                        orderBy: { createdAt: 'asc' }
                    }
                },
                where: {
                    parentId: null // Only get top-level comments
                },
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!question) return null;

    return {
        ...question,
        userName: question.user.name || 'Anônimo',
        subjectName: question.subject.name,
        alternatives: question.alternatives.map(alt => ({
            ...alt,
            voteCount: alt.votes.length,
            // Keep votes array for checking if user voted
            votes: alt.votes
        })),
        comments: question.comments.map(c => ({
            ...c,
            userName: c.user.name || 'Anônimo',
            replies: c.replies.map(r => ({
                ...r,
                userName: r.user.name || 'Anônimo'
            }))
        }))
    };
}

export async function createQuestion(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const title = formData.get('title') as string;
    const text = formData.get('text') as string;
    const subjectId = formData.get('subjectId') as string;
    const week = formData.get('week') as string;
    const alternatives = JSON.parse(formData.get('alternatives') as string);

    await prisma.question.create({
        data: {
            title,
            text,
            subjectId,
            week,
            userId: session.user.id,
            alternatives: {
                create: alternatives.map((alt: any) => ({
                    letter: alt.id,
                    text: alt.text
                }))
            }
        }
    });

    revalidatePath('/questoes');
}

export async function voteOnAlternative(alternativeId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    // Check if user already voted on this question
    // Ideally we should check the questionId, but for simplicity let's assume the UI handles it
    // Or we can fetch the alternative to get the questionId

    const alternative = await prisma.alternative.findUnique({
        where: { id: alternativeId },
        select: { questionId: true }
    });

    if (!alternative) throw new Error('Alternative not found');

    // Check if user already voted for this question
    const existingVote = await prisma.vote.findFirst({
        where: {
            userId: session.user.id,
            alternative: {
                questionId: alternative.questionId
            }
        }
    });

    if (existingVote) {
        // Optional: Change vote? For now, just return or throw
        return;
    }

    await prisma.vote.create({
        data: {
            userId: session.user.id,
            alternativeId
        }
    });

    revalidatePath(`/questoes`);
}

export async function createComment(questionId: string, text: string, parentId?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    if (!text || text.trim().length === 0) {
        throw new Error('Comment text cannot be empty');
    }

    await prisma.comment.create({
        data: {
            text: text.trim(),
            userId: session.user.id,
            questionId,
            parentId: parentId || null
        }
    });

    revalidatePath(`/questoes/${questionId}`);
}
