
export interface RoundParticipantDetail {
    roundId: number;
    roundName: string;
    categories: CategoryParticipantDTO[];
}

interface CategoryParticipantDTO {
    roundName: string;
    roundIndex: number;
    categoryRoundId: number;
    categoryName: string;
    totalTeams: number;
    participants: ParticipantDetailDTO[];
}

interface ParticipantDetailDTO {
    participantId: number;
    registrationId: number;
    teamID: number;
    teamName: string;
    status: string;
    disqualifyReason: string;
    submissionStatus: string;
    totalScore: number;
    rank: number;
}