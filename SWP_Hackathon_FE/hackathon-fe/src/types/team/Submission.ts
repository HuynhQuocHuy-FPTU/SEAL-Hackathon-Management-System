import type { EvaluationDetailResponse } from "../judge/Resubmission";
import type { SubmissionResponse } from "../submission/Submission";

export interface Submission {
    submissionId: number;
    teamName: string;
    description: string;
    githubUrl: string;
    createAt: string;
    status: string;
    roundName: string;
    evaluations: Evaluation[];
    file: SubmissionFile[];
    final: boolean;
}

export interface SubmissionFile {
    fileName: string;
    fileSize: number;
    fileType: string;
}

export interface Evaluation {
    evaluationId: number;
    submissionId: number;
    score: number;
    judgeName: string;
    judgeId: number;
    createAt: string;
    updateAt: string;
    roundName: string;
}

export interface EvaluationResponse {
    evaluationId: number;
    totalScore: number;
    status: string;
    comment: string;
    submissions: SubmissionResponse;
    listEvaluationDetail: EvaluationDetailResponse[];
}