'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  FaHome, FaUsers, FaBook, FaQuestionCircle,
  FaChartBar, FaFlag, FaCommentDots, FaChevronLeft,
  FaChevronRight, FaGraduationCap, FaBars,
  FaDownload, FaBullhorn
} from 'react-icons/fa';

// Definição dos links para fácil manutenção
const MENU_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: <FaChartBar /> },
  { href: '/admin/users', label: 'Usuários', icon: <FaUsers /> },
  { href: '/admin/subjects', label: 'Matérias', icon: <FaGraduationCap /> },
  { href: '/admin/questions', label: 'Questões', icon: <FaQuestionCircle /> },
  { href: '/admin/ads', label: 'Anúncios', icon: <FaBullhorn /> },
  { href: '/admin/blog', label: 'Blog', icon: <FaBook /> },
  { href: '/admin/reports', label: 'Denúncias', icon: <FaFlag /> },
  { href: '/admin/feedbacks', label: 'Feedbacks', icon: <FaCommentDots /> },
  { href: '/admin/importar', label: 'Importar', icon: <FaDownload /> },
  { href: '/', label: 'Voltar ao Site', icon: <FaHome /> },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta mobile e fecha automaticamente
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setIsCollapsed(true);
      } else {
        setIsMobile(false);
        setIsCollapsed(false);
      }
    };

    // Executa no load
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobile && !isCollapsed ? 'fixed inset-y-0 left-0 shadow-2xl w-64' : ''}
        `}
      >

        {/* Header / Toggle */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-100 dark:border-gray-700">
          {!isCollapsed && (
            <span className="font-bold text-lg text-blue-600 dark:text-blue-400 whitespace-nowrap overflow-hidden">
              Admin Panel
            </span>
          )}

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors mx-auto"
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : ''} // Tooltip nativo quando fechado
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <span className={`text-xl ${isCollapsed ? '' : 'min-w-[24px]'}`}>
                  {item.icon}
                </span>

                {/* Texto (escondido quando colapsado) */}
                <span className={`
                  font-medium whitespace-nowrap overflow-hidden transition-all duration-300
                  ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}
                `}>
                  {item.label}
                </span>

                {/* Tooltip Customizado (Hover) quando fechado */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer do Menu (Opcional) */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          {!isCollapsed && (
            <div className="text-xs text-gray-400 text-center">
              v1.0.0
            </div>
          )}
        </div>
      </aside>

      {/* Overlay Escuro (Apenas Mobile quando aberto) */}
      {isMobile && !isCollapsed && (
        <div
          onClick={() => setIsCollapsed(true)}
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
        />
      )}
    </>
  );
};