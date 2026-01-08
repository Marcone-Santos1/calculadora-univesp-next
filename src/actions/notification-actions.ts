'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Combined data fetch for efficiency and to reduce connection pool usage
// Combined data fetch for efficiency and to reduce connection pool usage
export async function getNotificationData(userId: string) {
    const [notifications, unreadCount] = await prisma.$transaction(async (tx) => {
        const data = await tx.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        const count = await tx.notification.count({
            where: {
                userId,
                read: false
            }
        });

        return [data, count];
    });

    return { notifications, unreadCount };
}

export async function markAsRead(notificationId: string) {
    const session = await auth();
    if (!session?.user) return;

    await prisma.notification.update({
        where: {
            id: notificationId,
            userId: session.user.id // Ensure ownership
        },
        data: { read: true }
    });

    revalidatePath('/');
}

export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user?.id) return;

    await prisma.notification.updateMany({
        where: {
            userId: session.user.id,
            read: false
        },
        data: { read: true }
    });

    revalidatePath('/');
}

// Internal function to create notifications (not exposed as an action directly if not needed, but useful to have here)
export async function createNotification({
    userId,
    type,
    message,
    link
}: {
    userId: string;
    type: string;
    message: string;
    link?: string;
}) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                link
            }
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}
