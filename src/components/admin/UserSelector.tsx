'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { FaSearch, FaTimes, FaUsers, FaUser, FaCheck, FaSpinner } from 'react-icons/fa';

interface User {
    id: string;
    name: string | null;
    email: string | null;
}

interface UserSelectorProps {
    selectedUsers: User[];
    onSelectionChange: (users: User[]) => void;
    fetchUsers: (search: string) => Promise<User[]>;
    isAllSelected: boolean;
    onToggleAll: (all: boolean) => void;
    totalUsersCount?: number;
}

export function UserSelector({
    selectedUsers,
    onSelectionChange,
    fetchUsers,
    isAllSelected,
    onToggleAll,
    totalUsersCount
}: UserSelectorProps) {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const containerRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!isOpen) return;

        searchTimeoutRef.current = setTimeout(() => {
            startTransition(async () => {
                const results = await fetchUsers(search);
                setSearchResults(results);
            });
        }, 300);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [search, isOpen, fetchUsers]);

    const handleSelectUser = (user: User) => {
        const isSelected = selectedUsers.some(u => u.id === user.id);
        if (isSelected) {
            onSelectionChange(selectedUsers.filter(u => u.id !== user.id));
        } else {
            onSelectionChange([...selectedUsers, user]);
        }
    };

    const handleRemoveUser = (userId: string) => {
        onSelectionChange(selectedUsers.filter(u => u.id !== userId));
    };

    const isUserSelected = (userId: string) => selectedUsers.some(u => u.id === userId);

    return (
        <div className="space-y-4">
            {/* Toggle: All vs Specific */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => onToggleAll(true)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${isAllSelected
                            ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/10 dark:border-emerald-500'
                            : 'bg-white dark:bg-zinc-800/50 border-transparent hover:border-gray-200 dark:hover:border-zinc-700'
                        }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isAllSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-zinc-700 text-gray-400'
                        }`}>
                        <FaUsers />
                    </div>
                    <div className="text-left">
                        <div className={`font-bold transition-colors ${isAllSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'
                            }`}>Todos os Usuários</div>
                        <div className="text-xs text-gray-400">
                            {totalUsersCount ? `${totalUsersCount} destinatários` : 'Enviar para todos'}
                        </div>
                    </div>
                    {isAllSelected && <div className="absolute top-2 right-2 text-emerald-500"><FaCheck /></div>}
                </button>

                <button
                    type="button"
                    onClick={() => onToggleAll(false)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${!isAllSelected
                            ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/10 dark:border-blue-500'
                            : 'bg-white dark:bg-zinc-800/50 border-transparent hover:border-gray-200 dark:hover:border-zinc-700'
                        }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${!isAllSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-zinc-700 text-gray-400'
                        }`}>
                        <FaUser />
                    </div>
                    <div className="text-left">
                        <div className={`font-bold transition-colors ${!isAllSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                            }`}>Usuários Específicos</div>
                        <div className="text-xs text-gray-400">
                            {selectedUsers.length > 0 ? `${selectedUsers.length} selecionados` : 'Selecionar manualmente'}
                        </div>
                    </div>
                    {!isAllSelected && <div className="absolute top-2 right-2 text-blue-500"><FaCheck /></div>}
                </button>
            </div>

            {/* User Selection (only when not "All") */}
            {!isAllSelected && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-3">
                    {/* Selected Users Chips */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700">
                            {selectedUsers.map(user => (
                                <span
                                    key={user.id}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium group"
                                >
                                    <span className="truncate max-w-[150px]">{user.name || user.email}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveUser(user.id)}
                                        className="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                    >
                                        <FaTimes className="text-xs" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Search Dropdown */}
                    <div ref={containerRef} className="relative">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setIsOpen(true)}
                                placeholder="Buscar usuários por nome ou email..."
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            />
                            {isPending && (
                                <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                            )}
                        </div>

                        {/* Dropdown Results */}
                        {isOpen && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden max-h-[280px] overflow-y-auto">
                                {searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400">
                                        {isPending ? 'Buscando...' : search ? 'Nenhum usuário encontrado' : 'Digite para buscar'}
                                    </div>
                                ) : (
                                    <div className="py-1">
                                        {searchResults.map(user => {
                                            const selected = isUserSelected(user.id);
                                            return (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => handleSelectUser(user)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${selected
                                                            ? 'bg-blue-50 dark:bg-blue-900/20'
                                                            : 'hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${selected
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-500'
                                                        }`}>
                                                        {selected ? <FaCheck /> : <FaUser />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`font-medium truncate ${selected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                                                            }`}>
                                                            {user.name || 'Sem nome'}
                                                        </div>
                                                        <div className="text-xs text-gray-400 truncate">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                    {selected && (
                                                        <span className="text-xs text-blue-500 font-medium">Selecionado</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {selectedUsers.length === 0 && (
                        <p className="text-xs text-orange-500 flex items-center gap-1">
                            ⚠️ Selecione pelo menos um usuário para continuar
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
