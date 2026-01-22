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

// Validate CPF or CNPJ
export const validateTaxId = (taxId: string): boolean => {
  // Remove non-digits
  const cleanId = taxId.replace(/[^\d]+/g, '');

  // Check length (11 for CPF, 14 for CNPJ)
  if (cleanId.length !== 11 && cleanId.length !== 14) return false;

  // Reject common sequences (111.111.111-11, etc)
  if (/^(\d)\1+$/.test(cleanId)) return false;

  // CPF Validation
  if (cleanId.length === 11) {
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanId.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanId.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanId.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanId.substring(10, 11))) return false;

    return true;
  }

  // CNPJ Validation
  if (cleanId.length === 14) {
    let size = cleanId.length - 2;
    let numbers = cleanId.substring(0, size);
    const digits = cleanId.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cleanId.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  }

  return false;
};

export function extractCleanTextFromMarkdown(md: string) {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#>*_`~\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}