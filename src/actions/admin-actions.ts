'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

// ============ Question Management ============

export async function getAdminQuestions(search?: string, verified?: boolean) {
    await requireAdmin();

    const where: any = {};

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { text: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (verified !== undefined) {
        where.isVerified = verified;
    }

    const questions = await prisma.question.findMany({
        where,
        include: {
            user: { select: { name: true, email: true } },
            subject: { select: { name: true } },
            alternatives: {
                select: { id: true, letter: true, text: true, isCorrect: true },
                orderBy: { letter: 'asc' }
            },
            _count: {
                select: {
                    alternatives: true,
                    comments: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return questions;
}

export async function deleteQuestion(id: string) {
    await requireAdmin();

    await prisma.question.delete({
        where: { id }
    });

    revalidatePath('/admin/questions');
    revalidatePath('/questoes');
}

export async function toggleQuestionVerification(id: string, correctAlternativeId?: string) {
    await requireAdmin();

    const question = await prisma.question.findUnique({
        where: { id },
        select: { isVerified: true }
    });

    if (!question) {
        throw new Error('Question not found');
    }

    if (!question.isVerified && correctAlternativeId) {
        // Verifying: Set verified and mark correct answer
        await prisma.$transaction([
            prisma.question.update({
                where: { id },
                data: { isVerified: true }
            }),
            prisma.alternative.updateMany({
                where: { questionId: id },
                data: { isCorrect: false }
            }),
            prisma.alternative.update({
                where: { id: correctAlternativeId },
                data: { isCorrect: true }
            })
        ]);
    } else {
        // Unverifying or toggling without specific answer (fallback)
        await prisma.question.update({
            where: { id },
            data: { isVerified: !question.isVerified }
        });
    }

    revalidatePath('/admin/questions');
    revalidatePath(`/questoes/${id}`);
}

// ============ Comment Moderation ============

export async function getAdminComments(search?: string) {
    await requireAdmin();

    const where: any = {};

    if (search) {
        where.text = { contains: search, mode: 'insensitive' };
    }

    const comments = await prisma.comment.findMany({
        where,
        include: {
            user: { select: { name: true, email: true } },
            question: { select: { id: true, title: true } },
            _count: {
                select: { replies: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    return comments;
}

export async function deleteComment(id: string) {
    await requireAdmin();

    // Get the comment to find its question
    const comment = await prisma.comment.findUnique({
        where: { id },
        select: { questionId: true }
    });

    // Delete comment (cascade will delete replies)
    await prisma.comment.delete({
        where: { id }
    });

    revalidatePath('/admin/comments');
    if (comment) {
        revalidatePath(`/questoes/${comment.questionId}`);
    }
}

// ============ Subject Management ============

export async function getAdminSubjects() {
    await requireAdmin();

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

export async function createSubject(data: { name: string; color: string; icon: string }) {
    await requireAdmin();

    const subject = await prisma.subject.create({
        data
    });

    revalidatePath('/admin/subjects');
    revalidatePath('/questoes');

    return subject;
}

export async function updateSubject(id: string, data: { name?: string; color?: string; icon?: string }) {
    await requireAdmin();

    const subject = await prisma.subject.update({
        where: { id },
        data
    });

    revalidatePath('/admin/subjects');
    revalidatePath('/questoes');

    return subject;
}

export async function deleteSubject(id: string) {
    await requireAdmin();

    // Check if subject has questions
    const count = await prisma.question.count({
        where: { subjectId: id }
    });

    if (count > 0) {
        throw new Error(`Cannot delete subject with ${count} questions. Please reassign or delete questions first.`);
    }

    await prisma.subject.delete({
        where: { id }
    });

    revalidatePath('/admin/subjects');
    revalidatePath('/questoes');
}

// ============ User Management ============

export async function getAdminUsers(search?: string) {
    await requireAdmin();

    const where: any = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ];
    }

    const users = await prisma.user.findMany({
        where,
        include: {
            _count: {
                select: {
                    questions: true,
                    comments: true,
                    votes: true
                }
            }
        },
        orderBy: { name: 'asc' }
    });

    return users;
}

export async function toggleUserAdmin(id: string) {
    await requireAdmin();

    const user = await prisma.user.findUnique({
        where: { id },
        select: { isAdmin: true }
    });

    if (!user) {
        throw new Error('User not found');
    }

    await prisma.user.update({
        where: { id },
        data: { isAdmin: !user.isAdmin }
    });

    revalidatePath('/admin/users');
}

// ============ Dashboard Stats ============

export async function getAdminStats() {
    await requireAdmin();

    const [
        totalUsers,
        totalQuestions,
        totalComments,
        verifiedQuestions,
        recentQuestions
    ] = await Promise.all([
        prisma.user.count(),
        prisma.question.count(),
        prisma.comment.count(),
        prisma.question.count({ where: { isVerified: true } }),
        prisma.question.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true } },
                subject: { select: { name: true } }
            }
        })
    ]);

    return {
        totalUsers,
        totalQuestions,
        totalComments,
        verifiedQuestions,
        recentQuestions
    };
}
