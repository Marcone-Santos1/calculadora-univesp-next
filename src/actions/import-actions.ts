'use server'

import { ImportedQuestion } from '@/Contracts/import-contracts'
import { prisma } from '@/lib/prisma'
// import { auth } from '@/lib/auth' // TODO: Enable auth check

export async function saveImportedQuestions(questions: ImportedQuestion[], subjectId: string, week: string): Promise<{ success: boolean, count?: number, error?: string }> {
    try {
        if (!subjectId || !week) {
            return { success: false, error: 'Matéria e Semana são obrigatórios' }
        }

        // TODO: Enable Auth Check
        // const session = await auth()
        // if (!session?.user?.isAdmin) return { success: false, error: 'Unauthorized' }

        // Fallback user for dev/testing if auth not ready
        const fallbackUser = await prisma.user.findFirst({ where: { isAdmin: true } })
        const userId = fallbackUser?.id || await prisma.user.findFirst().then(u => u?.id)

        if (!userId) {
            return { success: false, error: 'Nenhum usuário encontrado para atribuir as questões' }
        }

        let count = 0
        for (const q of questions) {
            if (!q.statement || q.alternatives.length === 0) continue

            await prisma.question.create({
                data: {
                    title: `Questão Importada - ${week}`,
                    text: q.statement,
                    week: week,
                    userId: userId,
                    subjectId: subjectId,
                    isVerified: false,
                    alternatives: {
                        create: q.alternatives.map((altText, index) => ({
                            letter: String.fromCharCode(65 + index),
                            text: altText,
                            isCorrect: q.correctAlternativeIndex === index
                        }))
                    }
                }
            })
            count++
        }

        return { success: true, count }

    } catch (error) {
        console.error('Erro ao salvar questões:', error)
        return { success: false, error: 'Erro ao salvar no banco de dados' }
    }
}
