import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const session = await auth();


    // Protect /admin routes
    if (pathname.startsWith('/admin')) {

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

    if (!session) {
        // Not authenticated, redirect to home
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/perfil/:path*', '/simulados/:path*']
};
