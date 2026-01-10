import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { SimuladoConfigForm } from '@/components/simulados/SimuladoConfigForm';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default async function NovoSimuladoPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const subjects = await prisma.subject.findMany({
        select: {
            id: true,
            name: true,
            icon: true,
            _count: {
                select: { 
                    questions: {
                        where: {
                            isVerified: true,
                        }
                    }
                } 
            },
        },
        orderBy: { questions: { _count: 'desc' } },
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <Link href="/simulados" className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2 mb-4">
                    <FaArrowLeft /> Voltar
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Configurar Novo Simulado
                </h1>
                <p className="text-gray-500">Escolha as matérias que deseja treinar. Serão selecionadas 8 questões de cada.</p>
            </div>

            <SimuladoConfigForm subjects={subjects} />
        </div>
    );
}
