"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FaRegMoon, FaRegSun, FaUser, FaUserShield, FaBars, FaTimes } from "react-icons/fa";
import { useAppContext } from './AppStateProvider';
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from 'react';

export const NavBar = () => {
  const { isDarkMode, toggleDarkMode } = useAppContext();
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <header className="bg-[#F0F7FF] dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-black dark:text-white whitespace-nowrap">
            Calculadora UNIVESP
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors">Início</Link>
            <Link href="/questoes" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors">Questões</Link>
            <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors">Blog</Link>
            <Link href="/sobre" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors">Sobre</Link>
            {isAdmin && (
              <Link href="/admin" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors">
                <FaUserShield /> Admin
              </Link>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 bg-gray-700 dark:bg-gray-200 text-white dark:text-black rounded-full hover:scale-110 transition-transform"
              aria-label="Theme button"
            >
              {isDarkMode ? <FaRegSun /> : <FaRegMoon />}
            </button>

            {session ? (
              <div className="flex items-center gap-3 ml-2">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <FaUser />
                  </div>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Entrar
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-3">
            <Link href="/" onClick={closeMobileMenu} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Início
            </Link>
            <Link href="/questoes" onClick={closeMobileMenu} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Questões
            </Link>
            <Link href="/blog" onClick={closeMobileMenu} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Blog
            </Link>
            <Link href="/sobre" onClick={closeMobileMenu} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Sobre
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={closeMobileMenu} className="block px-4 py-2 text-orange-600 dark:text-orange-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-semibold transition-colors">
                <FaUserShield className="inline mr-2" /> Admin
              </Link>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 px-4 space-y-3">
              <button
                onClick={() => { toggleDarkMode(); closeMobileMenu(); }}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-gray-700 dark:text-gray-300">Tema</span>
                <span className="p-2 bg-gray-700 dark:bg-gray-200 text-white dark:text-black rounded-full">
                  {isDarkMode ? <FaRegSun /> : <FaRegMoon />}
                </span>
              </button>

              {session ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <FaUser />
                      </div>
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{session.user?.name}</span>
                  </div>
                  <button
                    onClick={() => { signOut(); closeMobileMenu(); }}
                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { signIn('google'); closeMobileMenu(); }}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Entrar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};