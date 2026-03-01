import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

// ─── Bot Detection ───────────────────────────────────────────────────────────

/** User-agents de scrapers/bots maliciosos (case-insensitive). */
const BAD_BOT_PATTERN =
    /python-requests|httpx|scrapy|wget|curl\/|libwww-perl|Go-http-client|java\/|httpclient|node-fetch|undici|puppeteer|playwright|headlesschrome|phantomjs|selenium|apache-httpclient/i;

/** Bots legítimos que precisam acessar para SEO/indexação. */
const GOOD_BOT_PATTERN =
    /googlebot|bingbot|slurp|duckduckbot|yandexbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|amazonbot|petalbot|google-inspectiontool|googleother|google-extended|gptbot|chatgpt-user|vercel|uptime/i;

/**
 * Retorna true se o user-agent é de um bot malicioso.
 * Bots bons (Google, Bing, etc.) são sempre liberados.
 */
function isMaliciousBot(userAgent: string | null): boolean {
    if (!userAgent) return false; // Sem UA → não bloquear (pode ser monitor interno)
    if (GOOD_BOT_PATTERN.test(userAgent)) return false;
    return BAD_BOT_PATTERN.test(userAgent);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Middleware Principal ────────────────────────────────────────────────────

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ──────────────────────────────────────────────────────────
    // 🛡️ 1. Bloqueio de bots maliciosos por User-Agent
    // ──────────────────────────────────────────────────────────
    const userAgent = request.headers.get('user-agent');
    if (isMaliciousBot(userAgent)) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // ──────────────────────────────────────────────────────────
    // 🛡️ 2. Rate limit global: 120 requests/min por IP
    // ──────────────────────────────────────────────────────────
    const ip = getClientIP(request.headers);
    const { success: withinLimit } = rateLimit(`global:${ip}`, 120, 60_000);
    if (!withinLimit) {
        return new NextResponse('Too Many Requests', {
            status: 429,
            headers: { 'Retry-After': '60' },
        });
    }

    // ──────────────────────────────────────────────────────────
    // Redirect /questoes/[id] → path canônico (não exige sessão)
    // ──────────────────────────────────────────────────────────
    const questionRedirect = await tryQuestionIdRedirect(request);
    if (questionRedirect) return questionRedirect;

    // ──────────────────────────────────────────────────────────
    // Rotas protegidas: exige autenticação
    // ──────────────────────────────────────────────────────────
    if (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/perfil') ||
        pathname.startsWith('/simulados')
    ) {
        const session = await auth();

        if (pathname.startsWith('/admin')) {
            if (!session) return NextResponse.redirect(new URL('/', request.url));
            const isAdmin = session.user?.isAdmin || false;
            if (!isAdmin) return NextResponse.redirect(new URL('/', request.url));
        }

        if (pathname.startsWith('/perfil') || pathname.startsWith('/simulados')) {
            if (!session) return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static  (static files)
         * - _next/image   (image optimization)
         * - favicon.ico   (favicon)
         * - public files  (images, manifest, etc.)
         */
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt|webmanifest)$).*)',
    ],
};

