
import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
    const cnpj = formData.get("cnpj") as string;
    const whatsapp = formData.get("whatsapp") as string;

    await db.advertiserProfile.upsert({
        where: { userId: session.user.id },
        create: {
            userId: session.user.id,
            companyName,
            cnpj,
            whatsapp,
            balance: 0
        },
        update: {
            companyName,
            cnpj,
            whatsapp
        }
    });

    revalidatePath("/advertiser/dashboard/settings");
}

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const profile = await getProfile(session.user.id);

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configurações da Conta</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <form action={updateProfile} className="space-y-6">

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa</label>
                            <input
                                type="text"
                                name="companyName"
                                defaultValue={profile?.companyName || ""}
                                placeholder="Ex: Minha Escola EAD"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ (Opcional)</label>
                            <input
                                type="text"
                                name="cnpj"
                                defaultValue={profile?.cnpj || ""}
                                placeholder="00.000.000/0000-00"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp para Contato</label>
                            <input
                                type="text"
                                name="whatsapp"
                                defaultValue={profile?.whatsapp || ""}
                                placeholder="(11) 99999-9999"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">Será usado se precisarmos entrar em contato sobre seus anúncios.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Salvar Alterações
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
