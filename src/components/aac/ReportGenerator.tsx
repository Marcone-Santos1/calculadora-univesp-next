"use client";

import { ActivityData, getReportConfig, saveReportConfig } from "@/actions/aac-actions";
import { useState, useEffect } from "react";
import { FaFileAlt, FaTimes, FaArrowRight, FaArrowLeft, FaUniversity, FaPenNib, FaFileWord, FaDownload } from "react-icons/fa";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, PageBreak, BorderStyle } from "docx";
import { saveAs } from "file-saver";

type Props = {
    activities: ActivityData[];
    userName?: string | null;
    userEmail?: string | null;
};

// Types for the Report Data
type ReportData = {
    ra: string;
    polo: string;
    ingressDate: string;
    intro: string;
    conclusion: string;
    activityDetails: Record<string, {
        description: string;
        relation: string;
    }>;
};

export function ReportGenerator({ activities, userName, userEmail }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);

    // Form State
    const [formData, setFormData] = useState<ReportData>({
        ra: "",
        polo: "",
        ingressDate: "",
        intro: "Os cursos realizados foram fundamentais para complementar minha formação acadêmica, proporcionando conhecimentos práticos e teóricos que dialogam diretamente com as competências exigidas pelo mercado de trabalho na minha área.",
        conclusion: "A realização destas atividades permitiu consolidar os conhecimentos adquiridos ao longo da graduação. Além disso, proporcionaram uma visão mais ampla sobre as aplicações práticas da teoria estudada, gerando novas oportunidades de networking e aperfeiçoamento profissional.",
        activityDetails: {}
    });

    // Persistence Logic
    useEffect(() => {
        const loadData = async () => {
            let initialData = { ...formData };

            // 1. LocalStorage
            if (typeof window !== "undefined") {
                try {
                    const local = localStorage.getItem("aac_report_config");
                    if (local) {
                        const parsed = JSON.parse(local);
                        initialData = { ...initialData, ...parsed };
                    }
                } catch (e) {
                    console.error("Local load error", e);
                }
            }

            // 2. Server
            if (userName) { // Only attempt if logged in/user exists context
                try {
                    const serverConfig = await getReportConfig();
                    if (serverConfig) {
                        initialData = {
                            ...initialData,
                            ra: serverConfig.ra || initialData.ra,
                            polo: serverConfig.polo || initialData.polo,
                            ingressDate: serverConfig.ingressDate || initialData.ingressDate,
                            intro: serverConfig.intro || initialData.intro,
                            conclusion: serverConfig.conclusion || initialData.conclusion,
                            activityDetails: (serverConfig.activityDetails as any) || initialData.activityDetails
                        };
                    }
                } catch (e) {
                    console.error("Server load error", e);
                }
            }

            setFormData(initialData);
            setIsLoaded(true);
        };

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once

    // Save Logic
    useEffect(() => {
        if (!isLoaded) return;

        // Local Immediate
        if (typeof window !== "undefined") {
            localStorage.setItem("aac_report_config", JSON.stringify(formData));
        }

        // Server Debounce
        const timer = setTimeout(() => {
            if (userName) {
                saveReportConfig(formData).catch(e => console.error("Save error", e));
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [formData, isLoaded, userName]);

    const [isGenerating, setIsGenerating] = useState(false);

    // Initializer for activity details if needed
    const initializeActivityDetails = () => {
        const details: any = { ...formData.activityDetails };
        activities.forEach(a => {
            if (!details[a.id || a.title]) {
                details[a.id || a.title] = {
                    description: a.description || "",
                    relation: ""
                };
            }
        });
        setFormData(prev => ({ ...prev, activityDetails: details }));
    };

    const handleOpen = () => {
        initializeActivityDetails();
        setStep(1);
        setIsOpen(true);
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const updateDetail = (id: string, field: "description" | "relation", value: string) => {
        setFormData(prev => ({
            ...prev,
            activityDetails: {
                ...prev.activityDetails,
                [id]: {
                    ...prev.activityDetails[id],
                    [field]: value
                }
            }
        }));
    };

    const generateDocx = async () => {
        setIsGenerating(true);
        try {
            const currentYear = new Date().getFullYear().toString();
            // Calculate total hours with 50h cap per activity
            const totalHours = activities.reduce((acc, curr) => {
                const hours = curr.validHours || 0;
                return acc + hours;
            }, 0);

            // --- STYLES HELPER ---
            // ABNT Default: Arial 12 (size 24), Justified, 1.5 Line Spacing (360)
            const commonOptions = {
                font: "Arial",
                size: 24,
            };

            const createNormalParagraph = (text: string, overrides: any = {}) => new Paragraph({
                children: [new TextRun({ text, ...commonOptions, ...overrides })],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { line: 360 }, // 1.5 lines
                indent: { firstLine: 708 }, // 1.25cm approx (1cm = 567dxa) -> 1.25cm = 708dxa
            });

            // Headers: Bold, Uppercase, Left aligned (usually), No indentation usually required for titles but let's see
            const createSectionTitle = (text: string) => new Paragraph({
                children: [new TextRun({ text, ...commonOptions, bold: true })],
                alignment: AlignmentType.LEFT,
                spacing: { before: 240, after: 240 }, // Space before and after
            });

            // --- 1. CAPA ---
            const coverPageItems = [
                new Paragraph({
                    children: [new TextRun({ text: "UNIVERSIDADE VIRTUAL DO ESTADO DE SÃO PAULO", ...commonOptions, bold: true })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 0 }
                }),
                // 4 empty lines
                new Paragraph({ text: "", spacing: { after: 960 } }),

                new Paragraph({
                    children: [new TextRun({ text: (userName || "NOME DO ALUNO").toUpperCase(), ...commonOptions, bold: true })],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    children: [new TextRun({ text: `RA: ${formData.ra}`, ...commonOptions })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 4000 } // Approx spacing
                }),

                new Paragraph({
                    children: [new TextRun({ text: "RELATÓRIO DE ATIVIDADES PRÁTICAS PROFISSIONAIS", ...commonOptions, bold: true })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 6000 } // Approx to push to bottom
                }),

                // Bottom of Cover Page
                new Paragraph({
                    children: [new TextRun({ text: `${formData.polo} - SP`, ...commonOptions })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 3000 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: currentYear, ...commonOptions })],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    children: [],
                    pageBreakBefore: true
                })
            ];

            // --- 2. DEVELOPMENT ---

            // 1. INTRODUÇÃO
            const introSection = [
                createSectionTitle("1. INTRODUÇÃO"),
                createNormalParagraph(formData.intro)
            ];

            // 2. DESCRIÇÃO DAS ATIVIDADES
            const activitiesSection: Paragraph[] = [
                new Paragraph({ text: "", spacing: { after: 240 } }), // Spacer
                createSectionTitle("2. DESCRIÇÃO DAS ATIVIDADES")
            ];

            activities.forEach((activity, index) => {
                const details = formData.activityDetails[activity.id || activity.title] || { description: "", relation: "" };

                // Subtitle: 2.1 NAME
                activitiesSection.push(
                    new Paragraph({
                        children: [new TextRun({ text: `2.${index + 1} ${activity.title.toUpperCase()}`, ...commonOptions, bold: true })],
                        alignment: AlignmentType.LEFT,
                        spacing: { before: 240, after: 120 }
                    })
                );

                // Image Placeholder
                activitiesSection.push(
                    new Paragraph({
                        children: [new TextRun({ text: "[CLIQUE AQUI E COLE A IMAGEM DO CERTIFICADO]", font: "Arial", size: 20, color: "888888" })],
                        alignment: AlignmentType.CENTER,

                        border: {
                            top: { style: BorderStyle.SINGLE, size: 4, space: 4, color: "000000" },
                            bottom: { style: BorderStyle.SINGLE, size: 4, space: 4, color: "000000" },
                            left: { style: BorderStyle.SINGLE, size: 4, space: 4, color: "000000" },
                            right: { style: BorderStyle.SINGLE, size: 4, space: 4, color: "000000" },
                        },
                        spacing: { after: 240, before: 120 }
                    })
                );

                // Description
                activitiesSection.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Descrição: ", ...commonOptions, bold: true }),
                            new TextRun({ text: details.description || "Preencher descrição no gerador.", ...commonOptions })
                        ],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { line: 360 }
                    })
                );

                // Relation
                activitiesSection.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Relação com o curso: ", ...commonOptions, bold: true }),
                            new TextRun({ text: details.relation || "Preencher relação no gerador.", ...commonOptions })
                        ],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { line: 360, after: 240 }
                    })
                );

                // Empty line separator
                activitiesSection.push(new Paragraph(""));
            });

            // 3. RESUMO DAS ATIVIDADES (Table)
            const tableHeader = new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ITEM", ...commonOptions, bold: true })], alignment: AlignmentType.CENTER })], width: { size: 10, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "NOME DO CERTIFICADO", ...commonOptions, bold: true })], alignment: AlignmentType.CENTER })], width: { size: 70, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "CARGA HORÁRIA", ...commonOptions, bold: true })], alignment: AlignmentType.CENTER })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                ]
            });

            const tableRows = activities.map((a, i) => {
                const cappedHours = a.validHours || 0;

                return new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${i + 1}`, ...commonOptions })], alignment: AlignmentType.CENTER })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: a.title, ...commonOptions })], alignment: AlignmentType.LEFT })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${cappedHours}h`, ...commonOptions })], alignment: AlignmentType.CENTER })] }),
                    ]
                });
            });

            const tableFooter = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "TOTAL:", ...commonOptions, bold: true })], alignment: AlignmentType.RIGHT })],
                        columnSpan: 2
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: `${totalHours}h`, ...commonOptions, bold: true })], alignment: AlignmentType.CENTER })]
                    })
                ]
            });

            const summarySection = [
                new Paragraph({ text: "", spacing: { after: 240 } }),
                createSectionTitle("3. RESUMO DAS ATIVIDADES"),
                new Table({
                    rows: [tableHeader, ...tableRows, tableFooter],
                    width: { size: 100, type: WidthType.PERCENTAGE }
                })
            ];

            // 4. CONCLUSÃO
            const conclusionSection = [
                new Paragraph({ text: "", spacing: { after: 240 } }),
                createSectionTitle("4. CONCLUSÃO"),
                createNormalParagraph(formData.conclusion)
            ];

            // 5. REFERÊNCIAS
            const refsSection = [
                new Paragraph({ text: "", spacing: { after: 240 } }),
                createSectionTitle("5. REFERÊNCIAS BIBLIOGRÁFICAS")
            ];

            activities.forEach(a => {
                const today = new Date().toLocaleDateString("pt-BR");
                refsSection.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${a.title.toUpperCase()}. `, ...commonOptions }),
                            new TextRun({ text: `${a.institution || "Plataforma Online"}. `, ...commonOptions }),
                            new TextRun({ text: "Disponível em: <URL>. ", ...commonOptions }),
                            new TextRun({ text: `Acesso em: ${today}.`, ...commonOptions })
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 120 }
                    })
                );
            });


            // --- ASSEMBLY ---
            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 1701, // 3cm
                                left: 1701, // 3cm
                                bottom: 1134, // 2cm
                                right: 1134 // 2cm
                            }
                        }
                    },
                    children: [
                        ...coverPageItems,
                        ...introSection,
                        ...activitiesSection,
                        ...summarySection,
                        ...conclusionSection,
                        ...refsSection
                    ]
                }]
            });

            const blob = await Packer.toBlob(doc);
            const safeRA = formData.ra.replace(/[^a-zA-Z0-9]/g, "");
            saveAs(blob, `Relatorio_AAC_${safeRA || "UNIVESP"}.docx`);

        } catch (error) {
            console.error("Error generating docx", error);
            alert("Erro ao gerar documento. Verifique o console.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-transform hover:scale-105"
            >
                <FaFileAlt /> Gerar Relatório
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaFileWord className="text-blue-600" /> Relatório AAC (Word)
                                </h3>
                                <div className="flex gap-2 mt-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`h-1.5 w-12 rounded-full transition-colors ${step >= i ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Passo {step} de 4</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        {/* Body - Wizard Steps */}
                        <div className="p-8 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/50">

                            {/* Step 1: Academic Data */}
                            {step === 1 && (
                                <div className="space-y-6 animate-slideIn">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">1. Dados Acadêmicos & Capa</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                                            <input type="text" disabled value={userName || ""} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RA (Registro Acadêmico)</label>
                                            <input
                                                type="text"
                                                value={formData.ra}
                                                onChange={e => setFormData({ ...formData, ra: e.target.value })}
                                                className="w-full px-4 py-2 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                                placeholder="Ex: 1234567"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Polo</label>
                                            <input
                                                type="text"
                                                value={formData.polo}
                                                onChange={e => setFormData({ ...formData, polo: e.target.value })}
                                                className="w-full px-4 py-2 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                                placeholder="Ex: Polo Jundiaí"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ano/Data de Ingresso</label>
                                            <input
                                                type="text"
                                                value={formData.ingressDate}
                                                onChange={e => setFormData({ ...formData, ingressDate: e.target.value })}
                                                className="w-full px-4 py-2 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                                placeholder="Ex: 2022"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Essay */}
                            {step === 2 && (
                                <div className="space-y-6 animate-slideIn">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">2. Texto Dissertativo</h4>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                            <FaPenNib className="text-gray-400" /> 1. Introdução
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">Disserte sobre a importância dos cursos realizados para sua carreira.</p>
                                        <textarea
                                            rows={5}
                                            value={formData.intro}
                                            onChange={e => setFormData({ ...formData, intro: e.target.value })}
                                            className="w-full px-4 py-3 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                            <FaUniversity className="text-gray-400" /> 4. Conclusão
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">Retome o conhecimento geral e mencione oportunidades geradas.</p>
                                        <textarea
                                            rows={5}
                                            value={formData.conclusion}
                                            onChange={e => setFormData({ ...formData, conclusion: e.target.value })}
                                            className="w-full px-4 py-3 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Activities Loop */}
                            {step === 3 && (
                                <div className="space-y-8 animate-slideIn">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">3. Detalhes das Atividades</h4>
                                    <div className="space-y-8">
                                        {activities.map((activity, index) => {
                                            const key = activity.id || activity.title;
                                            return (
                                                <div key={key} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">#{index + 1}</span>
                                                        <h5 className="font-bold text-gray-800 dark:text-white">{activity.title}</h5>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">O que foi aprendido</label>
                                                            <textarea
                                                                rows={3}
                                                                value={formData.activityDetails[key]?.description || ""}
                                                                onChange={e => updateDetail(key, "description", e.target.value)}
                                                                className="w-full px-3 py-2 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-sm focus:ring-1 focus:ring-blue-500"
                                                                placeholder="Descreva o conteúdo..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold uppercase text-blue-500 mb-1">Relação com o curso (UNIVESP)</label>
                                                            <textarea
                                                                rows={3}
                                                                value={formData.activityDetails[key]?.relation || ""}
                                                                onChange={e => updateDetail(key, "relation", e.target.value)}
                                                                className="w-full px-3 py-2 text-gray-900 dark:text-gray-200 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 text-sm focus:ring-1 focus:ring-blue-500"
                                                                placeholder="Como isso se conecta com sua graduação?"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Download Card */}
                            {step === 4 && (
                                <div className="h-full flex flex-col items-center justify-center animate-slideIn space-y-6">
                                    <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col items-center text-center max-w-md w-full">
                                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                                            <FaFileWord size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Relatório Pronto</h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                                            Seu documento foi formatado seguindo as normas da UNIVESP (Capa, Margens ABNT, Seções). Clique abaixo para baixar o arquivo .docx.
                                        </p>

                                        <button
                                            onClick={generateDocx}
                                            disabled={isGenerating}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? (
                                                <>Processando...</>
                                            ) : (
                                                <><FaDownload /> Baixar Relatório (.docx)</>
                                            )}
                                        </button>
                                        <p className="text-xs text-gray-400 mt-4">Compatível com Word e Google Docs</p>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer - Navigation */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between bg-white dark:bg-gray-800 rounded-b-2xl">
                            {step > 1 ? (
                                <button
                                    onClick={handleBack}
                                    className="px-6 py-2.5 text-gray-900 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <FaArrowLeft /> Voltar
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 4 && (
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow flex items-center gap-2"
                                >
                                    Próximo <FaArrowRight />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
