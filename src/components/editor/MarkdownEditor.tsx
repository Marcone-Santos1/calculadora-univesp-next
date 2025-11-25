'use client';

import React, { useState, useEffect } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';

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
        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        };

        checkTheme();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    checkTheme();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div
            className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all"
            data-color-mode={theme === 'dark' ? 'dark' : 'light'}
        >
            <MDEditor
                value={value}
                onChange={(val) => onChange(val || '')}
                height={height}
                preview="edit"
                visibleDragbar={false}
                hideToolbar={false}
                enableScroll={true}
                commands={[
                    commands.bold,
                    commands.italic,
                    commands.strikethrough,
                    commands.divider,
                    commands.link,
                    commands.quote,
                    commands.code,
                    commands.codeBlock,
                    commands.divider,
                    commands.unorderedListCommand,
                    commands.orderedListCommand,
                    commands.checkedListCommand,
                ]}
                textareaProps={{
                    placeholder: placeholder || 'Digite seu texto aqui...',
                }}
                className="!border-none"
            />
            <style jsx global>{`
                .w-md-editor {
                    background-color: transparent !important;
                    box-shadow: none !important;
                }
                .w-md-editor-toolbar {
                    background-color: ${theme === 'dark' ? '#1f2937' : '#f9fafb'} !important;
                    border-bottom: 1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'} !important;
                    padding: 8px 12px !important;
                }
                .w-md-editor-content {
                    background-color: ${theme === 'dark' ? '#111827' : '#ffffff'} !important;
                }
                .w-md-editor-text-pre > code,
                .w-md-editor-text-input,
                .w-md-editor-text {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                    font-size: 15px !important;
                    line-height: 1.6 !important;
                }
            `}</style>
        </div>
    );
};
