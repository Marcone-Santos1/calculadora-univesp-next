'use server';

import { requireAdmin } from '@/lib/admin-auth';
import { GoogleGenAI } from '@google/genai';
import { ParsedQuestion } from './import-json-actions';
import { prisma } from '@/lib/prisma';

// Ensure the API key is available
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function processPdfWithGemini(formData: FormData): Promise<{ success: boolean; data?: ParsedQuestion[]; error?: string }> {
    await requireAdmin();

    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'Nenhum arquivo PDF enviado.' };
        }

        if (file.type !== 'application/pdf') {
            return { success: false, error: 'O arquivo deve ser um PDF.' };
        }

        // Convert the PDF file to base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');

        const prompt = `
        Analise esta prova e extraia todas as questões para o formato JSON definido.
        Regras:
        1. Extraia o "statement" (enunciado) e "options" (letras a, b, c, d, e).
        2. Se não houver letras nas alternativas, deduza a ordem (a, b, c...) de cima para baixo.
        3. Converta TODA a matemática, matrizes e fórmulas para LaTeX (usando $ para inline e $$ para blocos).
        4. Ignore textos do sistema do AVA (como pontuação, salvar, enviar).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: 'application/pdf'
                    }
                }
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            title: { type: "STRING" },
                            statement: { type: "STRING" },
                            options: {
                                type: "OBJECT",
                                properties: {
                                    a: { type: "STRING", nullable: true },
                                    b: { type: "STRING", nullable: true },
                                    c: { type: "STRING", nullable: true },
                                    d: { type: "STRING", nullable: true },
                                    e: { type: "STRING", nullable: true }
                                }
                            }
                        },
                        required: ["title", "statement", "options"]
                    }
                },
                temperature: 0.1,
                maxOutputTokens: 8192
            }
        });

        const jsonText = response.text;

        if (!jsonText) {
            return { success: false, error: 'A resposta da API retornou vazia.' };
        }

        let data;
        try {
            // Remove possíveis blocos markdown extras que a IA tenta enviar por engano
            const cleanJsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
            data = JSON.parse(cleanJsonText);
        } catch (parseError) {
            console.error('Error parsing JSON from Gemini API. Raw text:\n', jsonText);
            return {
                success: false,
                error: 'O modelo gerou um JSON inválido ou cortado pela metade (geralmente ocorre se o PDF for muito grande). Tente dividir a prova em duas ou mais partes menores.'
            };
        }

        if (!Array.isArray(data)) {
            return { success: false, error: 'A resposta do Gemini não é um array válido de questões.' };
        }

        const parsedQuestions: ParsedQuestion[] = [];
        let index = 0;

        for (const item of data) {
            if (!item.statement || !item.options) {
                continue;
            }

            const options: any[] = [];
            const optionKeys = ['a', 'b', 'c', 'd', 'e'];

            for (const key of optionKeys) {
                const text = (item.options as any)[key];
                if (text !== null && text !== undefined && String(text).trim() !== '') {
                    options.push({
                        letter: key.toUpperCase(),
                        text: String(text),
                        isCorrect: false
                    });
                }
            }

            if (options.length > 0) {
                const title = item.statement.substring(0, 100) + (item.statement.length > 100 ? '...' : '');

                const existingQuestion = await prisma.question.findFirst({
                    where: {
                        OR: [
                            { title: { equals: title.trim() } },
                            { text: { equals: item.statement.trim() } }
                        ]
                    },
                    select: { id: true }
                });

                if (!existingQuestion) {
                    parsedQuestions.push({
                        id: `temp_pdf_${Date.now()}_${index++}`,
                        statement: item.statement,
                        options
                    });
                }
            }
        }

        return { success: true, data: parsedQuestions };

    } catch (error: any) {
        console.error('Error processing PDF with Gemini:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao processar o PDF com a IA.'
        };
    }
}
