import { auth } from './auth';

export async function checkIsAdmin(): Promise<boolean> {
    const session = await auth();

    // isAdmin is now included in the session JWT
    // No database query needed
    return session?.user?.isAdmin || false;
}

export async function requireAdmin() {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
    }
}
