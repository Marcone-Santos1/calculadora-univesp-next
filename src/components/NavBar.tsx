"use client";

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaRegMoon, FaRegSun, FaUser, FaUserShield, FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { useAppContext } from './AppStateProvider';
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import { NotificationBell } from './notification/NotificationBell';
import { UserDropdown } from './navbar/UserDropdown';

export const NavBar = () => {
  const { isDarkMode, toggleDarkMode } = useAppContext();
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/check-admin')
        .then(res => res.json())
        .then(data => {
          setIsAdmin(data.isAdmin)
        })
        .catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/questoes?q=${encodeURIComponent(searchQuery)}`);
      closeMobileMenu();
    }
  };

  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Questões', href: '/questoes' },
    { label: 'Placar', href: '/placar' },
    { label: 'Blog', href: '/blog' },
    { label: 'Sobre', href: '/sobre' },
    { label: 'Calculadora CR', href: '/calculadora-cr' },
    { label: 'AAC', href: '/aac' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300 bg-[#F0F7FF]/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5">
      <div className="container mx-auto px-4 h-20">
        <div className="flex h-full items-center justify-between gap-4">
          {/* Left: Brand */}
          <Link href="/" className="text-xl font-extrabold text-gray-900 dark:text-white whitespace-nowrap tracking-tight hover:opacity-80 transition-opacity">
            Calculadora UNIVESP
          </Link>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center justify-center space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FaRegSun className="text-lg" /> : <FaRegMoon className="text-lg" />}
            </button>

            {session ? (
              <>
                <div className="hidden md:block">
                  <NotificationBell />
                </div>
                <div className="hidden md:block pl-2">
                  <UserDropdown user={session.user!} isAdmin={isAdmin} />
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="hidden md:block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all shadow-sm hover:shadow-md active:transform active:scale-95"
              >
                Entrar
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-3 animate-fadeIn bg-[#F0F7FF] dark:bg-gray-900 rounded-b-xl shadow-lg absolute left-0 right-0 px-4 top-20 border-b">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`block px-4 py-2 rounded-lg transition-colors ${pathname === item.href
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-3">
              {session ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-2">
                    {/* Mobile User Info simplified */}
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Conectado como {session.user?.name}</p>
                  </div>

                  <Link
                    href="/perfil"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaUser className="text-gray-400" />
                    <span className="font-medium">Meu Perfil</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    >
                      <FaUserShield />
                      <span className="font-medium">Painel Admin</span>
                    </Link>
                  )}

                  <button
                    onClick={() => { signOut(); closeMobileMenu(); }}
                    className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors text-left"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { signIn('google'); closeMobileMenu(); }}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                >
                  Entrar com Google
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};