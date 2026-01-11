'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { awardReputation } from './reputation-actions';
import { redirect } from 'next/navigation';

export async function createMockExam(subjectIds: string[], mode: 'STANDARD' | 'FAST' | 'MARATHON' = 'STANDARD') { // Updated signature
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (!subjectIds || subjectIds.length === 0) throw new Error("Selecione pelo menos uma matéria.");

    // Standard validation
    if (mode === 'STANDARD' && subjectIds.length > 10) throw new Error("Máximo de 10 matérias por simulado.");

    let targetTotalQuestions = 0;
    let questionsPerSubject = 8; // Default for STANDARD

    if (mode === 'FAST') {
        targetTotalQuestions = 10;
        questionsPerSubject = 0; // Dynamic
    } else if (mode === 'MARATHON') {
        targetTotalQuestions = 50;
        questionsPerSubject = 0; // Dynamic
    } else {
        // STANDARD
        targetTotalQuestions = subjectIds.length * 8;
        questionsPerSubject = 8;
    }

    let selectedQuestionIds: string[] = [];

    // --- STRATEGY FOR FAST/MARATHON (Pool selection) ---
    if (mode === 'FAST' || mode === 'MARATHON') {
        // Fetch ALL valid question IDs for selected subjects
        const allValidQuestions = await prisma.question.findMany({
            where: {
                subjectId: { in: subjectIds },
                isVerified: true,
                alternatives: { some: { isCorrect: true } }
            },
            select: { id: true }
        });

        if (allValidQuestions.length < targetTotalQuestions && mode === 'MARATHON') {
            // Fallback if not enough questions
            // Just take all
        }

        const shuffled = allValidQuestions.sort(() => 0.5 - Math.random());
        selectedQuestionIds = shuffled.slice(0, targetTotalQuestions).map(q => q.id);
    }
    // --- STRATEGY FOR STANDARD (Per Subject) ---
    else {
        for (const subjectId of subjectIds) {
            const validQuestions = await prisma.question.findMany({
                where: {
                    subjectId,
                    isVerified: true,
                    alternatives: { some: { isCorrect: true } }
                },
                select: { id: true }
            });

            if (validQuestions.length === 0) continue;

            const shuffled = validQuestions.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, questionsPerSubject).map(q => q.id);
            selectedQuestionIds = [...selectedQuestionIds, ...selected];
        }
    }

    if (selectedQuestionIds.length === 0) {
        throw new Error("Não foi possível encontrar questões verificadas.");
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
    // Bonus: 5 XP to finish
    let xp = (score * 5) + 5;

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

export async function getWeeklyProgress() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const exams = await prisma.mockExam.findMany({
        where: {
            userId: session.user.id,
            status: 'COMPLETED',
            finishedAt: {
                gte: sevenDaysAgo
            }
        },
        select: {
            finishedAt: true,
            xpEarned: true
        },
        orderBy: { finishedAt: 'asc' } // Order by date for processing
    });

    // Initialize last 7 days with 0
    const daysMap = new Map<string, { xp: number, exams: number }>();
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(sevenDaysAgo.getDate() + i);
        const key = d.toLocaleDateString('pt-BR', { weekday: 'short' }); // "seg."
        const keyFormatted = key.charAt(0).toUpperCase() + key.slice(1, 3); // "Seg"
        daysMap.set(keyFormatted, { xp: 0, exams: 0 });
    }

    // Populate with data
    exams.forEach((exam: { finishedAt: Date | null; xpEarned: number }) => {
        if (!exam.finishedAt) return;
        const key = exam.finishedAt.toLocaleDateString('pt-BR', { weekday: 'short' });
        const keyFormatted = key.charAt(0).toUpperCase() + key.slice(1, 3);

        // This handles if the map order matches or we just lookup
        // To strictly keep order of last 7 days, we should probably iterate the map keys in order or Array
        // But for Map insertion order is preserved in ES6. 
        // Let's safe update.
        if (daysMap.has(keyFormatted)) {
            const current = daysMap.get(keyFormatted)!;
            daysMap.set(keyFormatted, {
                xp: current.xp + exam.xpEarned,
                exams: current.exams + 1
            });
        }
    });

    return Array.from(daysMap.entries()).map(([day, stats]) => ({
        day,
        xp: stats.xp,
        exams: stats.exams
    }));
}

export async function getSimuladoStreak(userId: string) {
    if (!userId) return 0;

    const completedExams = await prisma.mockExam.findMany({
        where: {
            userId: userId,
            status: 'COMPLETED',
            finishedAt: { not: null }
        },
        select: { finishedAt: true },
        orderBy: { finishedAt: 'desc' }
    });

    if (completedExams.length === 0) return 0;

    // Normalize dates to YYYY-MM-DD
    const uniqueDays = (Array.from(new Set(completedExams.map((e: { finishedAt: Date | null }) => {
        return e.finishedAt!.toISOString().split('T')[0];
    }))) as string[]).sort((a, b) => b.localeCompare(a)); // Descending

    if (uniqueDays.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if streak is active (today or yesterday)
    // If filtering by distinct days, uniqueDays[0] is the most recent day.
    if (uniqueDays[0] !== todayStr && uniqueDays[0] !== yesterdayStr) {
        return 0;
    }

    let streak = 0;
    let currentCheckDate = new Date(uniqueDays[0]);

    for (const dayStr of uniqueDays) {
        const date = new Date(dayStr as string);
        if (date.toISOString().split('T')[0] === currentCheckDate.toISOString().split('T')[0]) {
            streak++;
            // Prepare next expected date (prev day)
            currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak; // Line 296
}

export async function getLeaderboard(limit = 10) {
    const leaderboard = await prisma.mockExam.groupBy({
        by: ['userId'],
        _sum: {
            xpEarned: true
        },
        _count: {
            _all: true
        },
        orderBy: {
            _sum: {
                xpEarned: 'desc'
            }
        },
        take: limit
    });

    const userIds = leaderboard.map((l: { userId: string }) => l.userId);
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, image: true }
    });

    return leaderboard.map((entry: { userId: string, _sum: { xpEarned: number | null }, _count: { _all: number } }, index: number) => {
        const user = users.find(u => u.id === entry.userId);
        return {
            rank: index + 1,
            userId: entry.userId,
            xp: entry._sum.xpEarned || 0,
            exams: entry._count._all,
            name: user?.name || 'Anônimo',
            image: user?.image
        };
    });
}
