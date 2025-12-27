import { PESOS } from "./Constants";
import { GradesProp } from "@/Contracts/GradesProp";
import { HistoryEntryProp } from "@/Contracts/HistoryEntryProp";


export const calcMediaFinal = ({ g1, g2 }: GradesProp) => {
  return ((Number(g1) * PESOS.PROVA) + Number(g2) * PESOS.ATIVIDADES);
}

export const calcMediaFinalExame = ({ g1, g2 }: GradesProp) => {
  return ((Number(g1)) + Number(g2)) / 2;
}

export const simularRegular = ({ g1 }: GradesProp) => {

  const simulationResult: number = (PESOS.MEDIA_FINAL - (g1 * PESOS.ATIVIDADES)) / PESOS.PROVA;

  return Number(simulationResult.toFixed(1));
}

export const simularExame = ({ g1 }: GradesProp) => {
  return 2 * PESOS.MEDIA_FINAL - g1
}

export const loadHistoryFromStorage = (): HistoryEntryProp[] => {
  if (typeof window === 'undefined') return [];
  try {
    const savedHistory = localStorage.getItem('univespCalcHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
};

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper to inject ads at random intervals
export const injectAdsWithRandomInterval = (questions: any[], ads: any[]) => {
    if (!ads || ads.length === 0) return questions.map(q => ({ type: 'question', data: q }));

    const items: { type: 'question' | 'ad', data: any }[] = [];
    let questionsSinceLastAd = 0;
    let nextAdGap = Math.floor(Math.random() * 5) + 1; // Random gap between 1 and 5
    let adIndex = 0;

    questions.forEach((question) => {
        items.push({ type: 'question', data: question });
        questionsSinceLastAd++;

        // Inject ad only if we have waited enough AND we still have unique ads to show
        if (questionsSinceLastAd >= nextAdGap && adIndex < ads.length) {
            items.push({ type: 'ad', data: ads[adIndex] });
            adIndex++;
            questionsSinceLastAd = 0;
            nextAdGap = Math.floor(Math.random() * 5) + 1; // Reset gap
        }
    });

    return items;
};