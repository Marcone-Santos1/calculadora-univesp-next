'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { REPUTATION_EVENTS, ReputationEvent } from '@/utils/reputation-events';
import { ACHIEVEMENTS, getAchievement } from '@/utils/achievements';
import { getLevel } from '@/utils/reputation';

export async function awardReputation(userId: string, amount: number, reason: string) {
    try {
        // Update user reputation
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                reputation: {
                    increment: amount
                },
                reputationLogs: {
                    create: {
                        amount,
                        reason
                    }
                }
            }
        });

        // Check for level up or other achievements
        await checkAchievements(userId);

        // Revalidate paths where reputation might be shown
        revalidatePath('/perfil');
        revalidatePath('/questoes');
    } catch (error) {
        console.error('Error awarding reputation:', error);
    }
}

export async function deductReputation(userId: string, amount: number, reason: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                reputation: {
                    decrement: amount
                },
                reputationLogs: {
                    create: {
                        amount: -amount,
                        reason
                    }
                }
            }
        });

        revalidatePath('/perfil');
        revalidatePath('/questoes');
    } catch (error) {
        console.error('Error deducting reputation:', error);
    }
}

export async function getUserReputation(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reputation: true }
    });
    return user?.reputation || 0;
}

// --- GAMIFICATION & ACHIEVEMENTS ---

export async function handleDailyLogin(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { lastLoginAt: true, loginStreak: true }
        });

        if (!user) return { status: 'USER_NOT_FOUND' };

        // Normalize dates to midnight to ensure calendar day comparison
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
        if (lastLogin) {
            lastLogin.setHours(0, 0, 0, 0);
        }

        let newStreak = user.loginStreak;
        let shouldAward = false;
        let status = 'NO_CHANGE';

        if (lastLogin) {
            const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Already logged in today
                return { status: 'ALREADY_LOGGED_IN_TODAY', streak: newStreak };
            }

            if (diffDays === 1) {
                // Consecutive day
                newStreak += 1;
                shouldAward = true;
                status = 'STREAK_CONTINUED';
            } else {
                // Streak broken
                newStreak = 1;
                shouldAward = true;
                status = 'STREAK_RESET';
            }
        } else {
            // First login ever
            newStreak = 1;
            shouldAward = true;
            status = 'FIRST_LOGIN';
        }

        if (shouldAward) {
            // Update User - We use the real 'now' time for the record, but the logic used midnight
            await prisma.user.update({
                where: { id: userId },
                data: {
                    lastLoginAt: new Date(), // Store actual login time
                    loginStreak: newStreak
                }
            });

            // Award Daily Points
            const isWeeklyStreak = newStreak % 7 === 0;
            const points = REPUTATION_EVENTS.DAILY_LOGIN.points + (isWeeklyStreak ? 10 : 0);

            await awardReputation(userId, points, isWeeklyStreak ? 'DAILY_LOGIN_STREAK_BONUS' : 'DAILY_LOGIN');

            return { status, streak: newStreak, points, isWeeklyStreak };
        }

        return { status, streak: newStreak };

    } catch (error) {
        console.error('Error handling daily login:', error);
        return { status: 'ERROR' };
    }
}

export async function checkDailyStreak() {
    const { auth } = await import('@/lib/auth');
    const session = await auth();

    if (!session?.user?.id) {
        return { status: 'UNAUTHENTICATED' };
    }

    return await handleDailyLogin(session.user.id);
}

export async function checkAchievements(userId: string) {
    try {
        // 1. Gather Stats
        const [
            user,
            questionCount,
            commentCount,
            voteCount,
            commentVoteCount,
            receivedQuestionVotes,
            receivedCommentVotes,
            unlockedAchievements
        ] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.question.count({ where: { userId } }),
            prisma.comment.count({ where: { userId } }),
            prisma.vote.count({ where: { userId } }),
            prisma.commentVote.count({ where: { userId } }),
            // Count votes on MY questions
            prisma.vote.count({ where: { alternative: { question: { userId } } } }),
            // Count votes on MY comments
            prisma.commentVote.count({ where: { comment: { userId } } }),
            prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } })
        ]);

        if (!user) return;

        const unlockedIds = new Set(unlockedAchievements.map(ua => ua.achievementId));
        const { level } = getLevel(user.reputation || 0);

        const stats = {
            questions: questionCount,
            comments: commentCount,
            votes: voteCount,
            commentVotes: commentVoteCount,
            receivedVotes: receivedQuestionVotes,
            receivedCommentVotes: receivedCommentVotes,
            streak: user.loginStreak || 0,
            level: level,
            isProfileComplete: !!(user.name && user.bio && user.image)
        };

        // 2. Check Conditions
        const newUnlocks = [];

        for (const achievement of ACHIEVEMENTS) {
            if (unlockedIds.has(achievement.id)) continue;

            if (achievement.condition(stats)) {
                newUnlocks.push(achievement);
            }
        }

        // 3. Award and Notify
        for (const achievement of newUnlocks) {
            await prisma.userAchievement.create({
                data: {
                    userId,
                    achievementId: achievement.id
                }
            });

            // Award Achievement Points
            await awardReputation(userId, achievement.points, `ACHIEVEMENT_${achievement.id}`);

            // Here we could create a notification
            await prisma.notification.create({
                data: {
                    userId,
                    type: 'ACHIEVEMENT',
                    message: `Você desbloqueou a conquista: ${achievement.icon} ${achievement.title}!`
                }
            });
        }

    } catch (error) {
        console.error('Error checking achievements:', error);
    }
}


