"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FaTrophy } from 'react-icons/fa';

interface WeeklyData {
    day: string; // "Seg", "Ter", etc.
    xp: number;
    exams: number;
}

export function WeeklyProgressChart({ data }: { data: WeeklyData[] }) {
    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm h-full flex flex-col">
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            hide={false}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-gray-900 border border-gray-800 text-white text-xs p-3 rounded-xl shadow-xl">
                                            <p className="font-bold mb-1 text-purple-400">{payload[0].payload.day}</p>
                                            <div className="flex justify-between gap-4">
                                                <span>XP:</span>
                                                <span className="font-bold">{payload[0].value}</span>
                                            </div>
                                            <div className="flex justify-between gap-4 text-gray-400">
                                                <span>Simulados:</span>
                                                <span>{payload[0].payload.exams}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="xp" radius={[4, 4, 0, 0]} maxBarSize={50}>
                            {/* Use gradient or solid color */}
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.xp > 0 ? '#8B5CF6' : '#E5E7EB'} className="dark:opacity-80" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
