export interface CriteriaDTO {
  evaluationCriteriaId: number;
  criteriaName: string;
  weight: number;
  description: string;
  type: string;
  maxScore: number;
}

export interface CriteriaResponse {
  success: boolean;
  message: string;
  data: CriteriaDTO[];
}