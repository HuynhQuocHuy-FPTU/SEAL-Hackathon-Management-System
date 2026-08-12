import type { SubmissionResponse } from "../submission/Submission";

export interface TeamRequestResponse {
    requestId: number;
    teamId: number;
    teamName: string;
    expertId: number;
    createDate: string;
    status: string;
    round: string;
    requestType: string;
    categoryName: string;
    requestMessage: string;
    responseMessage: string;
    responseId: number;
    responseAt: string;
    listEvaluation: EvaluationResponse[];
    acceptedRequests: number;
    rejectedRequests: number;
}

interface EvaluationResponse {
    evaluationId: number;
    totalScore: number;
    status: EvaluationStatus;
    comment: string;
    submissions: SubmissionResponse;
    listEvaluationDetail: EvaluationDetailResponse[];
}


const EvaluationStatus = {
    NOT_GRADED: "NOT_GRADED",
    GRADED: "GRADED",
    RE_EVALUATION: "RE_EVALUATION",
    RE_EVALUATED: "RE_EVALUATED"
} as const; 

type EvaluationStatus = typeof EvaluationStatus[keyof typeof EvaluationStatus];

interface EvaluationDetailResponse {
    evaluationDetailId: number;
    criteriaName: string;
    criteriaDescription: string;
    score: number;
    comment: string;
}

export interface ResponseRequest {
    message: string;
    roundId: number;
}