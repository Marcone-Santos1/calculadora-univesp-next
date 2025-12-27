/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification-actions';
import { awardReputation } from './reputation-actions';

export async function getQuestions(
    query?: string,
    subjectName?: string,
    verified?: string,
    verificationRequested?: string,
    activity?: string,
    sort?: string,
    page: number = 1,
    limit: number = 10
) {
    const where: any = {};

    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { text: { contains: query, mode: 'insensitive' } },
        ];
    }

    if (subjectName) {
        where.subject = {
            name: {
                equals: subjectName,
                mode: 'insensitive',
            }
        };
    }

    if (verified === 'true') {
        where.isVerified = true;
    } else if (verified === 'false') {
        where.isVerified = false;
    }

    if (verificationRequested === 'true') {
        where.verificationRequested = true;
    }

    // Activity filters
    if (activity === 'trending') {
        // Questions from last 7 days
        where.createdAt = {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        };
    }

    const skip = (page - 1) * limit;

    // Run count and findMany in parallel
    const [totalQuestions, questions] = await Promise.all([
        prisma.question.count({ where }),
        prisma.question.findMany({
            where,
            include: {
                user: {
                    include: {
                        reputationLogs: false
                    }
                },
                subject: true,
                alternatives: {
                    include: {
                        votes: true
                    }
                },
                comments: true,
                _count: {
                    select: {
                        comments: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        })
    ]);

    // Map and calculate metrics
    let processedQuestions = questions.map(q => {
        const totalVotes = q.alternatives.reduce((sum, alt) => sum + alt.votes.length, 0);

        return {
            ...q,
            userName: q.user.name || 'Anônimo',
            subjectName: q.subject.name,
            week: q.week || undefined,
            alternatives: q.alternatives.map(alt => ({
                ...alt,
                votes: alt.votes.length
            })),
            totalVotes,
            commentsCount: q.comments.length,
            comments: q.comments.map(c => ({
                ...c,
                userName: 'Anônimo',
                createdAt: c.createdAt.toISOString()
            }))
        };
    });

    // Apply activity filters (post-fetch filtering for complex conditions)
    // NOTE: Doing this post-fetch breaks pagination accuracy for these specific filters if rely strictly on DB count.
    // For 'no-votes' and 'no-comments', ideally we should filter in the DB query, but computed fields (totalVotes) are hard in standard Prisma.
    // However, for 'no-comments' we can use: comments: { none: {} } in 'where'. 
    // For now, keeping existing logic but acknowledging pagination might vary for these edge cases.
    if (activity === 'no-votes') {
        processedQuestions = processedQuestions.filter(q => q.totalVotes === 0);
    } else if (activity === 'no-comments') {
        processedQuestions = processedQuestions.filter(q => q.commentsCount === 0);
    }

    // Apply sorting
    if (sort === 'popular') {
        // Sort by total votes (descending)
        processedQuestions.sort((a, b) => b.totalVotes - a.totalVotes);
    } else if (sort === 'discussed') {
        // Sort by comments count (descending)
        processedQuestions.sort((a, b) => b.commentsCount - a.commentsCount);
    }
    // Default is already sorted by createdAt desc

    const totalPages = Math.ceil(totalQuestions / limit);

    return {
        questions: processedQuestions,
        meta: {
            total: totalQuestions,
            page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}


export async function getRelatedQuestions(
    subjectId: string,
    currentQuestionId: string
) {
    const questions = await prisma.question.findMany({
        where: {
            subjectId,
            id: {
                not: currentQuestionId
            }
        },
        include: {
            user: {
                include: {
                    reputationLogs: false
                }
            },
            subject: true,
            alternatives: {
                include: {
                    votes: true
                }
            },
            comments: true,
            _count: {
                select: {
                    comments: true,
                }
            }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    return questions;
}

export async function getQuestion(id: string) {
    const question = await prisma.question.findUnique({
        where: { id },
        include: {
            user: {
                include: {
                    reputationLogs: false
                }
            },
            subject: true,
            alternatives: {
                include: {
                    votes: true
                },
                orderBy: { letter: 'asc' }
            },
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            reputation: true
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!question) return null;

    // Helper to build comment tree
    const buildCommentTree = (comments: any[]) => {
        const commentMap = new Map();
        const roots: any[] = [];

        // Initialize map
        comments.forEach(comment => {
            commentMap.set(comment.id, {
                ...comment,
                userName: comment.user?.name || 'Anônimo',
                replies: []
            });
        });

        // Build tree
        comments.forEach(comment => {
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) {
                    parent.replies.push(commentMap.get(comment.id));
                } else {
                    // Parent not found (maybe deleted?), treat as root or orphan
                    // For now, let's treat as root to avoid losing data
                    roots.push(commentMap.get(comment.id));
                }
            } else {
                roots.push(commentMap.get(comment.id));
            }
        });

        return roots;
    };

    const commentTree = buildCommentTree(question.comments);

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
        comments: commentTree
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
    const alternativesRaw = formData.get('alternatives');
    const isValidated = formData.get('isValidated') === 'isValidated';

    const existingQuestion = await prisma.question.findFirst({
        where: {
            OR: [
                {
                    title: {
                        equals: title.trim(),
                        mode: 'insensitive'
                    }
                },
                {
                    text: {
                        equals: text.trim(),
                        mode: 'insensitive'
                    }
                }
            ]
        },
        select: { id: true, title: true } // Otimização: selecionar apenas o necessário
    });

    if (existingQuestion) {
        throw new Error('Atenção: Já existe uma questão idêntica cadastrada (mesmo título ou mesma descrição). Por favor, verifique antes de postar.');
    }

    if (!alternativesRaw) {
        throw new Error('Alternativas são obrigatórias');
    }

    const alternatives = JSON.parse(alternativesRaw as string);

    const question = await prisma.question.create({
        data: {
            title,
            text,
            subjectId,
            week,
            isVerified: isValidated,
            userId: session.user.id,
            alternatives: {
                create: alternatives.map((alt: any) => ({
                    letter: alt.id || alt.letter,
                    text: alt.text || alt.content,
                    isCorrect: alt.isCorrect || false
                }))
            }
        }
    });

    revalidatePath('/questoes');

    // Award reputation for creating a question
    await awardReputation(session.user.id, 5, 'QUESTION_CREATED');

    return { questionId: question.id };
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
        include: { question: true } // Include question to get author ID
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

    // Notify question author about the vote
    if (alternative.question.userId !== session.user.id) {
        await createNotification({
            userId: alternative.question.userId,
            type: 'VOTE',
            message: `Alguém votou na sua questão: "${alternative.question.title.substring(0, 30)}..."`,
            link: `/questoes/${alternative.questionId}`
        });

        // Award reputation to question author for receiving a vote
        await awardReputation(alternative.question.userId, 2, 'VOTE_RECEIVED');
    }

    // Award reputation to voter for participating
    await awardReputation(session.user.id, 1, 'VOTE_CAST');

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

    const comment = await prisma.comment.create({
        data: {
            text: text.trim(),
            userId: session.user.id,
            questionId,
            parentId: parentId || null
        },
        include: {
            question: true,
            parent: true
        }
    });

    // Notify
    if (parentId && comment.parent) {
        // Reply to a comment
        if (comment.parent.userId !== session.user.id) {
            await createNotification({
                userId: comment.parent.userId,
                type: 'REPLY',
                message: `Alguém respondeu seu comentário na questão "${comment.question.title.substring(0, 30)}..."`,
                link: `/questoes/${questionId}`
            });
        }
    } else {
        // Comment on a question
        if (comment.question.userId !== session.user.id) {
            await createNotification({
                userId: comment.question.userId,
                type: 'COMMENT',
                message: `Alguém comentou na sua questão "${comment.question.title.substring(0, 30)}..."`,
                link: `/questoes/${questionId}`
            });

            // Award reputation to question author for engagement
            await awardReputation(comment.question.userId, 2, 'COMMENT_RECEIVED');
        }
    }

    // Award reputation to commenter
    await awardReputation(session.user.id, 3, 'COMMENT_CREATED');

    revalidatePath(`/questoes/${questionId}`);
}

export async function requestVerification(questionId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    await prisma.question.update({
        where: { id: questionId },
        data: {
            verificationRequested: true,
            verificationRequestDate: new Date()
        }
    });

    revalidatePath(`/questoes/${questionId}`);
    revalidatePath('/admin/questions');
}

export async function getSubjectsWithCounts() {
    const subjects = await prisma.subject.findMany({
        include: {
            _count: {
                select: { questions: true }
            }
        },
        orderBy: { name: 'asc' }
    });

    return subjects;
}
