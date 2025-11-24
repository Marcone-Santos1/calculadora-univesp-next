import { auth } from './auth';

export async function checkIsAdmin(): Promise<boolean> {
    
    const session = await auth();
    if (!session?.user?.email) {
        return false;
    }

    // Check if user has admin flag in database
    const { prisma } = await import('./prisma');
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { isAdmin: true }
    });


    return user?.isAdmin || false;
}

export async function requireAdmin() {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
    }
}
