import { ReactNode } from 'react';
import { Breadcrumb } from '../Breadcrumb';

interface ArticleLayoutProps {
  title: string;
  children: ReactNode;
}

export const ArticleLayout = ({ title, children }: ArticleLayoutProps) => {
  const breadcrumbLinks = [
    { name: 'Início', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: title },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb links={breadcrumbLinks} />
        <article className="prose lg:prose-xl dark:prose-invert">
          <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-gray-200">{title}</h1>
          <div className="text-gray-700 dark:text-gray-300">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
};