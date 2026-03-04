import { NextRequest, NextResponse } from 'next/server';
import { sendReengagementEmails } from '@/actions/retention-actions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true';
        const result = await sendReengagementEmails(dryRun);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[Cron] Reengagement error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
