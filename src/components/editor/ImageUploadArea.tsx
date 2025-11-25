'use client';

import React, { useState, useCallback } from 'react';
import { FaCloudUploadAlt, FaSpinner, FaImage } from 'react-icons/fa';

interface ImageUploadAreaProps {
    onUpload: (markdown: string) => void;
    className?: string;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({ onUpload, className = '' }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const uploadImage = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        setIsUploading(true);
        try {
            // 1. Get Presigned URL
            const res = await fetch(`/api/upload?fileType=${encodeURIComponent(file.type)}`);
            if (!res.ok) throw new Error('Failed to get upload URL');
            const { uploadUrl, fileUrl } = await res.json();

            // 2. Upload to R2
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadRes.ok) throw new Error('Failed to upload image');

            // 3. Callback with markdown
            const imageMarkdown = `![${file.name}](${fileUrl})`;
            onUpload(imageMarkdown);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erro ao fazer upload da imagem. Tente novamente.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            uploadImage(files[0]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadImage(e.target.files[0]);
        }
    };

    return (
        <div
            className={`
                relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ease-in-out
                flex flex-col items-center justify-center gap-3 cursor-pointer
                ${isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50'
                }
                ${className}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('image-upload-input')?.click()}
        >
            <input
                id="image-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
            />

            {isUploading ? (
                <div className="flex flex-col items-center text-blue-500">
                    <FaSpinner className="text-3xl animate-spin mb-2" />
                    <span className="text-sm font-medium">Enviando imagem...</span>
                </div>
            ) : (
                <>
                    <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-colors
                        ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                    `}>
                        <FaCloudUploadAlt className="text-2xl" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Clique para enviar uma imagem
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ou arraste e solte aqui
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};
