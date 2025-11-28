import React from 'react';
import { FaCrown, FaUser } from 'react-icons/fa';
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

interface PodiumProps {
    topUsers: LeaderboardUser[];
}

export const Podium: React.FC<PodiumProps> = ({ topUsers }) => {
    // Ensure we have at least 3 spots, filling with null if needed
    const first = topUsers[0];
    const second = topUsers[1];
    const third = topUsers[2];

    return (
        <div className="flex items-end justify-center gap-4 mb-12 min-h-[300px]">
            {/* Second Place */}
            <div className="flex flex-col items-center w-1/3 max-w-[200px]">
                {second && (
                    <>
                        <div className="relative mb-4">
                            <Link href={`/perfil/${second.id}`} className="block w-20 h-20 rounded-full border-4 border-gray-300 overflow-hidden bg-gray-200 hover:opacity-80 transition-opacity relative">
                                {second.image ? (
                                    <Image
                                        src={second.image}
                                        alt={second.name || 'User'}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                                        <FaUser />
                                    </div>
                                )}
                            </Link>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                2º
                            </div>
                        </div>
                        <div className="text-center mb-2">
                            <Link href={`/perfil/${second.id}`} className="font-bold text-gray-900 dark:text-white truncate max-w-full hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                {second.name || 'Anônimo'}
                            </Link>
                            <UserBadge reputation={second.reputation} />
                        </div>
                        <div className="w-full h-32 bg-gradient-to-t from-gray-300 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-t-lg shadow-lg flex items-end justify-center pb-4">
                            <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">{second.reputation}</span>
                        </div>
                    </>
                )}
            </div>

            {/* First Place */}
            <div className="flex flex-col items-center w-1/3 max-w-[220px] z-10">
                {first && (
                    <>
                        <div className="relative mb-4">
                            <FaCrown className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 text-4xl drop-shadow-md animate-bounce" />
                            <Link href={`/perfil/${first.id}`} className="block w-24 h-24 rounded-full border-4 border-yellow-400 overflow-hidden bg-yellow-100 shadow-xl hover:opacity-80 transition-opacity relative">
                                {first.image ? (
                                    <Image
                                        src={first.image}
                                        alt={first.name || 'User'}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-yellow-500 text-4xl">
                                        <FaUser />
                                    </div>
                                )}
                            </Link>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full shadow-sm">
                                1º
                            </div>
                        </div>
                        <div className="text-center mb-2">
                            <Link href={`/perfil/${first.id}`} className="font-bold text-lg text-gray-900 dark:text-white truncate max-w-full hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                {first.name || 'Anônimo'}
                            </Link>
                            <UserBadge reputation={first.reputation} />
                        </div>
                        <div className="w-full h-40 bg-gradient-to-t from-yellow-400 to-yellow-200 dark:from-yellow-600 dark:to-yellow-500 rounded-t-lg shadow-xl flex items-end justify-center pb-4">
                            <span className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{first.reputation}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Third Place */}
            <div className="flex flex-col items-center w-1/3 max-w-[200px]">
                {third && (
                    <>
                        <div className="relative mb-4">
                            <Link href={`/perfil/${third.id}`} className="block w-20 h-20 rounded-full border-4 border-amber-600 overflow-hidden bg-amber-100 hover:opacity-80 transition-opacity relative">
                                {third.image ? (
                                    <Image
                                        src={third.image}
                                        alt={third.name || 'User'}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-amber-500 text-3xl">
                                        <FaUser />
                                    </div>
                                )}
                            </Link>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                3º
                            </div>
                        </div>
                        <div className="text-center mb-2">
                            <Link href={`/perfil/${third.id}`} className="font-bold text-gray-900 dark:text-white truncate max-w-full hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                {third.name || 'Anônimo'}
                            </Link>
                            <UserBadge reputation={third.reputation} />
                        </div>
                        <div className="w-full h-24 bg-gradient-to-t from-amber-600 to-amber-400 dark:from-amber-800 dark:to-amber-700 rounded-t-lg shadow-lg flex items-end justify-center pb-4">
                            <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">{third.reputation}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
