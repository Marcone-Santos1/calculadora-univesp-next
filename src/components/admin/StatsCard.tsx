'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: ReactNode;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function StatsCard({ title, value, icon, color = 'blue' }: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
        red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
