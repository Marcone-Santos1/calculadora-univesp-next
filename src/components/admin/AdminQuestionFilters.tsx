'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

interface Subject {
    id: string;
    name: string;
}

interface AdminQuestionFiltersProps {
    subjects: Subject[];
}

export function AdminQuestionFilters({ subjects }: AdminQuestionFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial State from URL
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [subjectId, setSubjectId] = useState(searchParams.get('subjectId') || 'all');
    const [status, setStatus] = useState(searchParams.get('status') || 'all');

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ search });
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const updateFilters = (updates: { search?: string; subjectId?: string; status?: string }) => {
        const params = new URLSearchParams(searchParams.toString());

        // Reset page on filter change
        params.delete('page');

        if (updates.search !== undefined) {
            updates.search ? params.set('search', updates.search) : params.delete('search');
        }
        if (updates.subjectId !== undefined) {
            updates.subjectId !== 'all' ? params.set('subjectId', updates.subjectId) : params.delete('subjectId');
        }
        if (updates.status !== undefined) {
            updates.status !== 'all' ? params.set('status', updates.status) : params.delete('status');
        }

        router.push(`/admin/questions?${params.toString()}`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
            {/* Search */}
            <div className="relative flex-1">
                <input
                    type="text"
                    placeholder="Search by title, ID, or user..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            {/* Subject Filter */}
            <div className="w-full md:w-48">
                <select
                    value={subjectId}
                    onChange={(e) => {
                        setSubjectId(e.target.value);
                        updateFilters({ subjectId: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
                >
                    <option value="all">All Subjects</option>
                    {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        updateFilters({ status: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
                >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending Verification</option>
                    <option value="unverified">Unverified</option>
                </select>
            </div>
        </div>
    );
}
