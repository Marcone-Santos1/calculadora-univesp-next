import { getFeedbacks, deleteFeedback } from '@/actions/feedback-actions';
import { FaBug, FaLightbulb, FaExclamationCircle, FaTrash, FaExternalLinkAlt, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

interface FeedbackItem {
  id: string;
  message: string;
  type: string; // O Prisma retorna o Enum, que no JS comporta-se como string
  pageUrl: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

export default async function AdminFeedbacksPage() {
  const feedbacks: FeedbackItem[] = await getFeedbacks();

  async function handleDelete(id: string) {
    'use server';
    await deleteFeedback(id);
    revalidatePath('/admin/feedbacks');
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BUG': return <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold border border-red-200"><FaBug /> Erro</span>;
      case 'IDEA': return <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200"><FaLightbulb /> Ideia</span>;
      default: return <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200"><FaExclamationCircle /> Outro</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Feedbacks Recebidos</h1>
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm text-sm text-gray-500 border border-gray-200 dark:border-gray-700">
          Total: <span className="font-bold text-gray-900 dark:text-white">{feedbacks.length}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {feedbacks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhum feedback recebido ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Tipo</th>
                  <th className="p-4 font-medium w-1/2">Mensagem</th>
                  <th className="p-4 font-medium">Usuário</th>
                  <th className="p-4 font-medium">Origem</th>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {feedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="p-4 align-top">
                      {getTypeBadge(item.type)}
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-gray-900 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {item.message}
                      </p>
                    </td>
                    <td className="p-4 align-top">
                      {item.user ? (
                        <div className="flex items-center gap-2">
                          {item.user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.user.image} alt="" className="w-6 h-6 rounded-full" />
                          ) : (
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs"><FaUser /></div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.user.name}</p>
                            <p className="text-xs text-gray-500">{item.user.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Anônimo</span>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      {item.pageUrl && (
                        <Link 
                          href={item.pageUrl} 
                          target="_blank"
                          className="text-blue-500 hover:underline flex items-center gap-1 text-xs max-w-[150px] truncate"
                          title={item.pageUrl}
                        >
                          <FaExternalLinkAlt className="text-[10px]" /> 
                          {item.pageUrl}
                        </Link>
                      )}
                    </td>
                    <td className="p-4 align-top text-gray-500 whitespace-nowrap text-xs">
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')} <br/>
                      {new Date(item.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-4 align-top text-right">
                      <form action={handleDelete.bind(null, item.id)}>
                        <button 
                          className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Excluir Feedback"
                        >
                          <FaTrash />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}