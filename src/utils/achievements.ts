import { REPUTATION_EVENTS } from './reputation-events';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    points: number;
    icon: string;
    category: 'INTRO' | 'STREAK' | 'CREATION' | 'SOCIAL' | 'QUALITY' | 'EXPERT';
    condition: (stats: {
        questions: number;
        comments: number;
        votes: number;
        receivedVotes: number;
        commentVotes: number;
        receivedCommentVotes: number;
        streak: number;
        level: number;
        isProfileComplete: boolean;
        unlockedAchievementsCount: number;
        mockExamsCompleted: number;
        mockExamPerfectScores: number;
        mockExamMarathons: number;
    }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    // INTRO
    {
        id: 'FIRST_STEPS',
        title: 'Primeiros Passos',
        description: 'Complete seu perfil e faça login.',
        points: 20,
        icon: '👣',
        category: 'INTRO',
        condition: (stats) => stats.isProfileComplete
    },

    // STREAK
    {
        id: 'STREAK_7',
        title: 'Dedicado',
        description: 'Logou por 7 dias seguidos.',
        points: 50,
        icon: '🔥',
        category: 'STREAK',
        condition: (stats) => stats.streak >= 7
    },
    {
        id: 'STREAK_30',
        title: 'Imparável',
        description: 'Logou por 30 dias seguidos.',
        points: 200,
        icon: '🚀',
        category: 'STREAK',
        condition: (stats) => stats.streak >= 30
    },
    {
        id: 'STREAK_60',
        title: 'Besta Dedicada',
        description: 'Logou por 60 dias seguidos.',
        points: 500,
        icon: '🚀',
        category: 'STREAK',
        condition: (stats) => stats.streak >= 60
    },
    {
        id: 'STREAK_100',
        title: 'Besta Imparável',
        description: 'Logou por 100 dias seguidos.',
        points: 1000,
        icon: '🚀',
        category: 'STREAK',
        condition: (stats) => stats.streak >= 100
    },
    {
        id: 'HALF_YEAR',
        title: 'Meio Ano Firme',
        description: 'Logou por 180 dias seguidos.',
        points: 2500,
        icon: '🗓️',
        category: 'STREAK',
        condition: (stats) => stats.streak >= 180
    },
    {
        id: 'YEAR',
        title: 'Ano Firme',
        description: 'Logou por 365 dias seguidos.',
        points: 5000,
        icon: '🗓️',
        category: 'STREAK',
        condition: (stats) => stats.streak >= 365
    },

    // CREATION
    {
        id: 'AUTHOR_I',
        title: 'Escritor Iniciante',
        description: 'Criou sua primeira questão.',
        points: 10,
        icon: '✏️',
        category: 'CREATION',
        condition: (stats) => stats.questions >= 1
    },
    {
        id: 'AUTHOR_V',
        title: 'Conteudista',
        description: 'Criou 10 questões.',
        points: 50,
        icon: '📚',
        category: 'CREATION',
        condition: (stats) => stats.questions >= 10
    },
    {
        id: 'AUTHOR_X',
        title: 'Enciclopédia',
        description: 'Criou 50 questões.',
        points: 200,
        icon: '📚',
        category: 'CREATION',
        condition: (stats) => stats.questions >= 50
    },
    {
        id: 'QUALITY_CREATOR',
        title: 'Criador de Elite',
        description: 'Tem uma média de 5 votos por questão criada (Total Votos / Total Questões).',
        points: 300,
        icon: '⭐',
        category: 'CREATION',
        condition: (stats) => stats.questions > 10 && (stats.receivedVotes / stats.questions) >= 5
    },
    {
        id: 'AUTHOR_100',
        title: 'O Escritor',
        description: 'Criou 100 questões.',
        points: 1000,
        icon: '🏛️',
        category: 'CREATION',
        condition: (stats) => stats.questions >= 100
    },

    // SOCIAL
    {
        id: 'VOTER_I',
        title: 'Participativo',
        description: 'Votou 10 vezes em questões ou comentários.',
        points: 10,
        icon: '🗳️',
        category: 'SOCIAL',
        condition: (stats) => stats.votes + stats.commentVotes >= 10
    },
    {
        id: 'VOTER_V',
        title: 'Democrata',
        description: 'Votou 100 vezes.',
        points: 50,
        icon: '🤝',
        category: 'SOCIAL',
        condition: (stats) => stats.votes + stats.commentVotes >= 100
    },
    {
        id: 'INFLUENCER_I',
        title: 'Notado',
        description: 'Recebeu 10 votos em suas contribuições.',
        points: 20,
        icon: '🌟',
        category: 'SOCIAL',
        condition: (stats) => stats.receivedVotes + stats.receivedCommentVotes >= 10
    },
    {
        id: 'INFLUENCER_V',
        title: 'Famoso',
        description: 'Recebeu 100 votos em suas contribuições.',
        points: 100,
        icon: '👑',
        category: 'SOCIAL',
        condition: (stats) => stats.receivedVotes + stats.receivedCommentVotes >= 100
    },
    {
        id: 'HELPER_I',
        title: 'Monitor',
        description: 'Fez 5 comentários em questões.',
        points: 25,
        icon: '💬',
        category: 'SOCIAL',
        condition: (stats) => stats.comments >= 5
    },
    {
        id: 'HELPER_V',
        title: 'Professor',
        description: 'Fez 50 comentários em questões.',
        points: 250,
        icon: '👨‍🏫',
        category: 'SOCIAL',
        condition: (stats) => stats.comments >= 50
    },
    {
        id: 'DEBATER',
        title: 'Debatedor',
        description: 'Participou ativamente (Comentou + Votou em comentários) 20 vezes.',
        points: 50,
        icon: '🗣️',
        category: 'SOCIAL',
        condition: (stats) => (stats.comments + stats.commentVotes) >= 20
    },

    // QUALITY
    {
        id: 'CRITIC_I',
        title: 'Crítico',
        description: 'Curtiu 10 comentários.',
        points: 10,
        icon: '❤️',
        category: 'QUALITY',
        condition: (stats) => stats.commentVotes >= 10
    },
    {
        id: 'LOVED_I',
        title: 'Amado',
        description: 'Recebeu 10 curtidas em comentários.',
        points: 20,
        icon: '💖',
        category: 'QUALITY',
        condition: (stats) => stats.receivedCommentVotes >= 10
    },

    // EXPERT
    {
        id: 'LEVEL_5',
        title: 'Veterano',
        description: 'Alcançou o Nível 5.',
        points: 100,
        icon: '🎖️',
        category: 'EXPERT',
        condition: (stats) => stats.level >= 5
    },
    {
        id: 'LEVEL_10',
        title: 'Lenda Viva',
        description: 'Alcançou o Nível 10.',
        points: 5000,
        icon: '🏆',
        category: 'EXPERT',
        condition: (stats) => stats.level >= 10
    },
    {
        id: 'PLATINUM',
        title: 'Zerou a Vida',
        description: 'Desbloqueou todas as conquistas disponíveis.',
        points: 10000,
        icon: '💎',
        category: 'EXPERT',
        // Verifica se o usuário tem todas as conquistas menos 1 (a própria Platina)
        condition: (stats) => stats.unlockedAchievementsCount >= (ACHIEVEMENTS.length - 1)
    },

    // SIMULADO
    {
        id: 'FIRST_MOCK',
        title: 'Primeiro Simulado',
        description: 'Concluiu seu primeiro simulado.',
        points: 50,
        icon: '📝',
        category: 'CREATION', // Or create a new category 'STUDY'
        condition: (stats) => stats.mockExamsCompleted >= 1
    },
    {
        id: 'SNIPER',
        title: 'Sniper',
        description: 'Acertou 100% das questões em um simulado (mín. 5 questões).',
        points: 500,
        icon: '🎯',
        category: 'EXPERT',
        condition: (stats) => stats.mockExamPerfectScores >= 1
    },
    {
        id: 'MARATHON_RUNNER',
        title: 'Maratonista',
        description: 'Concluiu um simulado com 50 ou mais questões.',
        points: 300,
        icon: '🏃',
        category: 'EXPERT',
        condition: (stats) => stats.mockExamMarathons >= 1
    }
];

export function getAchievement(id: string) {
    return ACHIEVEMENTS.find(a => a.id === id);
}
