import Link from 'next/link';
import { getBlogPosts } from '@/actions/blog-actions';
import { FaArrowRight } from 'react-icons/fa';

export async function RecentPosts() {
    const allPosts = await getBlogPosts(true);
    const recentPosts = allPosts.slice(0, 9);

    if (recentPosts.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Últimas Atualizações e Guias
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Fique por dentro das novidades e dicas para seus estudos na Univesp.
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        Ver todos os artigos <FaArrowRight />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {recentPosts.map((post) => (
                        <article
                            key={post.id}
                            className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 flex flex-col"
                        >
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="mb-4">
                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                        Blog
                                    </span>
                                    <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        {post.title}
                                    </Link>
                                </h3>

                                <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 flex-grow">
                                    {post.excerpt}
                                </p>

                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-auto group"
                                >
                                    Ler mais
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Ver todos os artigos <FaArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    );
}
