import Link from 'next/link';
import { FaHome, FaSearch, FaExclamationTriangle, FaReadme } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-173px)] flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-8 md:p-12 text-center transition-all">
        
        {/* Ícone de Destaque com Círculo */}
        <div className="mx-auto w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
          <FaExclamationTriangle className="text-4xl text-blue-600 dark:text-blue-400" />
        </div>

        {/* Títulos Tipográficos */}
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          404
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Página não encontrada
        </h2>

        {/* Texto Explicativo */}
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Ops! A página que você procura pode ter sido removida, 
          renomeada ou está temporariamente indisponível.
        </p>

        {/* Botões de Ação (Mesmo padrão das Questões) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
          >
            <FaHome /> Início
          </Link>
          
          <Link 
            href="/questoes"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-bold transition-colors"
          >
            <FaSearch /> Questões
          </Link>
          
          <Link 
            href="/blog"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-bold transition-colors"
          >
            <FaReadme /> Blog
          </Link>
        </div>

      </div>
    </div>
  );
}