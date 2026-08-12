export interface Hackathon {
    eventId: number;
    eventName: string;
    season: string;
    roundId: number;
    categoryId: number;
    roundName: string;
    categoryName: string;
    expertRole: string;
}

export interface CategoryRound {
    roundId: number;
    roundName: string;
    roundDate: Date;
    roundEnd: Date;
    expertRole: string;
    categoryRoundId: number;
    categoryId: number;
    categoryName: string;
    role: string;
}