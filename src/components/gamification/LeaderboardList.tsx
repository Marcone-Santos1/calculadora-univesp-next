'use client';

import React from 'react';
import { FaUser, FaComment, FaQuestionCircle, FaStar } from 'react-icons/fa';
import { UserBadge } from './UserBadge';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
        <div className="space-y-3">
            {users.map((user, index) => (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    key={user.id}
                    className="group relative flex items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-gray-700/50 p-4 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                >
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400 font-bold font-mono group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {startIndex + index + 1}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 flex items-center gap-3 overflow-hidden">
                        <Link
                            href={`/perfil/${user.id}`}
                            className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-600 shadow-sm overflow-hidden flex-shrink-0 hover:scale-105 transition-transform relative"
                        >
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 text-xl">
                                    <FaUser />
                                </div>
                            )}
                        </Link>
                        <div className="flex flex-col min-w-0">
                            <Link
                                href={`/perfil/${user.id}`}
                                className="font-bold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {user.name || 'Anônimo'}
                            </Link>
                            <UserBadge reputation={user.reputation} />
                        </div>
                    </div>

                    {/* Stats - Hidden on small mobile */}
                    <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center" title="Questões">
                            <FaQuestionCircle className="mb-1 text-gray-400" />
                            <span className="font-semibold">{user._count.questions}</span>
                        </div>
                        <div className="flex flex-col items-center" title="Comentários">
                            <FaComment className="mb-1 text-gray-400" />
                            <span className="font-semibold">{user._count.comments}</span>
                        </div>
                    </div>

                    {/* Reputation Score */}
                    <div className="flex-shrink-0 text-right">
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 rounded-full font-bold text-sm border border-yellow-400/20 shadow-inner">
                            <FaStar className="text-yellow-500" />
                            {user.reputation}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
