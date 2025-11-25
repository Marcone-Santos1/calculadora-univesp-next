'use client';

import Image from 'next/image';
import { FaUser, FaQuestionCircle, FaComment, FaVoteYea } from 'react-icons/fa';

interface ProfileHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    stats: {
        questions: number;
        comments: number;
        votes: number;
    };
}

export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name || 'User'}
                            width={100}
                            height={100}
                            className="rounded-full border-4 border-blue-100 dark:border-blue-900"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl border-4 border-blue-100 dark:border-blue-900">
                            <FaUser />
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {user.name || 'Usuário'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {user.email}
                    </p>
                </div>

                {/* Stats */}
                <div className="flex gap-4 md:gap-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                            <FaQuestionCircle />
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {stats.questions}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Questões
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                            <FaComment />
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {stats.comments}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Comentários
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                            <FaVoteYea />
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {stats.votes}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Votos
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
