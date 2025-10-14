import {PESOS} from "./Constants";
import {GradesProp} from "@/Contracts/GradesProp";
import {HistoryEntryProp} from "@/Contracts/HistoryEntryProp";


export const calcMediaFinal = ({g1, g2}: GradesProp) => {
    return ((Number(g1) * PESOS.PROVA) + Number(g2) * PESOS.ATIVIDADES);
}

export const calcMediaFinalExame = ({g1, g2}: GradesProp) => {
    return ((Number(g1)) + Number(g2)) / 2;
}

export const simularRegular = ({g1}: GradesProp) => {

    const simulationResult: number = (PESOS.MEDIA_FINAL - (g1 * PESOS.ATIVIDADES)) / PESOS.PROVA;

    return Number(simulationResult.toFixed(1));
}

export const simularExame = ({g1}: GradesProp) => {
    return 2 * PESOS.MEDIA_FINAL - g1
}

export const loadHistoryFromStorage = (): HistoryEntryProp[] => {
  try {
    const savedHistory = localStorage.getItem('univespCalcHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
};