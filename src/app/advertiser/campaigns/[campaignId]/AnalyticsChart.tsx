"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function AnalyticsChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Nenhum dado disponível para o período.
            </div>
        );
    }

    // Format data for Recharts
    const chartData = data.map(d => ({
        date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        clicks: d.clicks,
        views: d.views,
        spend: d.spend / 100 // Convert to Reais
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
                <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    dx={-10}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontSize: '12px' }}
                    labelStyle={{ marginBottom: '4px', fontWeight: 'bold', color: '#111827' }}
                />
                <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="url(#colorViews)"
                    strokeWidth={2}
                    name="Visualizações"
                />
                <Area
                    type="monotone"
                    dataKey="clicks"
                    stackId="2"
                    stroke="#22c55e"
                    fill="url(#colorClicks)"
                    strokeWidth={2}
                    name="Cliques"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
