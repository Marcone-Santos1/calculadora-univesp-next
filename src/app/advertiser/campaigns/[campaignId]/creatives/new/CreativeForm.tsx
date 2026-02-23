"use client";

import { useState } from "react";
import { addCreativeToCampaign } from "@/actions/campaign-actions";
import { FaCloudUploadAlt, FaSpinner, FaImage } from "react-icons/fa";
import Image from "next/image";

export default function CreativeForm({ campaignId }: { campaignId: string }) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    const action = addCreativeToCampaign.bind(null, campaignId);

    return (
        <form action={action} className="space-y-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">

            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                Novo Anúncio (Criativo)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Prevent "Image is required" error by validating hidden input later or ensuring user uploads */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Imagem do Anúncio (Banner)</label>
                    <div className="relative group">
                        <div className={`
                            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                            ${previewUrl ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
                        `}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            // required={!previewUrl} // Modificado para opcional
                            />

                            {uploading ? (
                                <div className="flex flex-col items-center text-blue-600 dark:text-blue-400">
                                    <FaSpinner className="animate-spin text-2xl mb-2" />
                                    <span className="text-sm font-medium">Enviando imagem...</span>
                                </div>
                            ) : previewUrl ? (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-sm">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                                        Clique para alterar
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                    <FaCloudUploadAlt className="text-4xl mb-2" />
                                    <span className="font-medium">Clique para fazer upload</span>
                                    <span className="text-xs mt-1">PNG, JPG ou WEBP (Max 5MB)</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Hidden input to send URL to server action */}
                    <input type="hidden" name="imageUrl" value={previewUrl || ""} />
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Título (Headline)</label>
                        <input
                            type="text"
                            name="headline"
                            required
                            maxLength={50}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            placeholder="Ex: Matricule-se com 50% OFF"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">Máx. 50 caracteres</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Descrição</label>
                        <textarea
                            name="description"
                            required
                            rows={3}
                            maxLength={150}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white resize-none"
                            placeholder="Descreva seu produto ou oferta..."
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-1 text-right">Máx. 150 caracteres</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Link de Destino</label>
                        <input
                            type="url"
                            name="destinationUrl"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            placeholder="https://seu-site.com.br/oferta"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={uploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <FaImage /> Adicionar Criativo
                </button>
            </div>
        </form>
    );
}
