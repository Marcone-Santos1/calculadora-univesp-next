'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
    Home, User, Upload, Award, Menu, X, LogOut, LayoutGrid
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileLayoutProps {
    children: React.ReactNode;
    currentUserId?: string;
}

export function ProfileLayout({ children, currentUserId }: ProfileLayoutProps) {
    const pathname = usePathname();
    const params = useParams();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Determines if the sidebar should be shown
    // It is shown if:
    // 1. We are NOT on a specific profile page (no params.id), e.g. /perfil, /perfil/editar
    // 2. OR if we are on a profile page AND the profile ID matches the logged-in user ID
    const profileId = params?.id as string | undefined;
    const isOwner = !profileId || (currentUserId && profileId === currentUserId);

    // If we are viewing someone else's profile, hide the sidebar
    const showSidebar = isOwner;

    const menuItems = [
        {
            href: '/perfil',
            label: 'Visão Geral',
            icon: LayoutGrid,
            exact: true
        },
        {
            href: '/perfil/editar',
            label: 'Editar Perfil',
            icon: User
        },
        {
            href: '/perfil/importar',
            label: 'Importar Provas',
            icon: Upload
        }
    ];

    const isActive = (href: string, exact = false) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col md:flex-row">

            {/* Mobile Header - Only show if sidebar is active */}
            {showSidebar && (
                <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-40">
                    <span className="font-bold text-lg text-zinc-900 dark:text-white">Meu Perfil</span>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Sidebar (Desktop & Mobile Drawer) */}
            {showSidebar && (
                <AnimatePresence>
                    {(isMobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
                        <>
                            {/* Mobile Backdrop */}
                            <div
                                className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isMobileMenuOpen ? "block" : "hidden"
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />

                            <motion.aside
                                initial={{ x: -280 }}
                                animate={{ x: 0 }}
                                exit={{ x: -280 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className={`fixed md:sticky top-0 left-0 z-50 h-screen w-[280px] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shadow-xl md:shadow-none ${!isMobileMenuOpen ? "hidden md:flex" : ""
                                    }`}
                            >
                                {/* Header */}
                                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                                        Menu
                                    </h2>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="md:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                    {menuItems.map((item) => {
                                        const active = isActive(item.href, item.exact);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${active
                                                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium shadow-md"
                                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                                                    }`}
                                            >
                                                <item.icon className={`w-5 h-5 ${active ? "animate-pulse" : ""}`} />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}
