"use client";

import Link from 'next/link'; // Use o Link do Next.js
import { FaRegMoon, FaRegSun } from "react-icons/fa";
import { useAppContext } from './AppStateProvider'; // Importe o hook

export const NavBar = () => {
  const { isDarkMode, toggleDarkMode } = useAppContext();

  return (
    <header className="flex items-center justify-around bg-[#F0F7FF] dark:bg-gray-800 p-4 shadow-md">
      <Link href="/" className="text-xl font-bold text-black dark:text-white">
        Calculadora UNIVESP
      </Link>
      <nav className="flex items-center space-x-4">
        <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Início</Link>
        <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Blog</Link>
        <Link href="/sobre" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Sobre</Link>
        <button
          onClick={toggleDarkMode}
          className="p-2 bg-gray-700 dark:bg-gray-200 text-white dark:text-black rounded-full"
          aria-label="Theme button"
        >
          {isDarkMode ? <FaRegSun /> : <FaRegMoon />}
        </button>
      </nav>
    </header>
  );
};