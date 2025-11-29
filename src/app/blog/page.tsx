import { Breadcrumb } from "@/components/Breadcrumb";
import { FaCalendarAlt, FaTag, FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import { getBlogPosts } from "@/actions/blog-actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Artigos | Calculadora UNIVESP",
  description:
    "Guias, dicas e artigos para ajudar os alunos da UNIVESP a terem sucesso na vida acadêmica.",
};

export default async function BlogPage() {
  const breadcrumbLinks = [
    { name: "Início", path: "/" },
    { name: "Blog" },
  ];

  const posts = await getBlogPosts(true); // Fetch only published

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white dark:bg-gray-950 transition-colors duration-500 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <Breadcrumb links={breadcrumbLinks} />

        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Blog & Artigos
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post) => {
            const tags = post.keywords ? post.keywords.split(',').map(t => t.trim()) : [];

            return (
              <Link
                href={`/blog/${post.slug}`}
                key={post.id}
                className="group block rounded-2xl bg-gray-50 dark:bg-gray-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 border border-gray-200/40 dark:border-gray-800/40"
              >
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4 space-x-4">
                  <div className="flex items-center space-x-1">
                    <FaCalendarAlt className="text-blue-500" />
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
                      >
                        <FaTag className="text-[10px]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-500 transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  Ler mais
                  <FaArrowRight className="ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            )
          })}

          {posts.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">
              Em breve novos artigos!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
