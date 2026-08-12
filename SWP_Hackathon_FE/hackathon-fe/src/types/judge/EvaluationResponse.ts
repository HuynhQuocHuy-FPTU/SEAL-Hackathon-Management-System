export interface EvaluationDetailResponse {
    evaluationId: number;
    submissionId: number;
    teamName: string;
    totalScore: number;
    comment: string;
    status: string;
    isEditable: boolean;
    gradingDeadline: string;
    averageOtherTotalScore: number;
    totalDeviation: number;
    totalDeviationPercentage: number;
    hasTotalDeviationWarning: boolean;
    deviationWarningMessage: string;
    criteriaScores: CriteriaScoreResponse[];

}

interface CriteriaScoreResponse {
    evaluationCriteriaId: number;
    criteriaName: string;
    type: string;
    weight: number;
    score: number;
    comment: string;
    otherJudgesScores: OtherJudgeScoreDetailDTO[];
    averageOtherScore: number;
    criteriaDeviation: number;
    criteriaDeviationPercentage: number;
    hasCriteriaDeviationWarning: boolean;
}

interface OtherJudgeScoreDetailDTO {
    expertId: number;
    expertName: string;
    score: number;
    comment: string;
}