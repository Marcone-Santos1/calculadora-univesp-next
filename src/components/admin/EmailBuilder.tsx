'use client';

import { useState } from 'react';
import { EmailBlock } from '@/lib/email-templates';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaAlignLeft, FaAlignCenter, FaAlignRight, FaBold, FaImage, FaFont, FaGripLines, FaGripVertical, FaPalette, FaLink, FaRulerVertical } from 'react-icons/fa';

interface EmailBuilderProps {
    blocks: EmailBlock[];
    onChange: (blocks: EmailBlock[]) => void;
}

export function EmailBuilder({ blocks, onChange }: EmailBuilderProps) {

    const addBlock = (type: EmailBlock['type']) => {
        const id = Math.random().toString(36).substr(2, 9);
        let newBlock: EmailBlock;

        switch (type) {
            case 'HEADING':
                newBlock = { id, type, content: 'Novo Título', align: 'center', color: '#1e3a8a' };
                break;
            case 'TEXT':
                newBlock = { id, type, content: 'Digite seu texto aqui...', align: 'left', color: '#374151' };
                break;
            case 'BUTTON':
                newBlock = { id, type, label: 'Clique Aqui', url: '#', bgColor: '#2563eb', txtColor: '#ffffff', align: 'center' };
                break;
            case 'IMAGE':
                newBlock = { id, type, url: '', alt: 'Imagem', width: '100%', align: 'center' };
                break;
            case 'SPACER':
                newBlock = { id, type, height: 20 };
                break;
            case 'DIVIDER':
                newBlock = { id, type, color: '#e5e7eb' };
                break;
            default:
                return;
        }

        onChange([...blocks, newBlock]);
    };

    const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
        onChange(blocks.map(b => b.id === id ? { ...b, ...updates } as EmailBlock : b));
    };

    const removeBlock = (id: string) => {
        onChange(blocks.filter(b => b.id !== id));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        onChange(newBlocks);
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
                <span className="text-xs font-bold text-gray-400 uppercase flex items-center px-2 mr-2 border-r border-gray-200 dark:border-zinc-700">Adicionar</span>

                <ToolbarButton icon={FaBold} label="Título" onClick={() => addBlock('HEADING')} />
                <ToolbarButton icon={FaFont} label="Texto" onClick={() => addBlock('TEXT')} />
                <ToolbarButton icon={() => <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>} label="Botão" onClick={() => addBlock('BUTTON')} />
                <ToolbarButton icon={FaImage} label="Imagem" onClick={() => addBlock('IMAGE')} />
                <ToolbarButton icon={FaGripLines} label="Divisor" onClick={() => addBlock('DIVIDER')} />
                <ToolbarButton icon={FaRulerVertical} label="Espaço" onClick={() => addBlock('SPACER')} />
            </div>

            {/* Blocks List */}
            <div className="space-y-4 min-h-[300px]">
                {blocks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-900/20">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-2xl animate-pulse">
                            ✨
                        </div>
                        <p className="font-medium">Seu email está vazio</p>
                        <p className="text-sm opacity-70">Selecione uma ferramenta acima para começar.</p>
                    </div>
                )}

                {blocks.map((block, index) => (
                    <div key={block.id} className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 pl-10 pr-4 py-4">

                        {/* Drag Handle & Quick Actions */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 dark:bg-zinc-800/50 border-r border-gray-100 dark:border-zinc-800 rounded-l-xl flex flex-col items-center py-3 gap-2 text-gray-300 dark:text-gray-600 group-hover:text-gray-400">
                            <span className="text-xs font-mono opacity-50">{index + 1}</span>
                            <FaGripVertical className="mt-auto mb-auto cursor-drag hover:text-gray-600" />
                        </div>

                        {/* Block Controls */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-800 shadow-lg border border-gray-100 dark:border-zinc-700 rounded-lg p-1 z-10 transform translate-x-2 group-hover:translate-x-0">
                            <button type="button" onClick={() => moveBlock(index, 'up')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded text-gray-500 hover:text-blue-500" title="Mover para cima"><FaArrowUp /></button>
                            <button type="button" onClick={() => moveBlock(index, 'down')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded text-gray-500 hover:text-blue-500" title="Mover para baixo"><FaArrowDown /></button>
                            <div className="w-px bg-gray-200 dark:bg-zinc-700 my-1"></div>
                            <button type="button" onClick={() => removeBlock(block.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded" title="Remover"><FaTrash /></button>
                        </div>

                        {/* Render Editor Based on Type */}
                        <div className="">
                            {block.type === 'HEADING' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge>TÍTULO</Badge>
                                        <div className="flex gap-2">
                                            <ColorInput value={block.color} onChange={(c) => updateBlock(block.id, { color: c })} />
                                            <AlignInput value={block.align} onChange={(a) => updateBlock(block.id, { align: a as any })} />
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={block.content}
                                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                        className="w-full text-2xl font-bold bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none transition-colors placeholder-gray-300 text-gray-900 dark:text-white"
                                        placeholder="Digite o título do cabeçalho"
                                    />
                                </div>
                            )}

                            {block.type === 'TEXT' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge>PARÁGRAFO</Badge>
                                        <div className="flex gap-2">
                                            <ColorInput value={block.color} onChange={(c) => updateBlock(block.id, { color: c })} />
                                            <AlignInput value={block.align} onChange={(a) => updateBlock(block.id, { align: a as any })} />
                                        </div>
                                    </div>
                                    <textarea
                                        value={block.content}
                                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                        rows={3}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-y text-sm text-gray-900 dark:text-gray-200"
                                        placeholder="Escreva o conteúdo do texto..."
                                    />
                                </div>
                            )}

                            {block.type === 'BUTTON' && (
                                <div className="space-y-4">
                                    <Badge>BOTÃO DE AÇÃO</Badge>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">Texto do Botão</label>
                                            <input
                                                type="text"
                                                value={block.label}
                                                onChange={(e) => updateBlock(block.id, { label: e.target.value })}
                                                className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:border-blue-500 outline-none text-sm font-medium text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><FaLink /> Link de Destino</label>
                                            <input
                                                type="text"
                                                value={block.url}
                                                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                                className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:border-blue-500 outline-none text-sm font-mono text-blue-600 dark:text-blue-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800/30 p-2 rounded-lg border border-gray-100 dark:border-zinc-700/50">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Estilo:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Fundo</span>
                                            <input type="color" value={block.bgColor} onChange={(e) => updateBlock(block.id, { bgColor: e.target.value })} className="w-6 h-6 rounded-full cursor-pointer shadow-sm border border-gray-200" title="Cor do Fundo" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Texto</span>
                                            <input type="color" value={block.txtColor} onChange={(e) => updateBlock(block.id, { txtColor: e.target.value })} className="w-6 h-6 rounded-full cursor-pointer shadow-sm border border-gray-200" title="Cor do Texto" />
                                        </div>
                                        <div className="ml-auto">
                                            <AlignInput value={block.align} onChange={(a) => updateBlock(block.id, { align: a as any })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {block.type === 'IMAGE' && (
                                <div className="space-y-3">
                                    <Badge>IMAGEM</Badge>
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">URL da Imagem</label>
                                            <input
                                                type="text"
                                                value={block.url}
                                                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                                className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:border-blue-500 outline-none text-sm font-mono text-gray-900 dark:text-white"
                                                placeholder="https://exemplo.com/imagem.png"
                                            />
                                        </div>
                                        <div className="w-32 space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">Largura</label>
                                            <input
                                                type="text"
                                                value={block.width}
                                                onChange={(e) => updateBlock(block.id, { width: e.target.value })}
                                                placeholder="100%"
                                                className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:border-blue-500 outline-none text-sm text-center text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <AlignInput value={block.align} onChange={(a) => updateBlock(block.id, { align: a as any })} />
                                    </div>
                                </div>
                            )}

                            {block.type === 'DIVIDER' && (
                                <div className="flex items-center gap-4 py-2">
                                    <Badge>DIVISOR</Badge>
                                    <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">Cor da linha:</span>
                                        <input type="color" value={block.color} onChange={(e) => updateBlock(block.id, { color: e.target.value })} className="w-6 h-6 rounded cursor-pointer border border-gray-200" />
                                    </div>
                                </div>
                            )}

                            {block.type === 'SPACER' && (
                                <div className="flex items-center gap-4 py-2">
                                    <Badge>ESPAÇAMENTO</Badge>
                                    <div className="flex-1 flex items-center gap-4 bg-gray-50 dark:bg-zinc-800/30 px-4 py-2 rounded-lg border border-dashed border-gray-200 dark:border-zinc-700">
                                        <input
                                            type="range"
                                            min="10"
                                            max="100"
                                            value={block.height}
                                            onChange={(e) => updateBlock(block.id, { height: parseInt(e.target.value) })}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                                        />
                                        <span className="text-xs font-mono font-bold text-gray-500 w-12 text-right">{block.height}px</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Subcomponents

const ToolbarButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
    >
        <Icon className="text-gray-400 group-hover:text-blue-500" />
        {label}
    </button>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded select-none">
        {children}
    </span>
);

const AlignInput = ({ value, onChange }: { value: string | undefined, onChange: (val: string) => void }) => (
    <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 gap-1 border border-gray-200 dark:border-zinc-700">
        <button type="button" onClick={() => onChange('left')} className={`p-1.5 rounded transition-all ${value === 'left' ? 'bg-white dark:bg-zinc-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}><FaAlignLeft size={12} /></button>
        <button type="button" onClick={() => onChange('center')} className={`p-1.5 rounded transition-all ${value === 'center' ? 'bg-white dark:bg-zinc-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}><FaAlignCenter size={12} /></button>
        <button type="button" onClick={() => onChange('right')} className={`p-1.5 rounded transition-all ${value === 'right' ? 'bg-white dark:bg-zinc-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}><FaAlignRight size={12} /></button>
    </div>
);

const ColorInput = ({ value, onChange }: { value: string | undefined, onChange: (val: string) => void }) => (
    <div className="flex items-center gap-2 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 bg-white dark:bg-zinc-800 hover:border-gray-300 transition-colors group cursor-pointer relative" title="Alterar Cor">
        <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: value }}></div>
        <FaPalette className="text-gray-300 text-xs" />
        <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
    </div>
);
