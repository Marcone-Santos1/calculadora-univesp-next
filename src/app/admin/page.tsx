/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminStats } from '@/actions/admin-actions';
import { StatsCard } from '@/components/admin/StatsCard';
import { FaUsers, FaQuestionCircle, FaComments, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import Link from 'next/link';
import { ActivityChart } from '@/components/admin/charts/ActivityChart';
import { SubjectChart } from '@/components/admin/charts/SubjectChart';

export default async function AdminDashboard() {
    const stats = await getAdminStats();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Dashboard
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<FaUsers className="text-2xl" />}
                    color="blue"
                />
                <StatsCard
                    title="Total Questions"
                    value={stats.totalQuestions}
                    icon={<FaQuestionCircle className="text-2xl" />}
                    color="green"
                />
                <StatsCard
                    title="Total Comments"
                    value={stats.totalComments}
                    icon={<FaComments className="text-2xl" />}
                    color="purple"
                />
                <StatsCard
                    title="Verified Questions"
                    value={stats.verifiedQuestions}
                    icon={<FaCheckCircle className="text-2xl" />}
                    color="orange"
                />
                
                <StatsCard 
                    title="Feedbacks" 
                    value={stats.feedbackCount} 
                    icon={<FaExclamationCircle />} 
                    color="red"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Atividade (Últimos 30 dias)
                    </h2>
                    <ActivityChart data={stats.dailyActivity} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Distribuição por Matéria
                    </h2>
                    <SubjectChart data={stats.subjectDistribution} />
                </div>
            </div>

            {/* Recent Questions */}
            <div className="bg-white mb-8 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Recent Questions
                </h2>
                <div className="space-y-3">
                    {stats.recentQuestions.map((question: any) => (
                        <div
                            key={question.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                            <div className="flex-1">
                                <Link
                                    href={`/questoes/${question.id}`}
                                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    {question.title}
                                </Link>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    by {question.user.name} • {question.subject.name}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                {new Date(question.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                    ))}
                    {stats.recentQuestions.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No questions yet</p>
                    )}
                </div>
            </div>

            {/* Feedbacks Recentes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 dark:text-white">Últimos Feedbacks</h3>
                    <Link href="/admin/feedbacks" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
                </div>
                
                <div className="space-y-4">
                    {stats.recentFeedback.map((f: any) => (
                        <div key={f.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className={`w-2 h-2 mt-2 rounded-full ${f.type === 'BUG' ? 'bg-red-500' : 'bg-blue-500'}`} />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 font-medium">
                                    {f.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {f.user?.name || 'Anônimo'} • {new Date(f.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                    {stats.recentFeedback.length === 0 && <p className="text-gray-500 text-sm">Nenhum feedback ainda.</p>}
                </div>
            </div>
        </div>
    );
}
