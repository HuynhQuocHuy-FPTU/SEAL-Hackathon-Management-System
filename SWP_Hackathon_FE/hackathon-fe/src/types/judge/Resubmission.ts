import type { File, SubmissionResponse } from "../submission/Submission";

export interface RequestReviewSubmission {
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
    listEvaluation: ReevaluationResponse[];
    acceptedRequests: number;
    rejectedRequests: number;
}

export interface ReevaluationResponse {
    evaluationId: number;
    totalScore: number;
    status: string;
    comment: string;
    submissions: SubmissionResponse;
    listEvaluationDetail: EvaluationDetailResponse[];
}

export interface EvaluationDetailResponse {
    evaluationDetailId: number;
    criteriaName: string;
    criteriaDescription: string;
    score: number;
    comment: string;
    weight: number;
    criteriaType: string;
}

export interface ReEvaluationResponse {
    gradingDeadline: string;
    gradingOpen: boolean;
    submissions: Submissions[];
}

interface Submissions {
    description: string;
    files: File[];
    githubUrl: string;
    myEvaluationStatus: string;
    myTotalScore: number;
    submissionId: number;
    submittedAt: string;
    teamName: string;
}