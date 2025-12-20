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
