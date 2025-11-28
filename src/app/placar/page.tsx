import { getLeaderboard } from '@/actions/user-actions';
import { Podium } from '@/components/gamification/Podium';
import { LeaderboardList } from '@/components/gamification/LeaderboardList';
import { FaTrophy } from 'react-icons/fa';

export const metadata = {
    title: 'Placar de Líderes | Calculadora Univesp',
    description: 'Veja os usuários que mais contribuem para a comunidade.',
};

export default async function LeaderboardPage() {
    const users = await getLeaderboard(50);
    const topUsers = users.slice(0, 3);
    const restUsers = users.slice(3);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mb-4">
                        <FaTrophy className="text-3xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Placar de Líderes
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Reconhecendo os membros que mais ajudam a comunidade através de perguntas, respostas e verificações.
                    </p>
                </div>

                {users.length > 0 ? (
                    <>
                        <Podium topUsers={topUsers} />

                        {restUsers.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-2">
                                    Top Contribuidores
                                </h2>
                                <LeaderboardList users={restUsers} startIndex={3} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">
                            Ainda não há dados suficientes para o placar.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
