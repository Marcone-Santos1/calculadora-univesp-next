export const REPUTATION_EVENTS = {
    // Recurring
    DAILY_LOGIN: {
        points: 5,
        label: 'Login diário',
        description: 'Vistou a plataforma hoje'
    },
    VOTE_CAST: {
        points: 1,
        label: 'Voto realizado',
        description: 'Votou em uma questão ou comentário'
    },
    COMMENT_VOTE_RECEIVED: {
        points: 2,
        label: 'Voto recebido',
        description: 'Seu comentário recebeu um voto'
    },
    COMMENT_VOTE_CAST: {
        points: 1,
        label: 'Voto em comentário',
        description: 'Votou em um comentário'
    },

    // Content Creation
    QUESTION_CREATED: {
        points: 5,
        label: 'Questão criada',
        description: 'Criou uma nova questão'
    },
    COMMENT_CREATED: {
        points: 3,
        label: 'Comentário criado',
        description: 'Comentou em uma questão'
    },
    VOTE_RECEIVED: {
        points: 2,
        label: 'Voto recebido',
        description: 'Sua questão recebeu um voto'
    },
    COMMENT_RECEIVED: {
        points: 2,
        label: 'Comentário recebido',
        description: 'Sua questão recebeu um comentário'
    },

    // Milestones
    ACHIEVEMENT_UNLOCK: {
        points: 50,
        label: 'Conquista desbloqueada',
        description: 'Desbloqueou uma nova conquista'
    },
    PROFILE_COMPLETION: {
        points: 20,
        label: 'Perfil completo',
        description: 'Preencheu todas as informações do perfil'
    }
};

export type ReputationEvent = keyof typeof REPUTATION_EVENTS;
