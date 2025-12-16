"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useMemo } from 'react';

type Props = {
    stats: {
        totalValid: number;
        byCategory: Record<string, number>;
    };
    targetHours?: number; // Default 200
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AacDashboard({ stats, targetHours = 200 }: Props) {

    const percentage = Math.min(100, Math.round((stats.totalValid / targetHours) * 100));

    const data = useMemo(() => {
        // Map category stats to chart data
        // We want to show which categories contribute.
        return Object.entries(stats.byCategory).map(([key, value]) => ({
            name: key, // Should probably map Enum to Label
            value
        })).filter(d => d.value > 0);
    }, [stats.byCategory]);

    // Simple Pie Chart + Central Text for Progress

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Main Progress Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center relative">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 self-start w-full">Progresso Geral</h3>

                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[{ name: 'Remaining', value: Math.max(0, targetHours - stats.totalValid) }, { name: 'Completed', value: stats.totalValid }]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="remaining" fill="#E5E7EB" />
                                <Cell key="completed" fill="#3B82F6" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{stats.totalValid}/{targetHours}h</span>
                    </div>
                </div>
            </div>

            {/* Distribution Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Distribuição</h3>
                {data.length > 0 ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                        // Simple Label
                                        return `${(percent || 0 * 100).toFixed(0)}%`;
                                    }}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value}h`} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                        Nenhuma atividade cadastrada ainda.
                    </div>
                )}
            </div>
        </div>
    );
}
