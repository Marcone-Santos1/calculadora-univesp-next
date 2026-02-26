/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

export type ParsedAlternative = {
    letter: string;
    text: string;
    isCorrect: boolean;
};

export type ParsedQuestion = {
    id: string; // Temporário para a UI (ex: index)
    statement: string;
    options: ParsedAlternative[];
};

export async function parseJsonQuestions(jsonContent: string): Promise<{ success: boolean; data?: ParsedQuestion[]; error?: string }> {
    await requireAdmin();

    try {
        const data = JSON.parse(jsonContent);

        if (!Array.isArray(data)) {
            return { success: false, error: 'JSON deve ser um array de questões.' };
        }

        const parsedQuestions: ParsedQuestion[] = [];
        let index = 0;

        for (const item of data) {
            if (!item.statement || !item.options) {
                continue; // Pula itens sem formato correto
            }

            const title = item.statement.substring(0, 100) + (item.statement.length > 100 ? '...' : '');

            // Checar duplicidade (simplificada no preview para não travar muito a UI, mas faremos a query rápida)
            const existingQuestion = await prisma.question.findFirst({
                where: {
                    OR: [
                        { title: { equals: title.trim() } },
                        { text: { equals: item.statement.trim() } }
                    ]
                },
                select: { id: true }
            });

            if (existingQuestion) {
                continue; // Já existe
            }

            const options: ParsedAlternative[] = [];
            const optionKeys = ['a', 'b', 'c', 'd', 'e'];

            for (const key of optionKeys) {
                const text = item.options[key];
                if (text !== null && text !== undefined && String(text).trim() !== '') {
                    options.push({
                        letter: key.toUpperCase(),
                        text: String(text),
                        isCorrect: false // Admin decide na UI
                    });
                }
            }

            if (options.length > 0) {
                parsedQuestions.push({
                    id: `temp_${index++}`,
                    statement: item.statement,
                    options
                });
            }
        }

        return { success: true, data: parsedQuestions };

    } catch (error: any) {
        console.error('Error parsing JSON:', error);
        return {
            success: false,
            error: 'Erro ao processar JSON. Certifique-se de que o formato está correto e válido.'
        };
    }
}

export async function saveImportedQuestions(subjectId: string, questions: ParsedQuestion[]) {
    await requireAdmin();

    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'User not authenticated' };
    }

    const userId = session.user.id;

    try {
        let importedCount = 0;

        for (const item of questions) {
            // Re-checar duplicidade de segurança
            const title = item.statement.substring(0, 100) + (item.statement.length > 100 ? '...' : '');

            const existingQuestion = await prisma.question.findFirst({
                where: {
                    OR: [
                        { title: { equals: title.trim() } },
                        { text: { equals: item.statement.trim() } }
                    ]
                },
                select: { id: true }
            });

            if (existingQuestion) {
                continue;
            }

            // Criar Questão + Alternativas de uma vez (Transaction interna do Prisma p/ relates)
            await prisma.question.create({
                data: {
                    title: title,
                    text: item.statement,
                    userId: userId,
                    subjectId: subjectId,
                    isVerified: true,
                    verificationRequested: false,
                    alternatives: {
                        create: item.options.map(opt => ({
                            letter: opt.letter,
                            text: opt.text,
                            isCorrect: opt.isCorrect
                        }))
                    }
                }
            });

            importedCount++;
        }

        revalidatePath('/admin/questions');
        revalidatePath('/questoes');

        return {
            success: true,
            message: `${importedCount} questões importadas com sucesso.`,
            savedTitles: questions.map(q => q.statement.substring(0, 100) + (q.statement.length > 100 ? '...' : ''))
        };

    } catch (error: any) {
        console.error('Error saving imported questions:', error);
        return {
            success: false,
            error: 'Erro ao salvar questões.'
        };
    }
}
