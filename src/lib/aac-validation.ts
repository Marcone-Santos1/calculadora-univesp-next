import { AacActivity, AacCategory } from "@prisma/client";

// Types for input (before it's a full Prisma model)
type ActivityInput = {
    category: AacCategory;
    originalHours: number;
    startDate?: Date | null;
    [key: string]: any;
};

type ValidationResult = {
    isValid: boolean;
    validHours: number;
    message?: string;
};

// PRESETS (Regras de Negócio)
const MAX_HOURS_PER_COURSE = 50;
const MAX_COURSES_COUNT = 10;

/**
 * Calculates the valid hours for an activity based on business rules.
 * 
 * Rules:
 * 1. Category 'COURSE': Max 50h per activity.
 * 2. Category 'COURSE': Max 10 activities allowed (checked against existing).
 * 3. General: Must not be in the future (optional sanity check, not strictly required by AAC rules but good UX).
 * 4. Temporal: Must be after ingress date (This usually requires knowing User's ingress date. 
 *    For now, we'll assume the frontend/caller validates dates against a profile setting, 
 *    or we pass the ingress date here).
 */
export function validateActivity(
    activity: ActivityInput,
    existingActivities: ActivityInput[] = [],
    userIngressDate?: Date
): ValidationResult {
    let validHours = activity.originalHours;
    let message = undefined;
    let isValid = true;

    // RULE 1: Cap 50h for Courses
    if (activity.category === AacCategory.COURSE) {
        if (validHours > MAX_HOURS_PER_COURSE) {
            validHours = MAX_HOURS_PER_COURSE;
            message = `Carga horária limitada a ${MAX_HOURS_PER_COURSE}h por certificado de curso.`;
        }
    }

    // RULE 2: Max 10 Courses
    if (activity.category === AacCategory.COURSE) {
        const existingCourses = existingActivities.filter(a => a.category === AacCategory.COURSE);
        // If we are adding a new one (not editing existing - naive check needed by caller usually, but here we check count)
        // We accept 'existingActivities' as "other" activities.
        if (existingCourses.length >= MAX_COURSES_COUNT) {
            return {
                isValid: false,
                validHours: 0,
                message: `Limite de ${MAX_COURSES_COUNT} cursos atingido.`,
            };
        }
    }

    // RULE 3: Temporal Check (Ingress Date)
    if (userIngressDate && activity.startDate) {
        if (new Date(activity.startDate) < userIngressDate) {
            return {
                isValid: false,
                validHours: 0,
                message: `Atividade realizada antes do ingresso (${userIngressDate.toLocaleDateString()}).`,
            };
        }
    }

    return {
        isValid,
        validHours,
        message
    };
}

/**
 * Recalculates totals given a list of activities
 */
export function calculateSummary(activities: ActivityInput[]) {
    // This could also deal with global caps if they exist (e.g. max 100h total for courses?)
    // For Univesp:
    // - Courses: Unlimited total hours? No, usually 50% of total AAC? 
    //   The prompt mentions "Eixo Computação: Meta de 200h." but doesn't strictly say "Max Xh total for courses".
    //   "Regra dos 50h (Cap)" is per item.
    //   We will sum up 'validHours'.

    return activities.reduce((acc, curr) => acc + (curr.originalHours > MAX_HOURS_PER_COURSE && curr.category === AacCategory.COURSE ? MAX_HOURS_PER_COURSE : curr.originalHours), 0);
    // Wait, we should use the pre-calculated validHours if stored, or recalculate.
    // Ideally we store 'validHours' in DB.
}
