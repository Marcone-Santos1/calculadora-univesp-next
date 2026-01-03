"use client";

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaRegMoon, FaRegSun, FaUser, FaUserShield, FaBars, FaTimes, FaSearch, FaAd, FaChevronRight } from "react-icons/fa";
import { useAppContext } from './AppStateProvider';
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState, useRef } from 'react';
import { NotificationBell } from './notification/NotificationBell';
import { UserDropdown } from './navbar/UserDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export const NavBar = () => {
  const pathname = usePathname();
  const { isDarkMode, toggleDarkMode } = useAppContext();
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPath, setHoveredPath] = useState<string | null>(pathname);
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

  // Reset hovered path to current pathname when mouse leaves nav
  const handleMouseLeave = () => {
    setHoveredPath(pathname);
  };

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
    { label: 'Anuncie', href: '/anuncie' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 shadow-sm" />

      <div className="container mx-auto px-4 h-20 relative">
        <div className="flex h-full items-center justify-between gap-6">
        {/* Left: Brand */}
          <Link href="/" className="relative z-10 flex items-center gap-2 group">
            <Image src="/favicon.ico" alt="Logo" width={50} height={50} />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 tracking-tight">
              Calculadora<span className="font-extrabold text-blue-600 dark:text-blue-400">Univesp</span>
            </span>
          </Link>

          {/* Center: Navigation (Desktop) */}
          <nav
            className="hidden lg:flex items-center justify-center p-1 bg-gray-100/50 dark:bg-gray-900/50 rounded-full border border-gray-200/50 dark:border-white/5 backdrop-blur-sm"
            onMouseLeave={handleMouseLeave}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredPath === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 outline-none"
                  onMouseEnter={() => setHoveredPath(item.href)}
                >
                  {/* Floating Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-pill"
                      className="absolute inset-0 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200/50 dark:border-white/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Hover visual feedback for non-active items */}
                  {!isActive && isHovered && (
                    <motion.div
                      layoutId="navbar-hover"
                      className="absolute inset-0 bg-gray-200/50 dark:bg-gray-800/50 rounded-full"
                      transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                    />
                  )}

                  <span className={`relative z-10 ${isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 relative z-10">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all hover:rotate-12 active:scale-95 hidden sm:block"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FaRegSun className="text-lg" /> : <FaRegMoon className="text-lg" />}
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden md:block" />

            {session ? (
              <>
                <div className="block">
                  <NotificationBell />
                </div>
                <div className="hidden lg:block pl-1 w-8 h-8 md:w-9 md:h-9">
                  <UserDropdown user={session.user!} isAdmin={isAdmin} />
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-full transition-all shadow-lg shadow-gray-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                <span>Entrar</span>
                <FaChevronRight className="text-xs" />
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <FaTimes size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <FaBars size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800"
          >
            <div className="container mx-auto px-4 py-6 space-y-6">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="O que você procura?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-0 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </form>

              <nav className="space-y-1">
                {navItems.map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${pathname === item.href
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      {item.label}
                      {pathname === item.href && (
                        <motion.div layoutId="mobile-active" className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                {session ? (
                  <>
                    <div className="flex items-center gap-4 px-4 py-2 mb-2">
                      {session.user?.image ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
                          <img src={session.user.image} alt="User" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <FaUser />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/perfil"
                        onClick={closeMobileMenu}
                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <FaUser className="text-blue-500 mb-1" />
                        <span className="text-xs font-medium">Perfil</span>
                      </Link>

                      <Link
                        href="/advertiser/dashboard"
                        onClick={closeMobileMenu}
                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <FaAd className="text-purple-500 mb-1" />
                        <span className="text-xs font-medium">Anúncios</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={closeMobileMenu}
                          className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-400 transition-colors"
                        >
                          <FaUserShield />
                          <span className="text-xs font-bold">Painel Administrativo</span>
                        </Link>
                      )}
                    </div>

                    <button
                      onClick={() => { signOut(); closeMobileMenu(); }}
                      className="w-full mt-2 px-4 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors border border-red-100 dark:border-red-900/20"
                    >
                      Sair da conta
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { signIn('google'); closeMobileMenu(); }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffffff" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff" />
                    </svg>
                    Entrar com Google
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};