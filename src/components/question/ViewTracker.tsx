'use client';

import { useEffect } from 'react';
import { incrementQuestionViews } from '@/actions/views-actions';

interface ViewTrackerProps {
    questionId: string;
}

export function ViewTracker({ questionId }: ViewTrackerProps) {
    useEffect(() => {
        // Increment views when component mounts
        incrementQuestionViews(questionId);
    }, [questionId]);

    return null; // This component doesn't render anything
}
