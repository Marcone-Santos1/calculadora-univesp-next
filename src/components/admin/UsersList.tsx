'use client';

import { useState, useTransition } from 'react';
import { FaUserShield, FaUser } from 'react-icons/fa';
import { toggleUserAdmin } from '@/actions/admin-actions';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string | null;
    email: string | null;
    isAdmin: boolean;
    _count: { questions: number; comments: number; votes: number };
}

interface UsersListProps {
    users: User[];
}

export function UsersList({ users }: UsersListProps) {
    const [toggleId, setToggleId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();
    const router = useRouter();

    const handleToggleAdmin = (id: string) => {
        startTransition(async () => {
            try {
                await toggleUserAdmin(id);
                showToast('Admin status updated', 'success');
                router.refresh();
            } catch {
                showToast('Failed to update admin status', 'error');
            }
        });
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Questions
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Comments
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Votes
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                            {user.isAdmin ? (
                                                <FaUserShield className="text-orange-600" />
                                            ) : (
                                                <FaUser className="text-gray-500" />
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {user.name || 'Anonymous'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                                    {user._count.questions}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                                    {user._count.comments}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                                    {user._count.votes}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {user.isAdmin ? (
                                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-semibold rounded">
                                            Admin
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 text-xs font-semibold rounded">
                                            User
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => setToggleId(user.id)}
                                        disabled={isPending}
                                        className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                                    >
                                        Toggle Admin
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No users found</p>
                )}
            </div>

            <ConfirmDialog
                isOpen={toggleId !== null}
                onClose={() => setToggleId(null)}
                onConfirm={() => toggleId && handleToggleAdmin(toggleId)}
                title="Toggle Admin Status"
                message="Are you sure you want to change this user's admin status?"
                confirmText="Confirm"
                variant="warning"
            />
        </>
    );
}
