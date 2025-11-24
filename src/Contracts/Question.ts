export interface Alternative {
    id: string;
    text: string;
    votes: number;
    isCorrect?: boolean; // If confirmed
    percentage?: number; // Calculated field
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
}

export interface Question {
    id: string;
    title: string; // Short description or first few words
    text: string; // Full text, supports markdown/html
    subjectId: string;
    subjectName: string;
    week?: string; // e.g., "Semana 1"
    createdAt: Date;
    userId: string;
    userName: string;
    subject?: {
        name: string;
        color?: string | null;
        icon?: string | null;
    };
    alternatives: Alternative[];
    comments: Comment[];
    isVerified: boolean;
    views: number;
    verificationRequested?: boolean;
}
