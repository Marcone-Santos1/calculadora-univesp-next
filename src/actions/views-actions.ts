'use server';

import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function incrementQuestionViews(questionId: string) {
    // 🛡️ Rate limit: máximo 30 incrementos por minuto por questão
    const { success } = rateLimit(`views:${questionId}`, 30, 60_000);
    if (!success) return; // Silencioso — não expõe erro ao usuário

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

