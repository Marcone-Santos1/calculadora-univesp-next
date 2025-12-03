import { Breadcrumb } from "@/components/Breadcrumb";
import { getBlogPosts } from "@/actions/blog-actions";
import { Metadata } from "next";
import {BlogCard} from "@/components/blog/BlogCard";

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

          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}

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
