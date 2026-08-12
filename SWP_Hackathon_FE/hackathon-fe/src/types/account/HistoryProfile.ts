import type { Round } from "../hackathonEvent/Hackathon";

export interface HistoryProfile {
    studentName: string;
    universityName: string;
    creatAt: string;
    list: StudentHistory[];
}

interface StudentHistory {
    teamName: string;
    eventId: number;
    eventName: string;
    status: string;
    registrationDate: string;
    leader: boolean;
    ranking: number;
    listRounds: RoundStatusDTO[];
    reward: string;
}

interface RoundStatusDTO {
    roundId: number;
    categoryRound: number;
    categoryName: string;
    roundName: string;
    submissionType: string;
    status: string;
    roundStatus: string;
    submissionDeadline: string;
    startTime: string;
    endTime: string;
    evaluetionCriteria: EvaluationCriteria[];
}

interface EvaluationCriteria {
    evaluationCriteriaId: number;
    criteriaName: string;
    weight: number;
    description: string;
    type: string;
    evaluationDetails: EvaluationDetail[];
    round: Round;
}

interface EvaluationDetail {
    evaluationDetailId: number;
    score: number;
    comment: string;
    originalScore: number;
}