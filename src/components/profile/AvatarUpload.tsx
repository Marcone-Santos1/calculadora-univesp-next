'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FaCamera, FaSpinner, FaUser } from 'react-icons/fa';
import { uploadAvatar } from '@/actions/user-actions';
import { useSession } from 'next-auth/react';

interface AvatarUploadProps {
    currentImage?: string | null;
}

export function AvatarUpload({ currentImage }: AvatarUploadProps) {
    const { update } = useSession();
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Upload
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await uploadAvatar(formData);
            await update(); // Update session to reflect new image
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Erro ao atualizar avatar. Tente novamente.');
            setPreview(currentImage || null); // Revert on error
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative group w-32 h-32 mx-auto">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg relative bg-gray-100 dark:bg-gray-700">
                {preview ? (
                    <Image
                        src={preview}
                        alt="Avatar"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaUser size={48} />
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <FaSpinner className="animate-spin text-white text-2xl" />
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-20"
                title="Alterar foto"
            >
                <FaCamera size={16} />
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
