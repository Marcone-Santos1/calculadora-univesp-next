import { getLevel } from '@/utils/reputation';
import { FaStar } from 'react-icons/fa';

interface UserBadgeProps {
    reputation: number;
    showTitle?: boolean;
    className?: string;
}

export function UserBadge({ reputation, showTitle = false, className = '' }: UserBadgeProps) {
    const { level, title } = getLevel(reputation);

    return (
        <div className={`inline-flex items-center gap-1.5 ${className}`}>
            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded text-[10px] font-bold border border-yellow-200 dark:border-yellow-800/50" title={`Nível ${level} (${reputation} pontos)`}>
                <FaStar className="text-[9px]" />
                Lvl {level}
            </div>
            {showTitle && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {title}
                </span>
            )}
        </div>
    );
}
