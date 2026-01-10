import { NextRequest, NextResponse } from 'next/server';
import { checkStreakRisks } from '@/actions/retention-actions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        // Simple protection: Check for CRON_SECRET or Admin Bearer
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await checkStreakRisks();

        return NextResponse.json(result);
    } catch (error) {
        console.error('Streak Guardian Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
