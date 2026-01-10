'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { checkDailyStreak } from '@/actions/reputation-actions';
import { useToast } from '@/components/ToastProvider';

export function StreakListener() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const hasChecked = useRef(false);

    useEffect(() => {
        if (!session?.user?.id) return;

        // Helper to get today's date string YYYY-MM-DD
        const getTodayString = () => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        };

        const today = getTodayString();
        const key = `streak-checked-${today}-${session.user.id}`;

        // Check immediately if we've already done this today logic-wise (ignoring strict mode reruns for a moment)
        const alreadyChecked = localStorage.getItem(key);
        
        if (alreadyChecked) {
            return;
        }

        // Use ref to prevent double execution in the same session session/mount
        if (hasChecked.current) return;
        hasChecked.current = true;

        const checkStreak = async () => {
            try {
                const result = await checkDailyStreak();
                console.log(result);
                if (result && result.status !== 'UNAUTHENTICATED' && result.status !== 'ERROR' && result.status !== 'USER_NOT_FOUND') {

                    localStorage.setItem(key, 'true');

                    if (result.status === 'STREAK_CONTINUED') {
                        showToast({
                            message: `🔥 Streak! Você está em uma sequência de ${result.streak} dias!`,
                            type: 'success'
                        });
                    } else if (result.status === 'FIRST_LOGIN') {
                        showToast({
                            message: `🎉 Bem-vindo! Primeiro dia de sequência!`,
                            type: 'success'
                        });
                    }
                } else if (result?.status === 'ALREADY_LOGGED_IN_TODAY') {
                    // Even if the server says we already logged in (maybe from another device), mark local storage so we don't ask again
                    localStorage.setItem(key, 'true');
                }
            } catch (e) {
                console.error("Streak check failed", e);
            }
        };

        checkStreak();
    }, [session, showToast]);

    return null;
}
