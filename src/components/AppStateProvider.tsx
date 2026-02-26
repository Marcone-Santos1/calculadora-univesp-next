"use client";

import { useState, useEffect, createContext, useContext } from 'react';

// Context para passar o estado para a NavBar
const AppContext = createContext<{ isDarkMode: boolean; toggleDarkMode: () => void } | null>(null);

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  // Inicializa com true (dark) para ser consistente com o script inline em layout.tsx
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Sincroniza o estado React com o que já foi aplicado pelo script inline
    const theme = localStorage.getItem('darkTheme');
    setIsDarkMode(theme === 'dark' || theme === null);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkTheme', 'not-dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // ✅ Sempre renderiza os filhos — sem `return null` que causava CLS massivo.
  // O script inline em layout.tsx aplica a classe `dark` antes do primeiro paint.
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