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
        icon: '🏛️',
        category: 'CREATION',
        condition: (stats) => stats.questions >= 50
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
        points: 500,
        icon: '🏆',
        category: 'EXPERT',
        condition: (stats) => stats.level >= 10
    }
];

export function getAchievement(id: string) {
    return ACHIEVEMENTS.find(a => a.id === id);
}
