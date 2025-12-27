
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreativeForm from "./CreativeForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default async function NewCreativePage({ params }: { params: Promise<{ campaignId: string }> }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const resolvedParams = await params;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Link
                href={`/advertiser/campaigns/${resolvedParams.campaignId}`}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 mb-6 transition-colors"
            >
                <FaArrowLeft /> Voltar para Detalhes da Campanha
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Adicionar Novo Criativo</h1>

            <CreativeForm campaignId={resolvedParams.campaignId} />
        </div>
    );
}
