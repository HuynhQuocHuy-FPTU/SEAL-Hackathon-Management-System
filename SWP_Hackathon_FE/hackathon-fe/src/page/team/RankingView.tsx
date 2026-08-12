import { useEffect, useState } from 'react';
import { Trophy, Medal, Target } from 'lucide-react';
import { getCurrentRound } from '../../services/team/teamsService';
import { getAllRanking } from '../../services/event/rankTeams';

interface TeamRank {
    participantId: number;
    totalScore: number | null;
    rank: number | null;
    teamName: string;
    status: string | null;
}

interface CategoryRanking {
    categoryId: number;
    categoryName: string;
    categoryRoundId: number;
    teams: TeamRank[];
}

interface RankingResponse {
    roundId: number;
    roundName: string;
    orderIndex: number;
    advancementRule: string;
    topN: number;
    roundStatus: string;
    categoriesRanking: CategoryRanking[];
}

export default function RankingView() {
    const [rankingData, setRankingData] = useState<RankingResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const roundRes = await getCurrentRound();
                const activeRound = roundRes.data?.rounds?.find((r: any) => r.roundStatus !== 'COMPLETED') || roundRes.data?.rounds?.[roundRes.data?.rounds.length - 1];
                if (activeRound?.roundId) {
                    const rankRes = await getAllRanking(activeRound.roundId);
                    setRankingData(rankRes.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRanking();
    }, []);

    if (isLoading) {
        return <div className="animate-pulse space-y-6">Đang tải bảng xếp hạng...</div>;
    }

    if (!rankingData || !rankingData.categoriesRanking) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Trophy className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-600">Chưa có dữ liệu xếp hạng</h2>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="bg-white rounded-[20px] p-8 shadow-sm border border-slate-100/60 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Trophy className="w-7 h-7 text-orange-500" />
                        Bảng xếp hạng - {rankingData.roundName}
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-slate-500 font-medium">Trạng thái:</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-sm ${rankingData.roundStatus === 'ONGOING' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            rankingData.roundStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                rankingData.roundStatus === 'FINAL_RESULT' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                    rankingData.roundStatus === 'UPCOMING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                        'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                            {rankingData.roundStatus}
                        </span>
                    </div>
                </div>
            </div>

            {/* Categories */}
            {rankingData.roundStatus === 'FINAL_RESULT' ? (
                rankingData.categoriesRanking.map(category => (
                    <div key={category.categoryId} className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Target className="w-5 h-5 text-orange-500" />
                                Bảng thi: {category.categoryName}
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-4 px-6 font-semibold">Hạng</th>
                                        <th className="py-4 px-6 font-semibold">Tên đội</th>
                                        <th className="py-4 px-6 font-semibold text-right">Tổng điểm</th>
                                        <th className="py-4 px-6 font-semibold text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {category.teams.map((team, idx) => (
                                        <tr key={team.participantId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    {team.rank === 1 && <Medal className="w-5 h-5 text-yellow-500" />}
                                                    {team.rank === 2 && <Medal className="w-5 h-5 text-slate-400" />}
                                                    {team.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                                                    <span className={`font-bold ${team.rank ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                                        {team.rank || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-semibold text-slate-900">{team.teamName}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`font-bold ${team.totalScore !== null ? 'text-[#F26F21]' : 'text-slate-400 font-normal italic'}`}>
                                                    {team.totalScore !== null ? team.totalScore : 'Đang thi'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${team.status === 'PASSED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm' :
                                                    team.status === 'ELIMINATED' ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm' :
                                                        team.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200 shadow-sm' :
                                                            'bg-orange-50 text-[#F26F21] border border-orange-200 shadow-sm'
                                                    }`}>
                                                    {team.status || 'Đang thi'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {category.teams.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                                                Chưa có đội nào trong bảng này
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-4 text-center text-slate-500">
                    Đang cập nhật bảng xếp hạng...
                </div>
            )}
        </div>
    );
}
