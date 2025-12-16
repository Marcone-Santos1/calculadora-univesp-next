'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaQuestionCircle, FaComments, FaBook, FaUsers, FaFlag, FaExclamationCircle } from 'react-icons/fa';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: FaHome },
    { href: '/admin/questions', label: 'Questions', icon: FaQuestionCircle },
    { href: '/admin/comments', label: 'Comments', icon: FaComments },
    { href: '/admin/subjects', label: 'Subjects', icon: FaBook },
    { href: '/admin/users', label: 'Users', icon: FaUsers },
    { href: '/admin/reports', label: 'Report', icon: FaFlag },
    { href: '/admin/blog', label: 'Blog', icon: FaBook },
    { href: '/admin/feedbacks', label: 'Feedbacks', icon: FaExclamationCircle },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Admin Panel
                </h2>
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className="text-lg" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href="/questoes"
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        ← Back to Site
                    </Link>
                </div>
            </div>
        </aside>
    );
}
