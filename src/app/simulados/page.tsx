import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FaHistory, FaTrophy, FaChartLine, FaFire, FaMedal, FaPlus } from 'react-icons/fa';
import { redirect } from 'next/navigation';
import { SimuladoHistoryTimeline } from '@/components/simulados/SimuladoHistoryTimeline';
import { WeeklyProgressChart } from '@/components/simulados/WeeklyProgressChart';
import { createMockExam, getWeeklyProgress, getSimuladoStreak } from "@/actions/mock-exam-actions";

export default async function SimuladosDashboard() {
    const session = await auth();

    if (!session?.user) redirect('/login');

    const history = await prisma.mockExam.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    const totalSimulados = await prisma.mockExam.count({ where: { userId: session.user.id, status: 'COMPLETED' } });
    const bestScore = await prisma.mockExam.findFirst({
        where: { userId: session.user.id, status: 'COMPLETED' },
        orderBy: { score: 'desc' },
        select: { score: true, totalQuestions: true }
    });

    const weeklyData = await getWeeklyProgress();

    const userStreak = await getSimuladoStreak(session.user.id);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                        <FaTrophy className="text-yellow-500" />
                        Simulados Premium
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Treine com foco e suba no ranking!</p>
                </div>

                <Link
                    href="/simulados/novo"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                    <FaPlus />
                    Criar Novo Simulado
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">
                        <FaHistory />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 uppercase font-bold">Realizados</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalSimulados}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-xl">
                        <FaTrophy />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 uppercase font-bold">Melhor Nota</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {bestScore ? `${bestScore.score}/${bestScore.totalQuestions}` : '-'}
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 text-xl">
                        <FaFire />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 uppercase font-bold">Sequência</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userStreak} dias</p>
                    </div>
                </div>

                {/* Mini Chart / Insight */}
                <div className="hidden md:flex bg-gradient-to-br from-purple-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1 opacity-90">
                        <FaChartLine /> Insight
                    </div>
                    <p className="font-bold text-lg leading-tight">Mantenha a constância para dobrar seu aprendizado!</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Timeline (History) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <FaHistory className="text-gray-400" />
                        Linha do Tempo
                    </h2>
                    <SimuladoHistoryTimeline history={history} />
                </div>

                {/* Right Column: Weekly Stats & More */}
                <div className="space-y-6">
                    <div className="sticky top-24 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <FaChartLine className="text-gray-400" />
                                Desempenho
                            </h2>
                            <div className="flex gap-2">
                                <Link href="/simulados/ranking" className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full font-bold hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors flex items-center gap-1">
                                    <FaTrophy /> Ranking
                                </Link>
                                <div className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <FaMedal /> {weeklyData.reduce((acc: number, curr: any) => acc + curr.xp, 0)} XP
                                </div>
                            </div>
                        </div>
                        <WeeklyProgressChart data={weeklyData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
