'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { SubjectPerformance } from '@/utils/simulado-stats';
import { useMemo } from 'react';

export function SubjectRadarChart({ data }: { data: SubjectPerformance[] }) {
    // If we have too few data points (e.g., 1 subject), Radar chart looks bad.
    // We can fallback or just show it. Ideally needs at least 3 points for a polygon.
    // If < 3, we might want to inject "dummy" points or handle gracefully?
    // For now, let's just render.

    // Filter out subjects with 0 questions? No, we need them if they were in the exam.

    // Sort logic? Maybe consistent order is better than performance order for Radar?
    // Let's keep the order passed (which is performance sorted) or alphabet?
    // Alphabetical is better for "shape" consistency.
    const chartData = useMemo(() => {
        return [...data].sort((a, b) => a.subject.localeCompare(b.subject));
    }, [data]);

    if (data.length === 0) return null;

    return (
        <div className="w-full h-[300px] bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 relative">
            <h3 className="absolute top-4 left-4 text-sm font-bold text-gray-500 uppercase tracking-wider z-10">
                Desempenho por Matéria
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Acertos (%)"
                        dataKey="percentage"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="#8b5cf6"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-xl">
                                        <p className="font-bold">{d.subject}</p>
                                        <p>{d.percentage}% ({d.correct}/{d.total})</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
