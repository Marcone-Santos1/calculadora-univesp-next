"use client";

import { useState, useEffect, createContext, useContext } from 'react';

// Context para passar o estado para a NavBar
const AppContext = createContext<{ isDarkMode: boolean; toggleDarkMode: () => void } | null>(null);

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Evita problemas de hidratação

  useEffect(() => {
    const theme = localStorage.getItem('darkTheme');
    setIsDarkMode(theme === 'dark');
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkTheme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkTheme', 'not-dark');
      }
    }
  }, [isDarkMode, isMounted]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  if (!isMounted) {
    return null; // ou um spinner de carregamento
  }

  return (
    <AppContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppStateProvider');
  }
  return context;
};