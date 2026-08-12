export interface EvaluationAuditListResponse {
    evaluationId: number;
    submissionId: number;
    teamId: number;
    teamName: string;
    judgeId: number;
    judgeName: string;
    categoryRoundId: number;
    categoryName: string;
    currentScore: number;
    currentStatus: string;
    totalAttempts: number
}

export interface EvaluationAuditAttemptResponse {
    attemptId: number;
    evaluationId: number;
    eventId: number;
    roundId: number;
    attemptNumber: number;
    criteriaType: string;
    totalScore: number;
    totalComment: string;
    status: string;
    action: string;
    actorName: string;
    createdAt: string;
}

export interface EvaluationDetailAuditResponse {
    detailAuditId: number;
    attemptId: number;
    evaluationDetailId: number;
    criteriaId: number;
    criteriaName: string;
    score: number;
    comment: string;
    criteriaWeight: number;
}