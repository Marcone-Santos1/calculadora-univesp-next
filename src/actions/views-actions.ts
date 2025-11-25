'use server';

import { prisma } from '@/lib/prisma';

export async function incrementQuestionViews(questionId: string) {
    try {
        await prisma.question.update({
            where: { id: questionId },
            data: {
                views: {
                    increment: 1
                }
            }
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}
