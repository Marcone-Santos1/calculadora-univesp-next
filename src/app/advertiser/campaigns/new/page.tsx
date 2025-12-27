
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CampaignForm from "./CampaignForm";

export default async function NewCampaignPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Criar Nova Campanha</h1>
            <CampaignForm />
        </div>
    );
}
