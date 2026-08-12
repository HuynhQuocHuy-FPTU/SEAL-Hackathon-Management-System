export interface SubmissionResponse {
    submissionId: number,
    teamName: string,
    githubUrl: string,
    fileDTOList: File[];
    status: string;
    createAt: string;
    final?: boolean;
}

export interface File {
    fileName: string;
    fileUrl: string;
}

export interface SubmissionEvaluated {
    submissionId: number;
    totalScore: number;
    submissionStatus: string;
    rank: number;
}

export interface SubmissionEvaluatedDetail {
    evaluationId: number;
    totalScore: number;
    status: string;
    comment: string;
    submissions: SubmissionResponse;
    listEvaluationDetail: EvaluationDetailResponse[];
}

interface EvaluationDetailResponse {
    evaluationDetailId: number;
    criteriaName: string;
    criteriaDescription: string;
    score: number;
    comment: string;
}