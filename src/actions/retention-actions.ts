'use server';

import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import { PredefinedTemplates } from '@/lib/email-templates';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://calculadoraunivesp.com.br';

/**
 * Checks for users who have an active streak but haven't logged in today.
 * Should be scheduled to run in the evening (e.g., 18:00 or 20:00).
 */
export async function checkStreakRisks(dryRun = false) {
    // 1. Define "Today" boundaries
    // Users who haven't logged in since the start of today are at risk.
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    console.log(`[StreakMaintenance] Resetting streaks for users inactive since before: ${startOfYesterday.toISOString()}`);

    // UPDATE EM MASSA (Extremamente rápido e eficiente)
    // Zera o streak de quem tem streak > 0 E não logou desde antes de ontem.
    const result = await prisma.user.updateMany({
        where: {
            loginStreak: { gt: 0 },
            lastLoginAt: { lt: startOfYesterday } 
        },
        data: {
            loginStreak: 0
        }
    });

    console.log(`[StreakMaintenance] ${result.count} broken streaks were reset.`);

    // 2. Find at-risk users
    // Criteria:
    // - loginStreak > 0 (They have something to lose)
    // - lastLoginAt < startOfToday (Haven't logged in today)
    // - email is not null (We can contact them)
    const atRiskUsers = await prisma.user.findMany({
        where: {
            loginStreak: { gt: 0 },
            lastLoginAt: { lt: startOfToday },
            email: { not: null }
        },
        select: {
            id: true,
            name: true,
            email: true,
            loginStreak: true
        },
        take: 100 // Batch limit for safety in MVP
    });

    console.log(`[StreakGuardian] Found ${atRiskUsers.length} users at risk.`);

    if (dryRun) {
        return { count: atRiskUsers.length, users: atRiskUsers.map(u => u.email) };
    }

    // 3. Send Emails
    let sentCount = 0;
    const template = PredefinedTemplates.STREAK_WARNING;

    for (const user of atRiskUsers) {
        if (!user.email) continue;

        try {
            // We use the new template body function
            const htmlContent = template.body(user.loginStreak);

            await EmailService.sendEmail(
                { email: user.email, name: user.name || 'Estudante' },
                template.subject,
                htmlContent
            );
            sentCount++;
        } catch (error) {
            console.error(`[StreakGuardian] Failed to email ${user.email}`, error);
        }
    }

    return { success: true, processed: atRiskUsers.length, sent: sentCount };
}

/** Re-engagement: users who haven't logged in for 3–7 days (inclusive). Run once per day. */
export async function sendReengagementEmails(dryRun = false) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysAgo3 = new Date(startOfToday);
    daysAgo3.setDate(daysAgo3.getDate() - 3);
    const daysAgo8 = new Date(startOfToday);
    daysAgo8.setDate(daysAgo8.getDate() - 8);

    const users = await prisma.user.findMany({
        where: {
            email: { not: null },
            lastLoginAt: {
                gte: daysAgo8,
                lt: daysAgo3,
            },
        },
        select: { id: true, name: true, email: true },
        take: 200,
    });

    if (dryRun) {
        return { count: users.length, users: users.map((u) => u.email) };
    }

    const template = PredefinedTemplates.REENGAGEMENT;
    let sent = 0;
    for (const user of users) {
        if (!user.email) continue;
        try {
            const html = template.body(user.name || 'Estudante', BASE_URL);
            await EmailService.sendEmail(
                { email: user.email, name: user.name || 'Estudante' },
                template.subject,
                html,
            );
            sent++;
        } catch (err) {
            console.error(`[Reengagement] Failed to email ${user.email}`, err);
        }
    }
    return { success: true, processed: users.length, sent };
}

/** Weekly summary: users who have email. Stats from last 7 days. Run e.g. Monday morning. */
export async function sendWeeklySummaryEmails(dryRun = false) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(startOfToday);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const users = await prisma.user.findMany({
        where: { email: { not: null } },
        select: { id: true, name: true, email: true, loginStreak: true },
        take: 500,
    });

    if (dryRun) {
        return { count: users.length };
    }

    const userIds = users.map((u) => u.id);
    const [mockExams, comments, questions] = await Promise.all([
        prisma.mockExam.findMany({
            where: {
                userId: { in: userIds },
                status: 'COMPLETED',
                finishedAt: { gte: weekAgo },
            },
            select: { userId: true },
        }),
        prisma.comment.findMany({
            where: { userId: { in: userIds }, createdAt: { gte: weekAgo } },
            select: { userId: true },
        }),
        prisma.question.findMany({
            where: { userId: { in: userIds }, createdAt: { gte: weekAgo } },
            select: { userId: true },
        }),
    ]);

    const countBy = (arr: { userId: string }[]) =>
        arr.reduce<Record<string, number>>((acc, { userId }) => {
            acc[userId] = (acc[userId] ?? 0) + 1;
            return acc;
        }, {});
    const simuladosByUser = countBy(mockExams);
    const commentsByUser = countBy(comments);
    const questionsByUser = countBy(questions);

    const template = PredefinedTemplates.WEEKLY_SUMMARY;
    let sent = 0;
    for (const user of users) {
        if (!user.email) continue;
        try {
            const stats = {
                streak: user.loginStreak,
                simuladosCompleted: simuladosByUser[user.id] ?? 0,
                commentsCount: commentsByUser[user.id] ?? 0,
                questionsCreated: questionsByUser[user.id] ?? 0,
            };
            const html = template.body(user.name || 'Estudante', stats, BASE_URL);
            await EmailService.sendEmail(
                { email: user.email, name: user.name || 'Estudante' },
                template.subject,
                html,
            );
            sent++;
        } catch (err) {
            console.error(`[WeeklySummary] Failed to email ${user.email}`, err);
        }
    }
    return { success: true, processed: users.length, sent };
}
