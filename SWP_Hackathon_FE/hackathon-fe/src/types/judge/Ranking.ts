export interface TeamResult {
  participantId: number;
  teamName: string;
  totalScore: number;
  rank: number;
  status: string;
}

export interface CategoryRanking {
  categoryRoundId: number;
  categoryId: number;
  categoryName: string;
  teams: TeamResult[];
}

export interface RankingData {
  roundId: number;
  roundName: string;
  orderIndex: number;
  advancementRule: string;
  topN: number;
  roundStatus: string;
  categoriesRanking: CategoryRanking[];
  teamsResult: TeamResult[];
  draftExcelUrl: string;
  errors: string;
}

export interface RankingResponse {
  status: boolean;
  message: string;
  data: RankingData;
}
