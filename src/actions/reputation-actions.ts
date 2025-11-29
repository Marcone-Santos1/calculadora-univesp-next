'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function awardReputation(userId: string, amount: number, reason: string) {
    try {
        // Update user reputation
        await prisma.user.update({
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

        // Revalidate paths where reputation might be shown
        revalidatePath('/perfil');
        revalidatePath('/questoes');
    } catch (error) {
        console.error('Error awarding reputation:', error);
        // Don't throw, just log. Reputation failure shouldn't block main actions.
    }
}

export async function deductReputation(userId: string, amount: number, reason: string) {
    try {
        // Update user reputation
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

        // Revalidate paths where reputation might be shown
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


