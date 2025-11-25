'use client';

import React, { useState, useEffect } from 'react';
import MDEditor, { commands, ICommand, TextState, TextAreaTextApi } from '@uiw/react-md-editor';
import { FaImage, FaSpinner } from 'react-icons/fa';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    placeholder,
    height = 300
}) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Check initial theme
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark');
                    setTheme(isDark ? 'dark' : 'light');
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);
    const [isUploading, setIsUploading] = useState(false);

    const uploadImage = async (file: File): Promise<string> => {
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

            return fileUrl;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const onImageUpload = async (file: File) => {
        try {
            const url = await uploadImage(file);
            const imageMarkdown = `![${file.name}](${url})`;
            onChange(value ? `${value}\n${imageMarkdown}` : imageMarkdown);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erro ao fazer upload da imagem. Tente novamente.');
        }
    };

    const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
        const items = event.clipboardData.items;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                event.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    await onImageUpload(file);
                }
            }
        }
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                await onImageUpload(file);
            }
        }
    };

    // Custom image button
    const imageCommand: ICommand = {
        name: 'image-upload',
        keyCommand: 'image-upload',
        buttonProps: { 'aria-label': 'Insert Image' },
        icon: (
            <span style={{ display: 'flex', alignItems: 'center' }}>
                {isUploading ? <FaSpinner className="animate-spin" /> : <FaImage />}
            </span>
        ),
        execute: (state: TextState, api: TextAreaTextApi) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    try {
                        const url = await uploadImage(file);
                        const imageMarkdown = `![${file.name}](${url})`;
                        api.replaceSelection(imageMarkdown);
                    } catch (error) {
                        console.error('Upload error:', error);
                        alert('Erro ao fazer upload da imagem.');
                    }
                }
            };
            input.click();
        },
    };

    return (
        <div
            className="w-full"
            data-color-mode={theme === 'dark' ? 'dark' : 'light'}
            onPaste={handlePaste}
            onDrop={handleDrop}
        >
            <MDEditor
                value={value}
                onChange={(val) => onChange(val || '')}
                height={height}
                preview="edit"
                commands={[
                    commands.bold,
                    commands.italic,
                    commands.strikethrough,
                    commands.hr,
                    commands.title,
                    commands.divider,
                    commands.link,
                    commands.quote,
                    commands.code,
                    commands.codeBlock,
                    imageCommand, // Custom image command
                    commands.divider,
                    commands.unorderedListCommand,
                    commands.orderedListCommand,
                    commands.checkedListCommand,
                ]}
                textareaProps={{
                    placeholder: placeholder || 'Digite seu texto aqui... (Suporta Markdown e colar imagens)',
                }}
            />
        </div>
    );
};
