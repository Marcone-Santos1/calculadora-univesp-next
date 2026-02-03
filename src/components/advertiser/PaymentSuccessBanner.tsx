"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const POLL_INTERVAL_MS = 3000;
const POLL_DURATION_MS = 60000; // 1 min

export function PaymentSuccessBanner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const success = searchParams.get("success") === "true";
    const startedAt = useRef<number | null>(null);

    useEffect(() => {
        if (!success) return;

        if (!startedAt.current) {
            startedAt.current = Date.now();
        }

        const interval = setInterval(() => {
            const elapsed = Date.now() - (startedAt.current ?? 0);
            if (elapsed >= POLL_DURATION_MS) {
                clearInterval(interval);
                router.replace("/advertiser/dashboard/finance", { scroll: false });
                return;
            }
            router.refresh();
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [success, router]);

    if (!success) return null;

    return (
        <div
            role="alert"
            className="mb-6 flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-blue-600/30 border-t-blue-600 animate-spin dark:border-blue-400/30 dark:border-t-blue-400" />
            </div>
            <div className="flex-1">
                <p className="font-medium">Pagamento recebido</p>
                <p className="text-sm opacity-90">
                    Seu pagamento está sendo processado. Atualizamos os dados automaticamente.
                </p>
            </div>
        </div>
    );
}
