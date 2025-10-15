import { ReactNode } from "react";
import { Breadcrumb } from "../Breadcrumb";
import { FaCalendarAlt, FaTag } from "react-icons/fa";

interface ArticleLayoutProps {
  title: string;
  date?: string;
  tags?: string[];
  children: ReactNode;
}

export const ArticleLayout = ({
                                title,
                                date,
                                tags = [],
                                children,
                              }: ArticleLayoutProps) => {
  const breadcrumbLinks = [
    { name: "Início", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: title },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white dark:bg-gray-950 transition-colors duration-500 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb links={breadcrumbLinks} />

        {/* HEADER DO ARTIGO */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            {title}
          </h1>

          {/* DATA E TAGS */}
          <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            {date && (
              <div className="flex items-center gap-1">
                <FaCalendarAlt className="text-blue-500" />
                <span>
                  {new Date(date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
                  >
                    <FaTag className="text-[10px]" /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* CONTEÚDO DO ARTIGO */}
        <article
          className="
            prose
            prose-lg
            dark:prose-invert
            prose-headings:font-serif
            prose-headings:font-bold
            prose-a:text-blue-600
            dark:prose-a:text-blue-400
            prose-img:rounded-xl
            prose-blockquote:border-l-4
            prose-blockquote:border-blue-500
            prose-blockquote:bg-blue-50/40
            dark:prose-blockquote:bg-blue-900/10
            prose-pre:bg-gray-100
            dark:prose-pre:bg-gray-900
            max-w-none
          "
        >
          {children}
        </article>
      </div>
    </div>
  );
};
