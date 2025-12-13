'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
// Switching to 1.5 PRO for maximum reasoning/OCR accuracy, despite being slower.
// The user complained about missing questions/alternatives.
const MODEL_NAME = "gemini-2.5-flash";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function extractQuestionsFromImage(imageBase64: string) {
    try {
        const session = await auth();
        if (session?.user?.isAdmin !== true) {
            return { success: false, error: "Unauthorized" };
        }

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1, // Near zero for strict OCR
            }
        });

        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        // Extremely explicit prompt to prevent missing data
        const prompt = `
      CONTEXTO: Você é um especialista em OCR e estruturação de provas de Cálculo e Exatas.
      ENTRADA: Uma imagem de uma prova impressa do sistema AVA (Blackboard).
      
      TAREFA: Extrair as questões e alternativas para um JSON Array estruturado.

      PADRÕES VISUAIS ESPECÍFICOS (LEIA COM ATENÇÃO):
      1. INÍCIO DE QUESTÃO: Cada questão começa com o texto "PERGUNTA [N]" (ex: PERGUNTA 1, PERGUNTA 2).
      2. ALTERNATIVAS: Geralmente começam com um círculo (radio button) que pode parecer um "O" ou "o", seguido de uma letra e ponto.
         - Exemplo visual: "O a. x + 1" -> Você deve extrair apenas: "x + 1"
         - Exemplo visual: "b. 2x" -> Você deve extrair apenas: "2x"
         - Exemplo visual: "Oc. Integral de x" -> Você deve extrair apenas: "Integral de x"
      3. MATEMÁTICA: O texto contém fórmulas em LaTeX (ex: $f(x)$). MANTENHA o LaTeX intacto. Não converta para texto plano.

      COISAS PARA IGNORAR (RUÍDO):
      - Cabeçalhos de navegador ("Fazer teste...", datas, "Página x de y").
      - Rodapés com URLs ("https://ava.univesp.br...").
      - Pontuação e botões de sistema ("2,5 pontos", "Salva", "Estado de Conclusão").

      FORMATO DE SAÍDA (JSON Array Obrigatório):
      [
        {
          "statement": "Texto do enunciado completo. Se houver imagem/gráfico, insira a tag [IMAGEM]. Use LaTeX entre $ ou $$.",
          "alternatives": [
            "Texto da alternativa 1 (sem a., b., c.)",
            "Texto da alternativa 2",
            "Texto da alternativa 3",
            "Texto da alternativa 4",
            "Texto da alternativa 5"
          ],
          "correctAlternativeIndex": null, 
          "tags": ["Cálculo I"] 
        }
      ]

      REGRAS DE OURO:
      - Se a questão estiver cortada (começa na imagem mas não termina), extraia o que for possível.
      - Se não houver alternativas visíveis (questão dissertativa ou incompleta), retorne "alternatives": [].
      - NÃO invente alternativas. Extraia exatamente o que está na imagem.
    `;

        let attempt = 0;
        const maxAttempts = 3;

        while (attempt < maxAttempts) {
            try {
                const result = await model.generateContent([
                    prompt,
                    { inlineData: { data: base64Data, mimeType: "image/png" } }
                ]);

                const response = result.response;
                const text = response.text();
                const cleanJson = text.replace(/```json|```/g, '').trim();

                let data;
                try {
                    data = JSON.parse(cleanJson);
                } catch (e) {
                    const match = cleanJson.match(/\[.*\]/s);
                    if (match) data = JSON.parse(match[0]);
                    else {
                        const objMatch = cleanJson.match(/\{.*\}/s);
                        if (objMatch) data = [JSON.parse(objMatch[0])];
                        else throw new Error("Invalid JSON structure");
                    }
                }

                const finalData = Array.isArray(data) ? data : (data.questions || [data]);

                // Integrity Check: Warn if questions have 0 alternatives
                if (finalData.some((q: any) => !q.alternatives || q.alternatives.length === 0)) {
                    console.warn(`[AI Warning] Question with no alternatives detected. Retrying...`);
                    throw new Error("Missing alternatives");
                }

                return { success: true, data: finalData };

            } catch (error: any) {
                attempt++;
                console.warn(`Attempt ${attempt} failed: ${error.message}`);
                const isRateLimit = error.message.includes('429') || error.message.includes('Quota');

                if (attempt === maxAttempts) {
                    if (isRateLimit) return { success: false, error: "RATE_LIMIT_EXCEEDED" };
                    return { success: false, error: "Falha na leitura AI: " + error.message };
                }

                if (isRateLimit) await wait(5000 * attempt);
                else await wait(2000);
            }
        }

        return { success: false, error: "Erro desconhecido." };

    } catch (error: any) {
        console.error("AI Action Error:", error);
        return { success: false, error: error.message };
    }
}