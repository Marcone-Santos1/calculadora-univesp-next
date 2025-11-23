import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ isAdmin: false });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { isAdmin: true }
        });

        return NextResponse.json({ isAdmin: user?.isAdmin || false });
    } catch (error) {
        return NextResponse.json({ isAdmin: false });
    }
}
