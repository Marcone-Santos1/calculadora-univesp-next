"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { getActivities, saveActivity, deleteActivity, syncActivities, ActivityData } from "@/actions/aac-actions";
import { validateActivity } from "@/lib/aac-validation";
import { AacCategory } from "@prisma/client";

const STORAGE_KEY = "univesp_aac_data_v2";

export function useAacData() {
    const { data: session, status } = useSession();
    const [activities, setActivities] = useState<ActivityData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [needsSync, setNeedsSync] = useState(false);

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            if (status === "authenticated") {
                // Logged in: Fetch from server
                try {
                    const serverData = await getActivities();
                    setActivities(serverData.map(a => ({
                        // Adapt Prisma date objects to Date if needed (server actions usually return Date objects if using standard setup, but sometimes JSON/plain objects over wire)
                        // Prisma dates are Date objects in server side, but over network (Server Action) they are serialized.
                        // Next.js Server Actions serialize Date objects fine.
                        ...a,
                        category: a.category as AacCategory // cast enum
                    })));
                } catch (e) {
                    console.error("Failed to load server activities", e);
                }
            } else if (status === "unauthenticated") {
                // Visitor: Load from localStorage
                const local = localStorage.getItem(STORAGE_KEY);
                if (local) {
                    try {
                        const parsed = JSON.parse(local);
                        // Revive dates
                        const revived = parsed.map((a: any) => ({
                            ...a,
                            startDate: a.startDate ? new Date(a.startDate) : undefined,
                            endDate: a.endDate ? new Date(a.endDate) : undefined
                        }));
                        setActivities(revived);
                    } catch (e) {
                        console.error("Failed to parse local activities", e);
                    }
                }
            }
            setIsLoading(false);
        };

        if (status !== "loading") {
            loadData();
        }
    }, [status]);

    // Check for sync need (Login detected + Local data exists)
    useEffect(() => {
        if (status === "authenticated" && !isSyncing) {
            const local = localStorage.getItem(STORAGE_KEY);
            if (local) {
                // Check if we have data to sync
                const parsed = JSON.parse(local);
                if (parsed.length > 0) {
                    setNeedsSync(true);
                }
            }
        }
    }, [status, isSyncing]);

    const performSync = async () => {
        if (!needsSync) return;

        setIsSyncing(true);
        try {
            const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            // Revive dates for server action
            const revived = local.map((a: any) => ({
                ...a,
                startDate: a.startDate ? new Date(a.startDate) : undefined,
                endDate: a.endDate ? new Date(a.endDate) : undefined
            }));

            await syncActivities(revived);

            // Clear local storage after success
            localStorage.removeItem(STORAGE_KEY);
            setNeedsSync(false);

            // Refresh list
            const serverData = await getActivities();
            setActivities(serverData);

            // Toast success (caller should handle UI feedback, but we can do simple alert or return success)
        } catch (e) {
            console.error("Sync failed", e);
        } finally {
            setIsSyncing(false);
        }
    };

    // CRUD Operations
    const addActivity = async (input: Omit<ActivityData, "id" | "validHours">) => {
        // Calculate valid hours locally first (for optimistic or local storage)
        const validation = validateActivity({
            ...input,
            originalHours: input.originalHours // cast
        }, activities);

        const newActivity: ActivityData = {
            ...input,
            id: status === "authenticated" ? undefined : crypto.randomUUID(), // Temp ID for local
            validHours: validation.validHours
        };

        if (status === "authenticated") {
            // Optimistic update could be handled here if we used useOptimistic, 
            // but for simplicity we'll await server action then update, or local update then revalidate.
            // Let's do: Update local state immediately (Optimistic-ish), then server.
            setActivities(prev => [...prev, newActivity]); // Note: newActivity has no real ID yet, might be issue for keys

            try {
                await saveActivity(newActivity);
                // Re-fetch to get real ID and confirmed state
                const refreshed = await getActivities();
                setActivities(refreshed);
            } catch (e) {
                console.error("Failed to save", e);
                // Revert?
            }
        } else {
            // Local Storage
            const updated = [...activities, newActivity];
            setActivities(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
    };

    const updateActivity = async (id: string, input: Omit<ActivityData, "id" | "validHours">) => {
        // Calculate valid hours
        const validation = validateActivity({
            ...input,
            originalHours: input.originalHours
        }, activities.filter(a => a.id !== id)); // Exclude self for count check if needed (though count check usually just checks counts)

        const updatedActivity: ActivityData = {
            ...input,
            id,
            validHours: validation.validHours
        };

        if (status === "authenticated") {
            // Optimistic
            setActivities(prev => prev.map(a => a.id === id ? updatedActivity : a));

            try {
                await saveActivity(updatedActivity);
                // Re-fetch
                const refreshed = await getActivities();
                setActivities(refreshed);
            } catch (e) {
                console.error("Failed to update", e);
                // Revert? (Complex without previous state clone, skipping for now)
            }
        } else {
            const updated_list = activities.map(a => a.id === id ? updatedActivity : a);
            setActivities(updated_list);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated_list));
        }
    };

    const removeActivity = async (id: string) => {
        // Optimistic
        const previous = activities;
        setActivities(prev => prev.filter(a => a.id !== id));

        if (status === "authenticated") {
            try {
                await deleteActivity(id);
            } catch (e) {
                console.error("Failed to delete", e);
                setActivities(previous); // Revert
            }
        } else {
            const updated = previous.filter(a => a.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
    };

    // Derived Stats
    const stats = useMemo(() => {
        const totalValid = activities.reduce((acc, curr) => acc + (curr.validHours || 0), 0);
        // By Group
        const byCategory = activities.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + (curr.validHours || 0);
            return acc;
        }, {} as Record<string, number>);

        return { totalValid, byCategory };
    }, [activities]);

    return {
        activities,
        isLoading,
        addActivity,
        updateActivity,
        removeActivity,
        stats,
        needsSync,
        performSync,
        isSyncing
    };
}
