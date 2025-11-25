'use client';

import { useEffect } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface QuestionViewTrackerProps {
    questionId: string;
}

export function QuestionViewTracker({ questionId }: QuestionViewTrackerProps) {
    const { addRecentQuestion, markAsRead } = useUserPreferences();

    useEffect(() => {
        // Add to recent questions
        addRecentQuestion(questionId);

        // Mark as read
        markAsRead(questionId);
    }, [questionId, addRecentQuestion, markAsRead]);

    return null; // This component doesn't render anything
}
