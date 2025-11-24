import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /admin routes
    if (pathname.startsWith('/admin')) {
        const session = await auth();

        if (!session) {
            // Not authenticated, redirect to home
            return NextResponse.redirect(new URL('/', request.url));
        }

        const isAdmin = session.user?.isAdmin || false;
        if (!isAdmin) {
            // Authenticated but not admin, redirect to home
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*']
};
