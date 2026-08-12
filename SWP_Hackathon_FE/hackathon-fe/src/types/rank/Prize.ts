export interface PrizeExtension {
    teamParticipantId: number;
    prizeReward: string;
    prizeTitle: string;
}

export interface Prize {
    eventId: number;
    eventName: string;
    prizeReward: string;
    prizeTitle: string;
    ranking: number;
    roundId: number;
    roundName: string;
    teamName: string;
    teamParticipantId: number
}