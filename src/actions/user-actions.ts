'use server';

import { prisma } from '@/lib/prisma';


export async function getUserStats(userId: string) {
    const [questionsCount, commentsCount, votesCount] = await Promise.all([
        prisma.question.count({ where: { userId } }),
        prisma.comment.count({ where: { userId } }),
        prisma.vote.count({ where: { userId } })
    ]);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reputation: true }
    });

    return {
        questions: questionsCount,
        comments: commentsCount,
        votes: votesCount,
        reputation: user?.reputation || 0
    };
}

export async function getUserQuestions(userId: string) {
    return await prisma.question.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            subject: true,
            _count: {
                select: {
                    comments: true,
                    alternatives: true // We might want to count votes instead, but alternatives is what we have direct relation to
                }
            }
        }
    });
}

export async function getUserComments(userId: string) {
    return await prisma.comment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            question: {
                select: {
                    id: true,
                    title: true,
                    subject: true
                }
            }
        }
    });
}
