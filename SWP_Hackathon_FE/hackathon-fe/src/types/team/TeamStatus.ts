export interface CurrentTeamStatus {
    categoryId: number;
    categoryName: string;
    eventID: number;
    eventName: string;
    rounds: RoundCurrent[];
    teamName: string;
}

export interface RoundCurrent {
    roundId: number;
    categoryRound: number;
    roundName: string;
    status: string;
    roundStatus: string;
    SubmissionDeadline: string;
    submissionType: string;
    StartTime: string;
    EndTime: string;
    evaluetionCriteria: EvaluetionCriteria[];
}

interface EvaluetionCriteria {
    evaluationCriteriaId: number,
    criteriaName: string,
    weight: number,
    description: string,
    type: string
}