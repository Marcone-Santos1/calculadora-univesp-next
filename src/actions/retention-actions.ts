'use server';

import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import { PredefinedTemplates } from '@/lib/email-templates';

/**
 * Checks for users who have an active streak but haven't logged in today.
 * Should be scheduled to run in the evening (e.g., 18:00 or 20:00).
 */
export async function checkStreakRisks(dryRun = false) {
    // 1. Define "Today" boundaries
    // Users who haven't logged in since the start of today are at risk.
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
