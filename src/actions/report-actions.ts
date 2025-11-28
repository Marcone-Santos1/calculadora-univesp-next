'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createReport(data: {
    reason: string;
    questionId?: string;
    commentId?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    await prisma.report.create({
        data: {
            reason: data.reason,
            reporterId: session.user.id,
            questionId: data.questionId,
            commentId: data.commentId
        }
    });

    // Notify admins? (Optional for now)
}

export async function getReports() {
    const session = await auth();
    // In a real app, check for admin role here
    if (!session?.user?.id) { // || !session.user.isAdmin
        throw new Error('Unauthorized');
    }

    return await prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            reporter: true,
            question: true,
            comment: {
                include: {
                    user: true
                }
            }
        }
    });
}

export async function resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED') {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const report = await prisma.report.findUnique({
        where: { id: reportId }
    });

    if (!report) return;

    if (report.questionId) {
        await prisma.report.updateMany({
            where: { questionId: report.questionId },
            data: { status }
        });
    } else if (report.commentId) {
        await prisma.report.updateMany({
            where: { commentId: report.commentId },
            data: { status }
        });
    } else {
        // Fallback for reports without targets (shouldn't happen with current logic)
        await prisma.report.update({
            where: { id: reportId },
            data: { status }
        });
    }

    revalidatePath('/admin/reports');
}

import { deleteQuestion, deleteComment } from './admin-actions';

export async function deleteReportedContent(reportId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const report = await prisma.report.findUnique({
        where: { id: reportId }
    });

    if (!report) {
        throw new Error('Report not found');
    }

    if (report.questionId) {
        await deleteQuestion(report.questionId);

        // Resolve all reports for this question
        await prisma.report.updateMany({
            where: { questionId: report.questionId },
            data: { status: 'RESOLVED' }
        });
    } else if (report.commentId) {
        await deleteComment(report.commentId);

        // Resolve all reports for this comment
        await prisma.report.updateMany({
            where: { commentId: report.commentId },
            data: { status: 'RESOLVED' }
        });
    }

    revalidatePath('/admin/reports');
}
