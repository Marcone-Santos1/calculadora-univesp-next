import Link from 'next/link';
import Image from 'next/image';
import { getLevel } from '@/utils/reputation';
import { FaUser, FaQuestionCircle, FaComment, FaVoteYea, FaStar, FaTrophy, FaMapMarkerAlt, FaGlobe, FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaEdit } from 'react-icons/fa';

interface ProfileHeaderProps {
    user: {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        bio?: string | null;
        location?: string | null;
        website?: string | null;
        socialLinks?: any;
    };
    stats: {
        questions: number;
        comments: number;
        votes: number;
        reputation: number;
    };
    isOwner?: boolean;
}

export function ProfileHeader({ user, stats, isOwner }: ProfileHeaderProps) {
    const { level, title } = getLevel(stats.reputation);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 relative">
            {isOwner && (
                <Link
                    href="/perfil/editar"
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    title="Editar Perfil"
                >
                    <FaEdit size={20} />
                </Link>
            )}

            <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0 mx-auto md:mx-0">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name || 'User'}
                            width={100}
                            height={100}
                            className="rounded-full border-4 border-blue-100 dark:border-blue-900 object-cover"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl border-4 border-blue-100 dark:border-blue-900">
                            <FaUser />
                        </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full border-2 border-white dark:border-gray-800 flex items-center gap-1 shadow-sm">
                        <FaStar className="text-[10px]" />
                        Lvl {level}
                    </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left w-full">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                        {user.name || 'Usuário'}
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium border border-blue-200 dark:border-blue-800">
                            {title}
                        </span>
                    </h1>

                    {user.bio && (
                        <p className="text-gray-600 dark:text-gray-300 mb-3 max-w-2xl">
                            {user.bio}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {user.location && (
                            <div className="flex items-center gap-1">
                                <FaMapMarkerAlt />
                                <span>{user.location}</span>
                            </div>
                        )}
                        {user.website && (
                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                                <FaGlobe />
                                <span>Website</span>
                            </a>
                        )}
                    </div>

                    {/* Social Links */}
                    {user.socialLinks && (
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                            {user.socialLinks.github && (
                                <a href={`https://github.com/${user.socialLinks.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <FaGithub size={20} />
                                </a>
                            )}
                            {user.socialLinks.twitter && (
                                <a href={`https://twitter.com/${user.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                                    <FaTwitter size={20} />
                                </a>
                            )}
                            {user.socialLinks.linkedin && (
                                <a href={`https://linkedin.com/in/${user.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                                    <FaLinkedin size={20} />
                                </a>
                            )}
                            {user.socialLinks.instagram && (
                                <a href={`https://instagram.com/${user.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                                    <FaInstagram size={20} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full">
                        <FaTrophy />
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {stats.reputation}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Reputação
                    </div>
                </div>

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
    );
}
