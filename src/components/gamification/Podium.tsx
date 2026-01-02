'use client';

import React from 'react';
import { FaCrown, FaUser } from 'react-icons/fa';
import { UserBadge } from './UserBadge';
import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

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
    const first = topUsers[0];
    const second = topUsers[1];
    const third = topUsers[2];

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item: Variants = {
        hidden: { y: 50, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                bounce: 0.4
            }
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex items-end justify-center gap-4 md:gap-8 mb-16 min-h-[300px]"
        >
            {/* Second Place */}
            <motion.div variants={item} className="flex flex-col items-center w-1/3 max-w-[200px] relative z-10 order-1 md:order-none">
                {second && (
                    <>
                        <div className="relative mb-4 group">
                            <Link href={`/perfil/${second.id}`} className="block w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gray-300 dark:border-gray-500 overflow-hidden bg-gray-200 shadow-xl transition-transform transform group-hover:scale-105 relative z-10">
                                {second.image ? (
                                    <Image src={second.image} alt={second.name || 'User'} fill className="object-cover" sizes="96px" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl"><FaUser /></div>
                                )}
                            </Link>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-900 text-sm font-bold px-3 py-1 rounded-full shadow-lg z-20">2º</div>

                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gray-400 opacity-20 blur-xl rounded-full -z-10 group-hover:opacity-40 transition-opacity"></div>
                        </div>
                        <div className="text-center mb-2">
                            <Link href={`/perfil/${second.id}`} className="font-bold text-gray-900 dark:text-white truncate max-w-full hover:text-blue-600 transition-colors block text-sm md:text-base">
                                {second.name || 'Anônimo'}
                            </Link>
                            <div className="scale-90"><UserBadge reputation={second.reputation} /></div>
                        </div>
                        <div className="w-full h-32 md:h-40 bg-gradient-to-t from-gray-400/20 to-gray-200/50 dark:from-gray-700/50 dark:to-gray-500/20 rounded-t-2xl shadow-lg border-x border-t border-white/20 backdrop-blur-md flex items-end justify-center pb-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-400/10 to-transparent"></div>
                            <span className="text-2xl font-bold text-gray-600 dark:text-gray-300 relative z-10">{second.reputation}</span>
                        </div>
                    </>
                )}
            </motion.div>

            {/* First Place */}
            <motion.div variants={item} className="flex flex-col items-center w-1/3 max-w-[220px] relative z-20 order-2 md:order-none -mt-12">
                {first && (
                    <>
                        <div className="relative mb-6 group">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="absolute -top-12 left-1/2 -translate-x-1/2 z-30"
                            >
                                <FaCrown className="text-yellow-400 text-5xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]" />
                            </motion.div>

                            <Link href={`/perfil/${first.id}`} className="block w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-yellow-400 overflow-hidden bg-yellow-100 shadow-2xl transition-transform transform group-hover:scale-105 relative z-10 ring-4 ring-yellow-400/30">
                                {first.image ? (
                                    <Image src={first.image} alt={first.name || 'User'} fill className="object-cover" sizes="128px" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-yellow-500 text-5xl"><FaUser /></div>
                                )}
                            </Link>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-base font-bold px-4 py-1.5 rounded-full shadow-lg z-20 border border-yellow-300">1º</div>

                            {/* Epic Glow Effect */}
                            <div className="absolute inset-0 bg-yellow-400 opacity-40 blur-2xl rounded-full -z-10 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                        </div>
                        <div className="text-center mb-2">
                            <Link href={`/perfil/${first.id}`} className="font-bold text-lg text-gray-900 dark:text-white truncate max-w-full hover:text-blue-600 transition-colors block">
                                {first.name || 'Anônimo'}
                            </Link>
                            <div className="scale-100"><UserBadge reputation={first.reputation} /></div>
                        </div>
                        <div className="w-full h-48 md:h-56 bg-gradient-to-t from-yellow-500/20 to-yellow-200/50 dark:from-yellow-600/50 dark:to-yellow-500/20 rounded-t-2xl shadow-xl border-x border-t border-yellow-200/30 backdrop-blur-md flex items-end justify-center pb-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent"></div>
                            {/* Shine effect */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>

                            <span className="text-4xl font-black text-yellow-800 dark:text-yellow-100 relative z-10 drop-shadow-sm">{first.reputation}</span>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Third Place */}
            <motion.div variants={item} className="flex flex-col items-center w-1/3 max-w-[200px] relative z-10 order-3 md:order-none">
                {third && (
                    <>
                        <div className="relative mb-4 group">
                            <Link href={`/perfil/${third.id}`} className="block w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-amber-700 dark:border-amber-600 overflow-hidden bg-amber-100 shadow-xl transition-transform transform group-hover:scale-105 relative z-10">
                                {third.image ? (
                                    <Image src={third.image} alt={third.name || 'User'} fill className="object-cover" sizes="96px" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-amber-500 text-3xl"><FaUser /></div>
                                )}
                            </Link>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg z-20">3º</div>

                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-amber-600 opacity-20 blur-xl rounded-full -z-10 group-hover:opacity-40 transition-opacity"></div>
                        </div>
                        <div className="text-center mb-2">
                            <Link href={`/perfil/${third.id}`} className="font-bold text-gray-900 dark:text-white truncate max-w-full hover:text-blue-600 transition-colors block text-sm md:text-base">
                                {third.name || 'Anônimo'}
                            </Link>
                            <div className="scale-90"><UserBadge reputation={third.reputation} /></div>
                        </div>
                        <div className="w-full h-24 md:h-32 bg-gradient-to-t from-amber-700/20 to-amber-500/50 dark:from-amber-800/50 dark:to-amber-600/20 rounded-t-2xl shadow-lg border-x border-t border-white/20 backdrop-blur-md flex items-end justify-center pb-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-amber-700/10 to-transparent"></div>
                            <span className="text-2xl font-bold text-amber-900 dark:text-amber-100 relative z-10">{third.reputation}</span>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};
