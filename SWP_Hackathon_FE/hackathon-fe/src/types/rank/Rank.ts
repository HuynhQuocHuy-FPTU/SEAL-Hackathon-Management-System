export interface Rank {
    roundId: number
    roundName: string,
    orderIndex: number,
    advancementRule: string,
    topN: number,
    roundStatus: string,
    categoriesRanking: CategoriesRanking[],
    teamsResult: string,
    draftExcelUrl: string
}

interface CategoriesRanking {
    categoryId: number,
    categoryName: string,
    categoryRoundId: number,
    teams: TeamRank[]
}

interface TeamRank {
    participantId: number,
    totalScore: number,
    rank: string,
    teamName: string,
    status: string
}