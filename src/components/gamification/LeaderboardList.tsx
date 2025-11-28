import React from 'react';
import { FaUser, FaComment, FaQuestionCircle, FaStar } from 'react-icons/fa';
import { UserBadge } from './UserBadge';
import Link from 'next/link';
import Image from 'next/image';

interface LeaderboardUser {
    id: string;
    name: string | null;
    image: string | null;
    reputation: number;
    _count: {
        questions: number;
        comments: number;
        votes: number;
    }
}

interface LeaderboardListProps {
    users: LeaderboardUser[];
    startIndex: number;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({ users, startIndex }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4 w-16 text-center">#</th>
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4 text-center hidden md:table-cell">Questões</th>
                            <th className="px-6 py-4 text-center hidden md:table-cell">Comentários</th>
                            <th className="px-6 py-4 text-right">Reputação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {users.map((user, index) => (
                            <tr
                                key={user.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                            >
                                <td className="px-6 py-4 text-center font-bold text-gray-500 dark:text-gray-400">
                                    {startIndex + index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/perfil/${user.id}`}
                                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity relative"
                                        >
                                            {user.image ? (
                                                <Image
                                                    src={user.image}
                                                    alt={user.name || 'User'}
                                                    fill
                                                    className="object-cover"
                                                    sizes="40px"
                                                />
                                            ) : (
                                                <FaUser className="text-gray-400" />
                                            )}
                                        </Link>
                                        <div className="flex flex-col">
                                            <Link
                                                href={`/perfil/${user.id}`}
                                                className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                {user.name || 'Anônimo'}
                                            </Link>
                                            <UserBadge reputation={user.reputation} />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center hidden md:table-cell">
                                    <div className="flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-400">
                                        <FaQuestionCircle className="text-xs" />
                                        <span>{user._count.questions}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center hidden md:table-cell">
                                    <div className="flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-400">
                                        <FaComment className="text-xs" />
                                        <span>{user._count.comments}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full font-bold text-sm">
                                        <FaStar className="text-xs" />
                                        {user.reputation}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
