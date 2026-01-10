'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { awardReputation } from './reputation-actions';
import { redirect } from 'next/navigation';

export async function createMockExam(subjectIds: string[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (!subjectIds || subjectIds.length === 0) throw new Error("Selecione pelo menos uma matéria.");
    if (subjectIds.length > 10) throw new Error("Máximo de 10 matérias por simulado.");

    const QUESTIONS_PER_SUBJECT = 8;
    let selectedQuestionIds: string[] = [];

    // 1. Select Random Questions
    for (const subjectId of subjectIds) {
        // Get all valid question IDs for this subject
        const validQuestions = await prisma.question.findMany({
            where: {
                subjectId,
                isVerified: true,
                alternatives: {
                    some: {
                        isCorrect: true
                    }
                }
            },
            select: { id: true }
        });

        if (validQuestions.length === 0) continue;

        // Shuffle and pick 8
        const shuffled = validQuestions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, QUESTIONS_PER_SUBJECT).map(q => q.id);

        selectedQuestionIds = [...selectedQuestionIds, ...selected];
    }

    if (selectedQuestionIds.length === 0) {
        throw new Error("Não foi possível encontrar questões verificadas para as matérias selecionadas.");
    }

    // 2. Create Exam Record
    const mockExam = await prisma.mockExam.create({
        data: {
            userId: session.user.id,
            totalQuestions: selectedQuestionIds.length,
            status: 'IN_PROGRESS',
            questions: {
                create: selectedQuestionIds.map(qId => ({
                    questionId: qId
                }))
            }
        }
    });

    revalidatePath('/simulados');
    return { success: true, mockExamId: mockExam.id };
}

export async function getMockExam(id: string) {
    const session = await auth();
    if (!session?.user) return null;

    const exam = await prisma.mockExam.findFirst({
        where: { id, userId: session.user.id },
        include: {
            questions: {
                include: {
                    question: {
                        include: {
                            alternatives: {
                                select: { id: true, letter: true, text: true } // Hide isCorrect
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'asc' } // Or random? usually fixed order once created
            }
        }
    });

    return exam;
}

export async function submitMockExamAnswer(mockExamQuestionId: string, alternativeId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Check correction
    // We need to fetch the question's correct alternative
    const mq = await prisma.mockExamQuestion.findUnique({
        where: { id: mockExamQuestionId },
        include: { question: { include: { alternatives: true } } }
    });

    if (!mq) throw new Error("Question not found");

    const correctAlt = mq.question.alternatives.find(a => a.isCorrect);
    const isCorrect = correctAlt?.id === alternativeId;

    await prisma.mockExamQuestion.update({
        where: { id: mockExamQuestionId },
        data: {
            selectedAlternativeId: alternativeId,
            isCorrect
        }
    });

    return { success: true };
}

export async function finishMockExam(id: string, timeSpentRef: number) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const exam = await prisma.mockExam.findFirst({
        where: { id, userId: session.user.id },
        include: { questions: true }
    });

    if (!exam) throw new Error("Exam not found");

    // Calculate Score
    const score = exam.questions.filter(q => q.isCorrect).length;

    // Calculate XP
    // Base: 5 XP per correct answer
    // Bonus: 50 XP to finish
    let xp = (score * 5) + 50;

    await prisma.mockExam.update({
        where: { id },
        data: {
            status: 'COMPLETED',
            finishedAt: new Date(),
            score,
            xpEarned: xp,
            timeSpent: timeSpentRef
        }
    });

    // Award XP to User
    await awardReputation(session.user.id, xp, 'MOCK_EXAM_COMPLETED');

    revalidatePath('/simulados');
    return { success: true, redirectUrl: `/simulados/${id}/resultado` };
}
