import Link from 'next/link';
import { getBlogPosts } from '@/actions/blog-actions';
import { DeletePostButton } from '@/components/admin/blog/DeletePostButton';
import { FaPlus, FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa';

export default async function AdminBlogPage() {
    const posts = await getBlogPosts(false); // Fetch all posts including drafts

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gerenciar Blog</h1>
                <Link
                    href="/admin/blog/new"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                    <FaPlus /> Novo Artigo
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                            <th className="p-4">Título</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Data</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="p-4 font-medium text-gray-900 dark:text-white">
                                    {post.title}
                                </td>
                                <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                    {post.slug}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${post.published
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {post.published ? <FaEye /> : <FaEyeSlash />}
                                        {post.published ? 'Publicado' : 'Rascunho'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/blog/${post.id}`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <FaEdit />
                                        </Link>
                                        <DeletePostButton postId={post.id} postTitle={post.title} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {posts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    Nenhum artigo encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
