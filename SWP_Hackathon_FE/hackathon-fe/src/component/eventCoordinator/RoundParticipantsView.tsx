import { useState, useEffect } from 'react';
import { ArrowLeft, Users, AlertCircle, FileCheck, Target, Activity, X, Trophy, Minus, Eye, Send, ArrowUpNarrowWideIcon, Gift, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { RoundParticipantDetail } from '../../types/advancement/RoundParticipant';
import { getCurrentTeamAdvancement, disqualifyTeam, advanceTeam } from '../../services/event/advancementService';
import { getRankingByRoundId, getTopN, publicDraftRanking, releaseFinalRanking, prizeReward, exportToExcel } from '../../services/event/rankTeams';
import { useNotification } from '../../hook/useNotification';
import type { Rank } from '../../types/rank/Rank';

interface RoundParticipantsViewProps {
    eventId: number;
    roundId: number;
    roundName: string;
    onBack: () => void;
}

const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export default function RoundParticipantsView({ eventId, roundId, roundName, onBack }: RoundParticipantsViewProps) {
    const [data, setData] = useState<RoundParticipantDetail | null>(null);
    const [rankData, setRankData] = useState<Rank | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdvancing, setIsAdvancing] = useState(false);
    const [isGettingTopN, setIsGettingTopN] = useState(false);
    const [isPublishingDraft, setIsPublishingDraft] = useState(false);
    const [isReleasingFinal, setIsReleasingFinal] = useState(false);
    const [isPrizeRewarding, setIsPrizeRewarding] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState<string>("FINAL");
    const [activeCategoryRank, setActiveCategoryRank] = useState<number>(0);
    const [activeCategoryParticipant, setActiveCategoryParticipant] = useState<number>(0);
    const { addNotification } = useNotification();

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'confirm' | 'prompt';
        promptPlaceholder?: string;
        promptType?: 'text' | 'number';
        onConfirm: (inputValue?: string) => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'confirm',
        onConfirm: () => { }
    });
    const [modalInputValue, setModalInputValue] = useState('');

    const openConfirmModal = (title: string, message: string, onConfirm: () => void) => {
        setModalConfig({ isOpen: true, title, message, type: 'confirm', onConfirm });
        setModalInputValue('');
    };

    const openPromptModal = (title: string, message: string, onConfirm: (inputValue?: string) => void, promptPlaceholder?: string, promptType: 'text' | 'number' = 'text') => {
        setModalConfig({ isOpen: true, title, message, type: 'prompt', onConfirm, promptPlaceholder, promptType });
        setModalInputValue('');
    };

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    const handleAdvanceRound = () => {
        openConfirmModal("Thăng vòng", "Bạn có chắc chắn muốn thăng vòng cho tất cả các đội đủ điều kiện trong vòng này?", async () => {
            setIsAdvancing(true);
            try {
                await advanceTeam(roundId);
                addNotification("Success", "Thăng vòng thành công!");
                setIsLoading(true);
                const [response, rankResponse] = await Promise.all([
                    getCurrentTeamAdvancement(roundId),
                    getRankingByRoundId(roundId).catch(() => null)
                ]);
                setData(response?.data || response);
                setRankData(rankResponse?.data || rankResponse);
            } catch (error: any) {
                addNotification("Error", error?.response?.data?.message || "Lỗi khi thăng vòng.");
            } finally {
                setIsAdvancing(false);
                setIsLoading(false);
            }
        });
    };

    const handleDisqualify = (teamId: number, teamName: string) => {
        openPromptModal("Loại đội", `Nhập lý do loại đội ${teamName}:`, async (reason) => {
            if (!reason || reason.trim() === '') {
                addNotification("Error", "Vui lòng nhập lý do loại.");
                return;
            }
            try {
                setIsLoading(true);
                await disqualifyTeam(eventId, teamId, reason.trim());
                addNotification("Success", `Đã loại đội ${teamName}`);
                const [response, rankResponse] = await Promise.all([
                    getCurrentTeamAdvancement(roundId),
                    getRankingByRoundId(roundId).catch(() => null)
                ]);
                setData(response?.data || response);
                setRankData(rankResponse?.data || rankResponse);
            } catch (error: any) {
                addNotification("Error", error?.response?.data?.message || "Không thể loại đội này.");
            } finally {
                setIsLoading(false);
            }
        });
    };

    const handleGetTopN = async () => {
        setIsGettingTopN(true);
        try {
            await getTopN(roundId);
            addNotification("Success", `Đã lấy danh sách Top ${rankData?.topN || 'N'}`);
            const rankResponse = await getRankingByRoundId(roundId).catch(() => null);
            setRankData(rankResponse?.data || rankResponse);
        } catch (error: any) {
            addNotification("Error", error?.response?.data?.message || "Không thể lấy danh sách Top N.");
        } finally {
            setIsGettingTopN(false);
        }
    };

    const handlePublishDraft = () => {
        openPromptModal("Công bố bảng xếp hạng nháp", "Nhập số phút khiếu nại (ví dụ: 30):", async (hoursAmountStr) => {
            if (!hoursAmountStr || isNaN(Number(hoursAmountStr))) {
                addNotification("Info", "Vui lòng nhập số phút hợp lệ.");
                return;
            }
            const hoursAmount = Number(hoursAmountStr);
            setIsPublishingDraft(true);
            try {
                await publicDraftRanking(roundId, hoursAmount);
                addNotification("Success", "Đã công bố bảng xếp hạng nháp.");
                const rankResponse = await getRankingByRoundId(roundId).catch(() => null);
                setRankData(rankResponse?.data || rankResponse);
            } catch (error: any) {
                addNotification("Info", error?.response?.data?.message || "Không thể công bố bảng xếp hạng nháp.");
            } finally {
                setIsPublishingDraft(false);
            }
        }, "Nhập số phút...", "number");
    };

    const handleReleaseFinal = () => {
        openConfirmModal("Phát hành bảng xếp hạng", "Bạn có chắc chắn muốn phát hành bảng xếp hạng chính thức (Final)?", async () => {
            setIsReleasingFinal(true);
            try {
                await releaseFinalRanking(roundId);
                addNotification("Success", "Đã phát hành bảng xếp hạng chính thức.");
                const rankResponse = await getRankingByRoundId(roundId).catch(() => null);
                setRankData(rankResponse?.data || rankResponse);
            } catch (error: any) {
                addNotification("Info", error?.response?.data?.message || "Không thể phát hành bảng xếp hạng chính thức.");
            } finally {
                setIsReleasingFinal(false);
            }
        });
    };

    const handlePrizeReward = () => {
        openConfirmModal("Trao giải", "Bạn có chắc chắn muốn phát phần thưởng cho vòng này?", async () => {
            setIsPrizeRewarding(true);
            try {
                await prizeReward(eventId);
                addNotification("Success", "Đã trao giải thành công!");
                const rankResponse = await getRankingByRoundId(roundId).catch(() => null);
                setRankData(rankResponse?.data || rankResponse);
            } catch (error: any) {
                addNotification("Info", error?.response?.data?.message || "Không thể trao giải.");
            } finally {
                setIsPrizeRewarding(false);
            }
        });
    };

    const handleExportToExcel = async (type: string) => {
        try {
            setIsExporting(true);
            const response = await exportToExcel(roundId, type);
            if (response.status && response.data) {
                const link = document.createElement("a");
                link.href = response.data;
                link.target = "_blank";
                link.download = `Ranking_Round_${roundId}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                addNotification("Success", "Xuất file Excel thành công");
            } else {
                addNotification("Info", response.message || "Xuất file thất bại");
            }
        } catch (error: any) {
            addNotification("Info", error.response?.data?.message || "Không thể xuất file Excel");
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        const fetchParticipants = async () => {
            setIsLoading(true);
            try {
                const [response, rankResponse] = await Promise.all([
                    getCurrentTeamAdvancement(roundId),
                    getRankingByRoundId(roundId).catch(() => null)
                ]);
                setData(response?.data || response);
                setRankData(rankResponse?.data || rankResponse);
            } catch (error: any) {
                addNotification("Error", "Không thể tải danh sách đội tham gia");
            } finally {
                setIsLoading(false);
            }
        };
        fetchParticipants();
    }, [roundId, addNotification]);

    return (
        <div className="min-h-screen bg-[#F7F8FC] p-4 sm:p-8 font-sans text-slate-900 rounded-4xl selection:bg-[#F26F21]/30">
            <motion.div
                key="participants-view"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6 max-w-7xl mx-auto pb-10"
            >
                {/* Hero Header Card */}
                <motion.div variants={itemVariants} className="bg-white rounded-[20px] p-8 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100/50">
                    <div className="absolute inset-0 bg-linear-to-br from-orange-50/80 via-white to-violet-50/30 opacity-70"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F26F21]/5 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="relative z-10">
                        <button
                            onClick={onBack}
                            className="mb-6 flex items-center gap-2 text-slate-500 hover:text-[#F26F21] font-bold transition-colors text-xs uppercase tracking-widest px-4 py-2 rounded-full hover:bg-white bg-white/50 border border-slate-200/60 shadow-sm backdrop-blur-sm cursor-pointer w-fit"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Quay lại
                        </button>

                        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-bold text-[#F26F21] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100/50 flex items-center gap-1.5 shadow-sm">
                                        <Users className="w-3 h-3" />
                                        Participant Overview
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                                    Danh sách Đội tham gia
                                </h1>
                                <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
                                    {roundName}
                                </p>
                            </div>
                            <div>
                                <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg p-1">
                                            <select 
                                                value={exportType}
                                                onChange={(e) => setExportType(e.target.value)}
                                                className="bg-transparent text-emerald-700 text-xs font-bold outline-none cursor-pointer pl-2 pr-1"
                                            >
                                                <option value="FINAL">FINAL</option>
                                                <option value="DRAFT">DRAFT</option>
                                            </select>
                                            <div className="w-px h-4 bg-emerald-200 mx-1"></div>
                                            <button
                                                onClick={() => handleExportToExcel(exportType)}
                                                disabled={isExporting}
                                                className="px-2 py-1 bg-transparent text-emerald-600 hover:bg-emerald-100 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isExporting ? (
                                                    <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Download className="w-3.5 h-3.5" />
                                                )}
                                                Export
                                            </button>
                                        </div>
                                        <button
                                            onClick={handlePublishDraft}
                                            disabled={isPublishingDraft || isReleasingFinal || isGettingTopN || isExporting}
                                            className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isPublishingDraft ? (
                                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                            Công bố điểm
                                        </button>
                                        <button
                                            onClick={handleReleaseFinal}
                                            disabled={isReleasingFinal || isPublishingDraft || isGettingTopN}
                                            className="px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isReleasingFinal ? (
                                                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            Phát hành
                                        </button>
                                        {/* <button
                                            onClick={handleGetTopN}
                                            disabled={isGettingTopN || isPrizeRewarding}
                                            className="px-4 py-2 bg-orange-50 text-[#F26F21] border border-orange-200 hover:bg-orange-100 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isGettingTopN ? (
                                                <div className="w-4 h-4 border-2 border-[#F26F21] border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Target className="w-4 h-4" />
                                            )}
                                            Top {rankData?.topN || 'N'}
                                        </button> */}
                                        <button
                                            onClick={handlePrizeReward}
                                            disabled={isPrizeRewarding || isGettingTopN || isPublishingDraft || isReleasingFinal}
                                            className="px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isPrizeRewarding ? (
                                                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Gift className="w-4 h-4" />
                                            )}
                                            Trao Giải
                                        </button>

                                        <div className="w-px h-6 bg-slate-200 mx-1 hidden xl:block"></div>

                                        <button
                                            onClick={handleAdvanceRound}
                                            className="px-4 py-2 bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ArrowUpNarrowWideIcon className="w-4 h-4 animate-pulse" />
                                            Thăng vòng
                                        </button>
                                    </div>
                                    {data && (
                                        <div className="flex flex-col sm:flex-row items-end sm:items-center shrink-0">
                                            <div className="bg-white/60 backdrop-blur-md p-3.5 rounded-xl border border-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3 shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 text-orange-500 shadow-sm">
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tổng số đội</p>
                                                    <p className="text-lg leading-none font-black text-slate-800">
                                                        {data.categories?.reduce((acc, cat) => acc + cat.totalTeams, 0) || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col gap-8">
                    {/* Bottom Row for Participants List */}
                    <div className="w-full">
                        {isLoading ? (
                            <motion.div variants={itemVariants} className="flex justify-center items-center py-20 bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60">
                                <div className="animate-spin w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full"></div>
                            </motion.div>
                        ) : data?.categories?.length ? (
                            <motion.div variants={itemVariants} className="bg-white rounded-[20px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60 flex flex-col">
                                <div className="space-y-4">
                                    {/* Tabs */}
                                    <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-100 pb-4">
                                        {data.categories.map((cat, index) => (
                                            <button
                                                key={cat.categoryRoundId}
                                                onClick={() => setActiveCategoryParticipant(index)}
                                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer ${activeCategoryParticipant === index
                                                    ? 'bg-orange-50 text-[#F26F21]'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {cat.categoryName}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Table */}
                                    {data.categories[activeCategoryParticipant] && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse min-w-full table-fixed">
                                                <thead>
                                                    <tr className="border-b border-slate-200">
                                                        <th className="pb-3 text-left w-1/4 text-xs font-bold text-slate-400 uppercase tracking-wider">Team</th>
                                                        <th className="pb-3 text-left w-1/4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                                        <th className="pb-3 text-center w-1/4 text-xs font-bold text-slate-400 uppercase tracking-wider">Submission</th>
                                                        <th className="pb-3 text-right w-[15%] text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                                                        <th className="pb-3 text-right w-[10%] text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {data.categories[activeCategoryParticipant].participants.map(p => (
                                                        <tr key={p.participantId} className="group hover:bg-slate-50 transition-colors">
                                                            <td className="py-4 text-left">
                                                                <span className="text-sm font-bold text-slate-800">{p.teamName}</span>
                                                            </td>
                                                            <td className="py-4 text-left">
                                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${p.status === 'ADVANCED' ? 'bg-emerald-50 text-emerald-600' :
                                                                    p.status === 'ELIMINATED' ? 'bg-rose-50 text-rose-600' :
                                                                        'bg-slate-50 text-slate-500'
                                                                    }`}>
                                                                    {p.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 text-center">
                                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border inline-flex items-center justify-center gap-1.5 ${p.submissionStatus === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-100/50' : 'bg-amber-50 text-amber-700 border-amber-100/50'
                                                                    }`}>
                                                                    <FileCheck className="w-3 h-3" />
                                                                    {p.submissionStatus === 'SUBMITTED' ? 'Đã nộp bài' : 'Chưa nộp'}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 text-right pr-4">
                                                                <span className="text-sm font-black text-[#F26F21]">{p.totalScore > 0 ? p.totalScore : '-'}</span>
                                                            </td>
                                                            <td className="py-4 text-right">
                                                                {p.status !== 'ELIMINATED' ? (
                                                                    <button
                                                                        onClick={() => handleDisqualify(p.teamID, p.teamName)}
                                                                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                                                                    >
                                                                        <X className="w-3 h-3" /> Loại
                                                                    </button>
                                                                ) : p.disqualifyReason ? (
                                                                    <div className="relative group/tooltip inline-flex items-center justify-end">
                                                                        <AlertCircle className="w-4 h-4 text-rose-500 cursor-help" />
                                                                        <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block w-48 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg z-10 text-left">
                                                                            <span className="font-bold text-rose-300 block mb-1">Lý do loại:</span>
                                                                            {p.disqualifyReason}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-300">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-24 bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60">
                                <Users className="w-16 h-16 text-slate-200 mb-4" />
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Không có dữ liệu đội tham gia ở vòng này.</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Top Row for Ranking */}
                    <div className="w-full">
                        {rankData?.categoriesRanking?.length ? (
                            <motion.div variants={itemVariants} className="bg-white rounded-[20px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-amber-500" />
                                        Bảng xếp hạng
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Tabs */}
                                    <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-100 pb-4">
                                        {rankData.categoriesRanking.map((cat, index) => (
                                            <button
                                                key={cat.categoryId}
                                                onClick={() => setActiveCategoryRank(index)}
                                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer ${activeCategoryRank === index
                                                    ? 'bg-orange-50 text-[#F26F21]'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {cat.categoryName}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Table */}
                                    {rankData.categoriesRanking[activeCategoryRank] && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse min-w-full table-fixed">
                                                <thead>
                                                    <tr className="border-b border-slate-200">
                                                        <th className="pb-3 text-left w-1/5 text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</th>
                                                        <th className="pb-3 text-left w-2/5 text-xs font-bold text-slate-400 uppercase tracking-wider">Team</th>
                                                        <th className="pb-3 text-right w-1/5 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                                                        <th className="pb-3 text-right w-1/5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {rankData.categoriesRanking[activeCategoryRank].teams.map(team => (
                                                        <tr key={team.participantId} className="group hover:bg-slate-50 transition-colors">
                                                            <td className="py-3 text-left">
                                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${team.rank === '1' ? 'bg-amber-100 text-amber-700' :
                                                                    team.rank === '2' ? 'bg-slate-200 text-slate-700' :
                                                                        team.rank === '3' ? 'bg-orange-100 text-orange-700' :
                                                                            'text-slate-500 bg-white border border-slate-200'
                                                                    }`}>
                                                                    {team.rank == null ? <Minus /> : team.rank}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 text-left">
                                                                <span className="text-sm font-bold  text-slate-800">{team.teamName}</span>
                                                            </td>
                                                            <td className="py-3 text-right pl-42">
                                                                <span className="text-sm  font-black text-[#F26F21]">{team.totalScore == null ? <Minus /> : team.totalScore}</span>
                                                            </td>
                                                            <td className="py-3 text-right">
                                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${team.status === 'PASSED' ? 'bg-emerald-50 text-emerald-600' :
                                                                    team.status === 'FAILED' ? 'bg-rose-50 text-rose-600' :
                                                                        'bg-slate-50 text-slate-500'
                                                                    }`}>
                                                                    {team.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div variants={itemVariants} className="bg-white rounded-[20px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60">
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <Trophy className="w-12 h-12 text-slate-200 mb-4" />
                                    <p className="text-base font-bold text-slate-500">Chưa có bảng xếp hạng</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {modalConfig.isOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                            >
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{modalConfig.title}</h3>
                                    <p className="text-sm text-slate-500 mb-6">{modalConfig.message}</p>

                                    {modalConfig.type === 'prompt' && (
                                        <div className="mb-6">
                                            {modalConfig.promptType === 'number' ? (
                                                <input
                                                    type="number"
                                                    autoFocus
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                                    placeholder={modalConfig.promptPlaceholder || "Nhập giá trị..."}
                                                    value={modalInputValue}
                                                    onChange={(e) => setModalInputValue(e.target.value)}
                                                />
                                            ) : (
                                                <textarea
                                                    autoFocus
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                                                    rows={3}
                                                    placeholder={modalConfig.promptPlaceholder || "Nhập lý do..."}
                                                    value={modalInputValue}
                                                    onChange={(e) => setModalInputValue(e.target.value)}
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={closeModal}
                                            className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={() => {
                                                modalConfig.onConfirm(modalConfig.type === 'prompt' ? modalInputValue : undefined);
                                                closeModal();
                                            }}
                                            className="px-5 py-2 text-sm font-bold text-white bg-[#F26F21] hover:brightness-110 rounded-xl transition-colors shadow-sm cursor-pointer"
                                        >
                                            Xác nhận
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
}
