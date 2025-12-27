
"use client";

import { useState } from "react";
import { createCampaign, updateCampaign } from "@/actions/campaign-actions";
import { FaCloudUploadAlt, FaSpinner, FaImage } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

type CampaignData = {
    id?: string;
    title: string;
    dailyBudget: number;
    billingType: "CPC" | "CPM";
    costValue: number;
    startDate: Date | null;
    endDate: Date | null;
    creatives: {
        headline: string;
        description: string;
        destinationUrl: string;
        imageUrl: string;
    }[];
};

export default function CampaignForm({ initialData }: { initialData?: CampaignData }) {
    const isEdit = !!initialData;
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.creatives[0]?.imageUrl || null);

    // Derived values
    const today = new Date().toISOString().split('T')[0];
    const defaultStartDate = initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : today;
    const defaultEndDate = initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "";
    const creative = initialData?.creatives[0];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validations
        if (!file.type.startsWith("image/")) {
            alert("Por favor, selecione apenas arquivos de imagem.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert("A imagem deve ter no máximo 5MB.");
            return;
        }

        try {
            setUploading(true);
            const res = await fetch(`/api/upload?fileType=${file.type}`);
            if (!res.ok) throw new Error("Falha ao obter URL de upload");

            const { uploadUrl, fileUrl } = await res.json();

            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!uploadRes.ok) throw new Error("Falha ao enviar imagem");
            setPreviewUrl(fileUrl);

        } catch (error) {
            console.error(error);
            alert("Erro ao fazer upload da imagem. Tente novamente.");
        } finally {
            setUploading(false);
        }
    };

    const action = isEdit && initialData?.id
        ? updateCampaign.bind(null, initialData.id)
        : createCampaign;

    return (
        <form action={action} className="space-y-8">

            {/* Campaign Settings */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                    {isEdit ? "Editar Definições" : "Definições da Campanha"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nome da Campanha</label>
                        <input
                            type="text"
                            name="title"
                            defaultValue={initialData?.title}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            placeholder="Ex: Promoção Volta às Aulas"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Orçamento Diário (R$)</label>
                        <input
                            type="number"
                            name="dailyBudget"
                            min="10"
                            defaultValue={initialData ? initialData.dailyBudget / 100 : 50}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Modelo de Cobrança</label>
                        <select
                            name="billingType"
                            defaultValue={initialData?.billingType || "CPC"}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                        >
                            <option value="CPC">Custo por Clique (CPC)</option>
                            <option value="CPM">Custo por Mil Impressões (CPM)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Lance Máximo (R$)</label>
                        <input
                            type="number"
                            name="costValue"
                            min="0.10"
                            step="0.01"
                            defaultValue={initialData ? initialData.costValue / 100 : 1.50}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Valor máximo a pagar por clique (CPC) ou por mil visualizações (CPM).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Início</label>
                        <input
                            type="date"
                            name="startDate"
                            required
                            defaultValue={defaultStartDate}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Término (Opcional)</label>
                        <input
                            type="date"
                            name="endDate"
                            defaultValue={defaultEndDate}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Creative Settings - Only for New Campaigns */}
            {!isEdit && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Anúncio Criativo</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Título (Headline)</label>
                            <input
                                type="text"
                                name="headline"
                                maxLength={50}
                                defaultValue={creative?.headline}
                                required={!isEdit}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                                placeholder="Chame a atenção em poucas palavras"
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo 50 caracteres.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Descrição</label>
                            <textarea
                                name="description"
                                maxLength={150}
                                required={!isEdit}
                                defaultValue={creative?.description}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                                placeholder="Detalhes da sua oferta..."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">Máximo 150 caracteres.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Imagem do Anúncio</label>

                            <input type="hidden" name="imageUrl" value={previewUrl || ""} required={!isEdit} />

                            <div className="flex items-center gap-4">
                                <div className="relative w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600">
                                    {uploading ? (
                                        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                                    ) : previewUrl ? (
                                        <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                    ) : (
                                        <FaImage className="text-gray-400 text-3xl" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                                        <FaCloudUploadAlt className="text-lg" />
                                        <span>{isEdit ? "Alterar Imagem" : "Escolher Imagem"}</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">Formatos: JPG, PNG, WEBP. Máx: 5MB.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL de Destino</label>
                            <input
                                type="url"
                                name="destinationUrl"
                                defaultValue={creative?.destinationUrl}
                                required={!isEdit}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                                placeholder="https://seu-site.com.br/oferta"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-4">
                <Link href="/advertiser/campaigns" className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white">
                    Cancelar
                </Link>

                <button
                    type="submit"
                    disabled={uploading || (!isEdit && !previewUrl)}
                    className="px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? "Enviando..." : (isEdit ? "Salvar Alterações" : "Lançar Campanha")}
                </button>
            </div>

            {isEdit && (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                    <p><strong>Atenção:</strong> Ao salvar alterações em uma campanha, ela voltará para o status <strong>Pendente de Revisão</strong> e deverá ser aprovada novamente pela equipe.</p>
                </div>
            )}

        </form>
    );
}
