import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FaPlus, FaHistory, FaTrophy, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { redirect } from 'next/navigation';

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

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                        <FaTrophy className="text-yellow-500" />
                        Simulados Inteligentes
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
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
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl">
                        <FaClock />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 uppercase font-bold">Foco Total</p>
                        <p className="text-sm text-gray-500">Mantenha o ritmo!</p>
                    </div>
                </div>
            </div>

            {/* History List */}
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <FaHistory className="text-gray-400" />
                Histórico Recente
            </h2>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                {history.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Você ainda não realizou nenhum simulado.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {history.map(exam => (
                            <div key={exam.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${exam.status === 'COMPLETED'
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                                        }`}>
                                        {exam.status === 'COMPLETED' ? 'A' : 'P'}
                                    </div>
                                    <div>
                                        <Link
                                            href={exam.status === 'COMPLETED' ? `/simulados/${exam.id}/resultado` : `/simulados/${exam.id}`}
                                            className="font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            Simulado #{exam.id.slice(-4)}
                                        </Link>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(exam.createdAt).toLocaleDateString('pt-BR')}</span>
                                            <span>•</span>
                                            <span>{exam.totalQuestions} Questões</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    {exam.status === 'COMPLETED' ? (
                                        <Link href={`/simulados/${exam.id}/resultado`} className="block text-right group">
                                            <span className="block text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {Math.round((exam.score / exam.totalQuestions) * 100)}%
                                            </span>
                                            <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">Ver Detalhes</span>
                                        </Link>
                                    ) : (
                                        <Link href={`/simulados/${exam.id}`} className="text-sm text-blue-500 font-medium hover:underline">
                                            Continuar
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
