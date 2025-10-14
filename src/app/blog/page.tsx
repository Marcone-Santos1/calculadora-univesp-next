import {Breadcrumb} from "@/components/Breadcrumb";
import {FaCalendarAlt, FaTag} from "react-icons/fa";
import Link from "next/link";
import {articles} from "@/data/articles";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: 'Blog & Artigos | Calculadora UNIVESP',
  description: 'Guias, dicas e artigos para ajudar os alunos da UNIVESP a terem sucesso na vida acadêmica.',
};

export default function BlogPage() {

  const breadcrumbLinks = [
    { name: 'Início', path: '/' },
    { name: 'Blog' },
  ];

  const sortedArticles = articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb links={breadcrumbLinks} />
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200">
          Blog & Artigos
        </h1>
        <div className="space-y-8">
          {sortedArticles.map((article) => (
            <Link href={article.slug} key={article.slug} className="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 space-x-4">
                <div className="flex items-center space-x-1">
                  <FaCalendarAlt />
                  <span>{new Date(article.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'})}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaTag />
                  <span>{article.tags.join(', ')}</span>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">{article.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">{article.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};