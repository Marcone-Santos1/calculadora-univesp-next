import Link from 'next/link';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
            <p>© {currentYear} Calculadora Univesp. Projeto independente.</p>
            <p className="text-xs mt-1 opacity-75">Não oficial. Sem vínculo com a UNIVESP.</p>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Link href="/sobre" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Sobre
            </Link>
            <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Blog
            </Link>
            <Link href="/politica-de-privacidade" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Política de Privacidade
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};