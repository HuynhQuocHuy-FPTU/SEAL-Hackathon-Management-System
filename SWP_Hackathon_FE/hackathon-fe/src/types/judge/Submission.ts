
export interface FileDTO {
  fileName: string;
  fileUrl: string;
}

export interface GradingSubmissionData {
  submissionId: number;
  teamName: string;
  description: string;
  githubUrl: string;
  files?: FileDTO[];
  submittedAt: string;
  myEvaluationStatus: string;
  myTotalScore: number;
  hasTotalDeviationWarning?: boolean;
  totalDeviation?: number;
  totalDeviationPercentage?: number;
}

export interface SubmissionResponse {
  gradingDeadline: string;
  gradingOpen: boolean;
  submissions: GradingSubmissionData[];
}

export interface CategoryRoundDTO {
  id: number;
  name: string;
}

export interface CategoryRoundResponse {
  success?: boolean;
  status?: boolean;
  message: string;
  data: CategoryRoundDTO[];
  errors: string;
}

export interface EventDTO {
  id?: number;
  name?: string;
  eventId?: number;
  eventName?: string;
  eventID?: number;
}

export interface EventResponse {
  success?: boolean;
  status?: boolean;
  message: string;
  data: EventDTO[];
  errors: string;
}

export interface RoundDTO {
  id?: number;
  name?: string;
  roundId?: number;
  roundName?: string;
  roundID?: number;
}

export interface RoundResponse {
  success?: boolean;
  status?: boolean;
  message: string;
  data: RoundDTO[];
  errors: string;
}

export interface CriteriaScoreRequest {
  evaluationCriteriaId: number;
  score: number;
  comment: string;
}

export interface EvaluationRequest {
  requestId?: number;
  comment: string;
  criteriaScores: CriteriaScoreRequest[];
}

export interface CriteriaScoreResponse {
  evaluationCriteriaId: number;
  criteriaName: string;
  type: string;
  weight: number;
  score: number;
  comment: string;
}

export interface EvaluationData {
  evaluationId: number;
  submissionId: number;
  teamName: string;
  totalScore: number;
  comment: string;
  status: string;
  gradingDeadline: string;
  criteriaScores: CriteriaScoreResponse[];
  editable: boolean;
}

export interface EvaluationResponse {
  success: boolean;
  message: string;
  data: EvaluationData;
}
