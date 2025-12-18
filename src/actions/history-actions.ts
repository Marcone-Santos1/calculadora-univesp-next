'use server';

import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// Busca lista de IDs de provas já concluídas pelo usuário
export async function getCompletedExams() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const history = await prisma.scrapeHistory.findMany({
        where: { userId: session.user.id },
        select: { examName: true }
    });

    return history.map(h => h.examName);
}

// Marca uma prova como concluída
export async function markExamAsCompleted(year: string, examId: string, examName: string) {
    const session = await auth();
    if (!session?.user?.id) return;

    try {
        await prisma.scrapeHistory.create({
            data: {
                userId: session.user.id,
                year,
                examId,
                examName
            }
        });
    } catch (e) {
        // Ignora erro se já existir (Unique constraint)
    }
}