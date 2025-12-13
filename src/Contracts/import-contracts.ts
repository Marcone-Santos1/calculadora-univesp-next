export type ImportedQuestion = {
    statement: string; // Markdown with LaTeX, Code Blocks
    alternatives: string[]; // List of alternatives
    correctAlternativeIndex?: number; // Optional
    tags: string[]; // e.g. ["Derivada", "Code"]
    explanation?: string;
    hasImage?: boolean;
    imageDescription?: string;
}

export type ProcessPdfState = {
    success: boolean;
    message?: string;
    data?: ImportedQuestion[];
    errors?: string[];
}
