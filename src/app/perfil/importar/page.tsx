import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AvaImporter from '@/components/admin/AvaImporter';
import { Sparkles } from 'lucide-react';

export const metadata = {
    title: 'Importar do AVA | Calculadora Univesp',
    description: 'Transforme suas provas antigas em reputação.',
};

export default async function ImportarPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/');
    }

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold animate-fade-in">
                    <Sparkles className="w-4 h-4" />
                    <span>Beta</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Transforme suas provas antigas em <span className="text-amber-500">Reputação</span>!
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Importe automaticamente seus questionários do AVA. Ajude a comunidade a crescer e suba no ranking dos top contribuidores.
                </p>
            </div>

            {/* Importer Component */}
            <AvaImporter mode="user" />
        </div>
    );
}
