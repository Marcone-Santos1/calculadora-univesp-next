import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaTag, FaArrowRight } from "react-icons/fa";

// Definindo a interface baseada no retorno do Prisma
interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string | null;
    createdAt: Date;
    keywords: string | null;
  };
}

export const BlogCard = ({ post }: BlogCardProps) => {
  const tags = post.keywords ? post.keywords.split(",").map((t) => t.trim()) : [];
  console.log(post)
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Área da Imagem de Capa */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          // Placeholder caso não tenha imagem (opcional, mas recomendado)
          <div className="flex items-center justify-center w-full h-full text-gray-300 dark:text-gray-700">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div className="flex flex-col flex-1 p-6">
        {/* Metadados (Data e Tags) */}
        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <FaCalendarAlt className="text-blue-500" />
            <time dateTime={post.createdAt.toISOString()}>
              {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>

          {tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              {/* Mostra apenas a primeira tag para não poluir o card visualmente */}
              <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                <FaTag className="text-[10px]" />
                {tags[0]}
              </span>
              {tags.length > 1 && (
                <span className="text-[10px] opacity-70">+{tags.length - 1}</span>
              )}
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-3">
          {post.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm mt-auto">
          Ler artigo completo
          <FaArrowRight className="ml-2 w-3 h-3 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};