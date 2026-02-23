
"use client";

import { useState } from "react";
import { createCampaign, updateCampaign } from "@/actions/campaign-actions";
import { FaCloudUploadAlt, FaSpinner, FaImage, FaSearch, FaTimes } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

type CampaignData = {
    id?: string;
    title: string;
    dailyBudget: number;
    billingType: "CPC" | "CPM";
    costValue: number;
    startDate: Date | null;
    endDate: Date | null;
    targetSubjectId?: string | null;
    creatives: {
        headline: string;
        description: string;
        destinationUrl: string;
        imageUrl: string | null;
    }[];
};

export default function CampaignForm({ initialData, subjects = [] }: { initialData?: CampaignData, subjects?: any[] }) {
    const isEdit = !!initialData;
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.creatives[0]?.imageUrl || null);

    const { showToast } = useToast();

    // Subject Search States
    const [subjectSearch, setSubjectSearch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<any | null>(
        initialData?.targetSubjectId ? subjects?.find(s => s.id === initialData.targetSubjectId) || null : null
    );
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

    const filteredSubjects = subjects?.filter(s =>
        s.name.toLowerCase().includes(subjectSearch.toLowerCase())
    ) || [];

    const handleSubjectSelect = (subject: any) => {
        setSelectedSubject(subject);
        setSubjectSearch('');
        setIsSubjectDropdownOpen(false);
    };

    const handleClearSubject = () => {
        setSelectedSubject(null);
        setSubjectSearch('');
    };

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
            showToast("Por favor, selecione apenas arquivos de imagem.", "error");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showToast("A imagem deve ter no máximo 5MB.", "error");
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
            showToast("Erro ao fazer upload da imagem. Tente novamente.", "error");
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

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Campanha Contextual</label>
                        <div className="relative">
                            <input type="hidden" name="targetSubjectId" value={selectedSubject?.id || ''} />

                            {selectedSubject ? (
                                <div className="w-full p-2 rounded-lg border flex items-center justify-between border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <span>{selectedSubject.name}</span>
                                    <button
                                        type="button"
                                        onClick={handleClearSubject}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Buscar matéria (vazio = Global)"
                                            value={subjectSearch}
                                            onChange={(e) => {
                                                setSubjectSearch(e.target.value);
                                                setIsSubjectDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsSubjectDropdownOpen(true)}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none text-gray-900 dark:text-white focus:ring-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500"
                                        />
                                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                    </div>

                                    {isSubjectDropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsSubjectDropdownOpen(false)}
                                            />
                                            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                                                {filteredSubjects.length > 0 ? (
                                                    filteredSubjects.map((subject) => (
                                                        <button
                                                            key={subject.id}
                                                            type="button"
                                                            onClick={handleSubjectSelect.bind(null, subject)}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                                                        >
                                                            {subject.name}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                                                        Nenhuma matéria encontrada
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Selecione uma matéria ou deixe vazio (Global).</p>
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
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Imagem do Anúncio (Opcional)</label>

                            <input type="hidden" name="imageUrl" value={previewUrl || ""} />

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
                    disabled={uploading}
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

            <style jsx>{`
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgb(209 213 219) transparent;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgb(209 213 219);
                    border-radius: 9999px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgb(156 163 175);
                }
                
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgb(75 85 99);
                }
                
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgb(107 114 128);
                }
            `}</style>

        </form>
    );
}
