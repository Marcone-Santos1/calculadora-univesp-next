import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

/** Segment parece um ID de questão (CUID): 20–30 caracteres alfanuméricos, sem hífen. */
function looksLikeQuestionId(segment: string): boolean {
    return /^[a-z0-9]{20,30}$/i.test(segment) && !segment.includes('-');
}

/**
 * Redireciona /questoes/[id] para o path canônico com 308 (antes de qualquer RSC),
 * evitando falha do permanentRedirect quando o usuário está logado.
 */
async function tryQuestionIdRedirect(request: NextRequest): Promise<NextResponse | null> {
    const pathname = request.nextUrl.pathname;
    const match = pathname.match(/^\/questoes\/([^/]+)\/?$/);
    if (!match) return null;

    const segment = match[1];
    if (!looksLikeQuestionId(segment)) return null;

    const origin = request.nextUrl.origin;
    const resolveUrl = `${origin}/api/resolve-question-id?id=${encodeURIComponent(segment)}`;

    try {
        const res = await fetch(resolveUrl, {
            headers: { cookie: request.headers.get('cookie') ?? '' },
            cache: 'no-store',
        });
        if (!res.ok) return null;

        const data = (await res.json()) as { path?: string };
        if (typeof data?.path !== 'string' || !data.path.startsWith('/')) return null;

        return NextResponse.redirect(new URL(data.path, origin), 308);
    } catch {
        return null;
    }
}

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Redirect /questoes/[id] → path canônico (não exige sessão)
    const questionRedirect = await tryQuestionIdRedirect(request);
    if (questionRedirect) return questionRedirect;

    // Rotas protegidas: exige autenticação apenas para /admin, /perfil e /simulados
    const session = await auth();

    if (pathname.startsWith('/admin')) {
        if (!session) return NextResponse.redirect(new URL('/', request.url));
        const isAdmin = session.user?.isAdmin || false;
        if (!isAdmin) return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith('/perfil') || pathname.startsWith('/simulados')) {
        if (!session) return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/perfil/:path*', '/simulados/:path*', '/questoes/:path'],
};
