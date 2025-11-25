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

    await prisma.report.update({
        where: { id: reportId },
        data: { status }
    });

    revalidatePath('/admin/reports');
}
