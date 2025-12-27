'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/actions/user-actions';
import { FaSave, FaMapMarkerAlt, FaGlobe, FaTwitter, FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { AvatarUpload } from './AvatarUpload';
import { useToast } from '@/components/ToastProvider';

interface SocialLinks {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
}

interface ProfileEditFormProps {
    user: {
        id: string;
        name: string | null;
        image: string | null;
        bio: string | null;
        location: string | null;
        website: string | null;
        socialLinks: SocialLinks | null;
    };
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        socialLinks: {
            twitter: user.socialLinks?.twitter || '',
            github: user.socialLinks?.github || '',
            linkedin: user.socialLinks?.linkedin || '',
            instagram: user.socialLinks?.instagram || '',
        }
    });

    const { showToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await updateProfile({
                bio: formData.bio,
                location: formData.location,
                website: formData.website,
                socialLinks: formData.socialLinks
            });
            showToast('Perfil atualizado com sucesso!', 'success');
            router.push(`/perfil/${user.id}`);
            router.refresh();
            showToast({ 
                message: 'Redirecionando para o perfil...', 
                type: 'info',
                delay: 1500 
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Erro ao atualizar perfil. Tente novamente.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            {/* Avatar Section */}
            <div className="text-center mb-8">
                <AvatarUpload currentImage={user.image} />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Clique na câmera para alterar sua foto
                </p>
            </div>

            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                    Informações Básicas
                </h3>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Conte um pouco sobre você..."
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-500 text-right mt-1">
                        {formData.bio.length}/500
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <div className="flex items-center gap-2">
                                <FaMapMarkerAlt className="text-gray-400" />
                                Polo
                            </div>
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ex: São Paulo, SP"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <div className="flex items-center gap-2">
                                <FaGlobe className="text-gray-400" />
                                Website
                            </div>
                        </label>
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://seu-site.com"
                        />
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                    Redes Sociais
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <div className="flex items-center gap-2">
                                <FaGithub className="text-gray-400" />
                                GitHub
                            </div>
                        </label>
                        <input
                            type="text"
                            name="github"
                            value={formData.socialLinks.github}
                            onChange={handleSocialChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <div className="flex items-center gap-2">
                                <FaTwitter className="text-blue-400" />
                                Twitter / X
                            </div>
                        </label>
                        <input
                            type="text"
                            name="twitter"
                            value={formData.socialLinks.twitter}
                            onChange={handleSocialChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <div className="flex items-center gap-2">
                                <FaLinkedin className="text-blue-700" />
                                LinkedIn
                            </div>
                        </label>
                        <input
                            type="text"
                            name="linkedin"
                            value={formData.socialLinks.linkedin}
                            onChange={handleSocialChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <div className="flex items-center gap-2">
                                <FaInstagram className="text-pink-600" />
                                Instagram
                            </div>
                        </label>
                        <input
                            type="text"
                            name="instagram"
                            value={formData.socialLinks.instagram}
                            onChange={handleSocialChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="username"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>Salvano...</>
                    ) : (
                        <>
                            <FaSave /> Salvar Alterações
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
