'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { FaUser, FaUserShield, FaSignOutAlt, FaAd } from 'react-icons/fa';

interface UserDropdownProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    isAdmin: boolean;
}

export function UserDropdown({ user, isAdmin }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 focus:outline-none"
            >
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full border-2 border-transparent hover:border-blue-500 transition-colors"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white border-2 border-transparent hover:border-blue-600 transition-colors">
                        <FaUser className="text-sm" />
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {user.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                        </p>
                    </div>

                    <div className="p-2">
                        <Link
                            href="/perfil"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <FaUser className="text-gray-400" />
                            Meu Perfil
                        </Link>

                        <Link
                            href="/advertiser/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <FaAd className="text-gray-400" />
                            Anúncios
                        </Link>

                        {isAdmin && (
                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors font-medium"
                            >
                                <FaUserShield />
                                Painel Admin
                            </Link>
                        )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <FaSignOutAlt />
                            Sair
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
