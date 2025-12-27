import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import SettingsForm from "./SettingsForm";
import { validateTaxId } from "@/utils/functions";

async function getProfile(userId: string) {
    return await db.advertiserProfile.findUnique({
        where: { userId }
    });
}

async function updateProfile(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;

    const companyName = formData.get("companyName") as string;
    const taxId = formData.get("taxId") as string;
    const cellphone = formData.get("cellphone") as string;

    if (!validateTaxId(taxId)) {
        throw new Error("CPF ou CNPJ inválido.");
    }

    await db.advertiserProfile.upsert({
        where: { userId: session.user.id },
        create: {
            userId: session.user.id,
            companyName,
            taxId,
            cellphone,
            balance: 0
        },
        update: {
            companyName,
            taxId,
            cellphone
        }
    });

    revalidatePath("/advertiser/dashboard/settings");
}

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const profile = await getProfile(session.user.id);

    // Quick cast to match the loose type in SettingsForm if needed, or rely on compatibility
    // The profile from prisma will have taxId, cellphone, etc.

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configurações da Conta</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <SettingsForm profile={profile as any} updateAction={updateProfile} />
            </div>
        </div>
    );
}
