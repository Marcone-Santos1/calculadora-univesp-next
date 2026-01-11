export interface SubjectPerformance {
    subject: string;
    total: number;
    correct: number;
    percentage: number;
    fullMark: number; // Always 100 for radar
}

export function calculateSubjectPerformance(exam: any): SubjectPerformance[] {
    const stats: Record<string, { total: number; correct: number }> = {};

    exam.questions.forEach((mq: any) => {
        const subjectName = mq.question.subject?.name || 'Geral';

        if (!stats[subjectName]) {
            stats[subjectName] = { total: 0, correct: 0 };
        }

        stats[subjectName].total += 1;
        if (mq.isCorrect) {
            stats[subjectName].correct += 1;
        }
    });

    return Object.entries(stats).map(([subject, data]) => ({
        subject,
        total: data.total,
        correct: data.correct,
        percentage: Math.round((data.correct / data.total) * 100),
        fullMark: 100
    })).sort((a, b) => b.percentage - a.percentage);
}
