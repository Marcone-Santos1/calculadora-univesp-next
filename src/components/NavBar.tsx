"use client";

import Link from 'next/link'; // Use o Link do Next.js
import { FaRegMoon, FaRegSun, FaUser } from "react-icons/fa";
import { useAppContext } from './AppStateProvider'; // Importe o hook
import { signIn, signOut, useSession } from "next-auth/react";

export const NavBar = () => {
  const { isDarkMode, toggleDarkMode } = useAppContext();
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-around bg-[#F0F7FF] dark:bg-gray-800 p-4 shadow-md">
      <Link href="/" className="text-xl font-bold text-black dark:text-white">
        Calculadora UNIVESP
      </Link>
      <nav className="flex items-center space-x-4">
        <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Início</Link>
        <Link href="/questoes" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Questões</Link>
        <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Blog</Link>
        <Link href="/sobre" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Sobre</Link>

        <button
          onClick={toggleDarkMode}
          className="p-2 bg-gray-700 dark:bg-gray-200 text-white dark:text-black rounded-full"
          aria-label="Theme button"
        >
          {isDarkMode ? <FaRegSun /> : <FaRegMoon />}
        </button>

        {session ? (
          <div className="flex items-center gap-3 ml-4">
            {session.user?.image ? (
              <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <FaUser />
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Entrar
          </button>
        )}
      </nav>
    </header>
  );
};