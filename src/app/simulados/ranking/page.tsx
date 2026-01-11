import { auth } from '@/lib/auth';
import { getLeaderboard } from '@/actions/mock-exam-actions';
import { redirect } from 'next/navigation';
import { FaTrophy, FaMedal, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default async function LeaderboardPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const leaderboard = await getLeaderboard(20);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/simulados" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    <FaArrowLeft className="text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <FaTrophy className="text-yellow-500" /> Ranking Global
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Os melhores estudantes da plataforma</p>
                </div>
            </div>

            {/* Top 3 Podium (Optional, let's keep it simple list first or fancy podium?) */}
            {/* Let's do a nice list with special styling for top 3 */}

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-gray-500 font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-20 text-center">#</th>
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4 text-right">XP Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {leaderboard.map((user) => (
                                <tr key={user.userId} className={`hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors ${user.userId === session.user.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        {user.rank === 1 && <span className="text-2xl">🥇</span>}
                                        {user.rank === 2 && <span className="text-2xl">🥈</span>}
                                        {user.rank === 3 && <span className="text-2xl">🥉</span>}
                                        {user.rank > 3 && <span className="font-bold text-gray-400">#{user.rank}</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-700 shadow-sm" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-gray-500">
                                                    <FaUserCircle className="text-2xl" />
                                                </div>
                                            )}
                                            <div>
                                                <p className={`font-bold ${user.userId === session.user.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {user.name}
                                                    {user.userId === session.user.id && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">Você</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-black text-purple-600 dark:text-purple-400 text-lg">{user.xp.toLocaleString()} XP</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
