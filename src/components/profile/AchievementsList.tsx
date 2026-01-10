import { ACHIEVEMENTS } from '@/utils/achievements';
import { Lock } from 'lucide-react';

interface AchievementsListProps {
    unlockedIds: string[];
}

export function AchievementsList({ unlockedIds }: AchievementsListProps) {
    const unlockedSet = new Set(unlockedIds);

    // Sort: Unlocked first, then by category
    const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
        const aUnlocked = unlockedSet.has(a.id);
        const bUnlocked = unlockedSet.has(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
    });

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedAchievements.map((achievement) => {
                const isUnlocked = unlockedSet.has(achievement.id);

                return (
                    <div
                        key={achievement.id}
                        className={`relative p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${isUnlocked
                            ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
                            : "bg-gray-50 dark:bg-zinc-950 border-gray-100 dark:border-zinc-900 opacity-70 grayscale"
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-1 ${isUnlocked ? "bg-yellow-100 dark:bg-yellow-900/20" : "bg-gray-200 dark:bg-zinc-800"
                            }`}>
                            {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-gray-400" />}
                        </div>

                        <div>
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                {achievement.title}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                                {achievement.description}
                            </p>
                        </div>

                        <div className="absolute top-2 right-2 flex items-center gap-0.5 text-[10px] font-bold text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded-full">
                            +{achievement.points}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
