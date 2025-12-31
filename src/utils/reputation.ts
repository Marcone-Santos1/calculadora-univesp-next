export interface Level {
    level: number;
    title: string;
    minReputation: number;
}

export const LEVELS: Level[] = [
    { level: 1, title: 'Iniciante', minReputation: 0 },
    { level: 2, title: 'Aprendiz', minReputation: 20 },
    { level: 3, title: 'Estudante', minReputation: 100 },
    { level: 4, title: 'Colaborador', minReputation: 300 },
    { level: 5, title: 'Monitor', minReputation: 600 },
    { level: 6, title: 'Tutor', minReputation: 1200 },
    { level: 7, title: 'Veterano', minReputation: 2500 },
    { level: 8, title: 'Especialista', minReputation: 5000 },
    { level: 9, title: 'Mestre', minReputation: 10000 },
    { level: 10, title: 'Lenda', minReputation: 20000 },
];

export function getLevel(reputation: number) {
    // Find the highest level where minReputation <= user reputation
    // Since LEVELS is ordered, we can just find the first one that is greater, then go back one,
    // or just reverse find.

    // Simple reverse loop
    let currentLevel = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (reputation >= LEVELS[i].minReputation) {
            currentLevel = LEVELS[i];
            break;
        }
    }

    const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level + 1);
    const nextLevelThreshold = nextLevelIndex !== -1 ? LEVELS[nextLevelIndex].minReputation : null;

    return {
        level: currentLevel.level,
        title: currentLevel.title,
        nextLevel: nextLevelThreshold
    };
}
