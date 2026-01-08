'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaBell, FaTrophy, FaStar, FaComment, FaReply, FaHeart, FaCheckCircle, FaExclamationTriangle, FaTrash, FaBullhorn } from 'react-icons/fa';
import Link from 'next/link';
import { getNotificationData, markAsRead, markAllAsRead } from '@/actions/notification-actions';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: Date;
    link?: string | null;
}

export function NotificationBell() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        if (session?.user?.id) {
            setIsLoading(true);
            try {
                const { notifications: data, unreadCount: count } = await getNotificationData(session.user.id);
                setNotifications(data);
                setUnreadCount(count);
            } finally {
                setIsLoading(false);
            }
        }
    }, [session]);

    useEffect(() => {
        fetchNotifications();
        // Poll every 2 minutes to conserve database connections
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string, link?: string | null) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Background update
        markAsRead(id);

        setIsOpen(false);
    };

    const handleMarkAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        await markAllAsRead();
    };

    const getIconForType = (type: string) => {
        // Handle Announcement Subtypes
        if (type.startsWith('ANNOUNCEMENT')) {
            const subtype = type.split('|')[1]?.trim();
            switch (subtype) {
                case 'IMPORTANT':
                    return <div className="p-2 bg-red-600 text-white rounded-full shadow-md"><FaBullhorn /></div>;
                case 'WARNING':
                    return <div className="p-2 bg-amber-500 text-white rounded-full shadow-md"><FaBullhorn /></div>;
                case 'INFO':
                default:
                    return <div className="p-2 bg-blue-600 text-white rounded-full shadow-md"><FaBullhorn /></div>;
            }
        }

        switch (type) {
            case 'ACHIEVEMENT': return <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full"><FaTrophy /></div>;
            case 'REPUTATION': return <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><FaStar /></div>;
            case 'COMMENT': return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><FaComment /></div>;
            case 'REPLY': return <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full"><FaReply /></div>;
            case 'VOTE': return <div className="p-2 bg-pink-100 text-pink-600 rounded-full"><FaHeart /></div>; // Heart for vote/like
            case 'VERIFICATION': return <div className="p-2 bg-green-100 text-green-600 rounded-full"><FaCheckCircle /></div>;
            case 'WARNING': return <div className="p-2 bg-orange-100 text-orange-600 rounded-full"><FaExclamationTriangle /></div>;
            case 'DELETED': return <div className="p-2 bg-red-100 text-red-600 rounded-full"><FaTrash /></div>;
            default: return <div className="p-2 bg-gray-100 text-gray-600 rounded-full"><FaBell /></div>;
        }
    };

    if (!session) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                className={`p-2.5 rounded-full transition-all duration-300 relative
                    ${isOpen
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
            >
                <FaBell className={`text-lg transition-transform ${isOpen ? 'scale-110' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute -right-20 md:right-0 mt-3 w-96 max-w-[90vw] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800 ring-1 ring-black/5 z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                            <h3 className="font-bold text-gray-900 dark:text-white">Notificações</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-md transition-colors"
                                >
                                    Marcar tudo como lido
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {isLoading && notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Carregando...</div>
                            ) : notifications.length > 0 ? (
                                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`group relative p-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
                                                ${!notification.read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}
                                            `}
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getIconForType(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {notification.link ? (
                                                        <Link
                                                            href={notification.link}
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="block"
                                                        >
                                                            <p className={`text-sm leading-snug mb-1 ${!notification.read ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </Link>
                                                    ) : (
                                                        <div onClick={() => handleMarkAsRead(notification.id)} className="cursor-default">
                                                            <p className={`text-sm leading-snug mb-1 ${!notification.read ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                {!notification.read && (
                                                    <div className="flex-shrink-0 self-center">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                        <FaBell className="text-gray-300 dark:text-gray-600 text-2xl" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Tudo limpo!</p>
                                    <p className="text-xs text-gray-400 mt-1">Nenhuma notificação por enquanto.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
