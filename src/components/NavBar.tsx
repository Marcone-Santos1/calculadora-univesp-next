"use client";

import { useRouter } from 'next/navigation';
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

  return (
    <header className="bg-[#F0F7FF] dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-black dark:text-white whitespace-nowrap">
            Calculadora UNIVESP
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium">Início</Link>
            <Link href="/questoes" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium">Questões</Link>
            <Link href="/placar" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium">Placar</Link>
            <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium">Blog</Link>
            <Link href="/sobre" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium">Sobre</Link>
            <Link href="/calculadora-cr" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium">Calculadora CR</Link>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Theme button"
            >
              {isDarkMode ? <FaRegSun className="text-xl" /> : <FaRegMoon className="text-xl" />}
            </button>

            {session ? (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <UserDropdown user={session.user!} isAdmin={isAdmin} />
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors shadow-sm hover:shadow"
              >
                Entrar
              </button>
            )}
          </nav>

          {/* Mobile Actions (Right side) */}
          <div className="flex items-center gap-2 md:hidden">
            {session && <NotificationBell />}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-3 animate-fadeIn">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-4 mb-4">
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

            <Link href="/" onClick={closeMobileMenu} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Início
            </Link>
            <Link href="/questoes" onClick={closeMobileMenu} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Questões
            </Link>
            <Link href="/placar" onClick={closeMobileMenu} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Placar
            </Link>
            <Link href="/blog" onClick={closeMobileMenu} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Blog
            </Link>
            <Link href="/sobre" onClick={closeMobileMenu} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Sobre
            </Link>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 px-4 space-y-3">
              <button
                onClick={() => { toggleDarkMode(); closeMobileMenu(); }}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg transition-colors"
              >
                <span className="text-gray-700 dark:text-gray-300 font-medium">Tema</span>
                <span className="p-2 bg-white dark:bg-gray-600 text-gray-800 dark:text-white rounded-full shadow-sm">
                  {isDarkMode ? <FaRegSun /> : <FaRegMoon />}
                </span>
              </button>

              {session ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-white dark:border-gray-800"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <FaUser />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                    </div>
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
                    className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors"
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