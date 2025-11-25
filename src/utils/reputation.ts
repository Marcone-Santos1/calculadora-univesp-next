export function getLevel(reputation: number) {
    if (reputation < 10) return { level: 1, title: 'Iniciante', nextLevel: 10 };
    if (reputation < 50) return { level: 2, title: 'Estudante', nextLevel: 50 };
    if (reputation < 100) return { level: 3, title: 'Monitor', nextLevel: 100 };
    if (reputation < 500) return { level: 4, title: 'Veterano', nextLevel: 500 };
    if (reputation < 1000) return { level: 5, title: 'Mestre', nextLevel: 1000 };
    return { level: 6, title: 'Lenda', nextLevel: null };
}
