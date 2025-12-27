"use client";

import { useToast } from "@/components/ToastProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";

type SettingsFormProps = {
    profile: {
        companyName: string | null;
        taxId: string | null;
        cellphone: string | null;
        whatsapp: string | null; // Keep for backward compatibility if needed, or remove
        cnpj: string | null; // Keep for backward compatibility if needed
    } | null;
    updateAction: (formData: FormData) => Promise<void>;
};

export default function SettingsForm({ profile, updateAction }: SettingsFormProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Helper to get initial values handling both new and old field names just in case
    const initialCompanyName = profile?.companyName || "";
    // Priority: taxId -> cnpj -> empty
    const initialTaxId = profile?.taxId || profile?.cnpj || "";
    // Priority: cellphone -> whatsapp -> empty
    const initialCellphone = profile?.cellphone || profile?.whatsapp || "";

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await updateAction(formData);
            showToast("Perfil atualizado com sucesso!", "success");
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar perfil.";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa / Anunciante</label>
                    <input
                        type="text"
                        name="companyName"
                        defaultValue={initialCompanyName}
                        placeholder="Ex: Minha Escola EAD"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPF ou CNPJ</label>
                    <input
                        type="text"
                        name="taxId"
                        defaultValue={initialTaxId}
                        placeholder="000.000.000-00"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Obrigatório para emissão de nota fiscal e pagamentos.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Celular / WhatsApp</label>
                    <input
                        type="text"
                        name="cellphone"
                        defaultValue={initialCellphone}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Para contato financeiro e notificações importantes.</p>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
            </div>
        </form>
    );
}
