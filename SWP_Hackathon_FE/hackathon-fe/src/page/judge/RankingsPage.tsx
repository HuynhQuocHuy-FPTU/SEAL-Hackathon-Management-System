/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Sparkles, AlertCircle, Info, Loader2, Lock, Download } from 'lucide-react';
import type { RankingData, TeamResult } from '../../types/judge/Ranking';
import type { EventDTO, RoundDTO } from '../../types/judge/Submission';
import { getRoundRanking, getAssignedEvents, getAssignedRounds } from '../../services/judge/judgeService';
import { useAuthContext } from '../../hook/useAuthContext';

export default function RankingsView() {
    const { user } = useAuthContext();
    const role = user?.role || '';
    const isGuestJudge = role === 'GUEST_JUDGE';

    const [events, setEvents] = useState<EventDTO[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [rounds, setRounds] = useState<RoundDTO[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

    const [rankingData, setRankingData] = useState<RankingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const eventRes = await getAssignedEvents();
                if ((eventRes.status || eventRes.success) && eventRes.data && eventRes.data.length > 0) {
                    setEvents(eventRes.data);
                    const firstEventId = eventRes.data[0].id ?? eventRes.data[0].eventId ?? eventRes.data[0].eventID;
                    if (firstEventId === undefined) throw new Error(`Event ID is missing. Keys found: ${Object.keys(eventRes.data[0]).join(', ')}`);
                    setSelectedEventId(firstEventId);
                    
                    const roundRes = await getAssignedRounds(firstEventId);
                    if ((roundRes.status || roundRes.success) && roundRes.data && roundRes.data.length > 0) {
                        setRounds(roundRes.data);
                        const firstRoundId = roundRes.data[0].id ?? roundRes.data[0].roundId ?? roundRes.data[0].roundID;
                        if (firstRoundId === undefined) throw new Error(`Round ID is missing. Keys found: ${Object.keys(roundRes.data[0]).join(', ')}`);
                        setSelectedRoundId(firstRoundId);
                        
                        const rankRes = await getRoundRanking(firstRoundId);
                        if (rankRes.status) {
                            setRankingData(rankRes.data);
                        } else {
                            setError(rankRes.message || 'Failed to fetch rankings');
                        }
                    } else {
                        setError('No assigned rounds found.');
                    }
                } else {
                    setError('No assigned events found.');
                }
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || err.message || 'Failed to load data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleEventChange = async (eventId: number) => {
        setSelectedEventId(eventId);
        setRounds([]); setSelectedRoundId(null);
        setRankingData(null);
        try {
            setIsLoading(true);
            const roundRes = await getAssignedRounds(eventId);
            if ((roundRes.status || roundRes.success) && roundRes.data && roundRes.data.length > 0) {
                setRounds(roundRes.data);
                const firstRoundId = roundRes.data[0].id ?? roundRes.data[0].roundId;
                if (firstRoundId !== undefined) {
                    setSelectedRoundId(firstRoundId);
                    
                    const rankRes = await getRoundRanking(firstRoundId);
                    if (rankRes.status) {
                        setRankingData(rankRes.data);
                    } else {
                        setError(rankRes.message || 'Failed to fetch rankings');
                    }
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch rounds.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoundChange = async (roundId: number) => {
        setSelectedRoundId(roundId);
        setRankingData(null);
        try {
            setIsLoading(true);
            const rankRes = await getRoundRanking(roundId);
            if (rankRes.status) {
                setRankingData(rankRes.data);
            } else {
                setError(rankRes.message || 'Failed to fetch rankings');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch rankings.');
        } finally {
            setIsLoading(false);
        }
    };

    const getTeamCategory = (teamName: string) => {
        if (!rankingData) return 'N/A';
        for (const cat of rankingData.categoriesRanking) {
            if (cat.teams.some(t => t.teamName === teamName)) {
                return cat.categoryName;
            }
        }
        return 'N/A';
    };

    const getLogoText = (name: string) => {
        if (!name) return 'TM';
        const words = name.split(' ');
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        // Xử lý riêng lỗi "Event Coordinator" (403) thành trạng thái "Đang chờ kết quả"
        if (error.includes('Event Coordinator') || error.includes('403')) {
            return (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                        <Lock className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Bảng xếp hạng đang được ẩn</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                        Để đảm bảo tính công bằng trong quá trình chấm thi, kết quả tạm thời không được công bố.
                        <br className="hidden sm:block" />
                        Vui lòng quay lại sau khi Ban tổ chức kết thúc vòng thi và công bố kết quả chung cuộc!
                    </p>
                </div>
            );
        }

        // Fallback: Xử lý các lỗi chung khác
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center shadow-sm border border-red-100 mt-8 max-w-2xl mx-auto">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="font-semibold">{error}</p>
            </div>
        );
    }

    const teams = rankingData?.teamsResult || [];
    const gradedCount = teams.length;
    const firstPlace = teams[0] || null;
    const secondPlace = teams[1] || null;
    const thirdPlace = teams[2] || null;


    return (
        <div className="space-y-8 animate-fade-in">

            {/* Thông tin Tiêu đề */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Bảng xếp hạng Hackathon</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Kết quả công bố chính thức của vòng thi được chọn</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Chọn Sự kiện */}
                    {events.length > 0 && (
                        <select
                            value={selectedEventId || ''}
                            onChange={(e) => handleEventChange(Number(e.target.value))}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-xs"
                        >
                            <option value="" disabled>Chọn sự kiện</option>
                            {events.map(ev => (
                                <option key={ev.id ?? ev.eventId ?? ev.eventID} value={ev.id ?? ev.eventId ?? ev.eventID}>{ev.name ?? ev.eventName}</option>
                            ))}
                        </select>
                    )}

                    {/* Chọn Vòng thi */}
                    {rounds.length > 0 && (
                        <select
                            value={selectedRoundId || ''}
                            onChange={(e) => handleRoundChange(Number(e.target.value))}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-xs"
                        >
                            <option value="" disabled>Chọn vòng thi</option>
                            {rounds.map(r => (
                                <option key={r.id ?? r.roundId ?? r.roundID} value={r.id ?? r.roundId ?? r.roundID}>{r.name ?? r.roundName}</option>
                            ))}
                        </select>
                    )}

                    {/* Nút Xuất Excel */}
                    {rankingData?.draftExcelUrl && (
                        <a 
                            href={rankingData.draftExcelUrl}
                            download
                            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-xs transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>Xuất Excel</span>
                        </a>
                    )}
                </div>
            </div>

            {isGuestJudge && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-blue-900">Quyền Giám khảo khách mời</p>
                        <p className="text-xs text-blue-700/80 mt-1">
                            Bạn đang truy cập với quyền Giám khảo khách mời (Guest Judge). Theo quy định, các dữ liệu phân tích nội bộ chi tiết (Score Breakdown) và dữ liệu hiệu chuẩn đã được ẩn đi. Bạn chỉ có thể xem điểm tổng kết cuối cùng.
                        </p>
                    </div>
                </div>
            )}

            {gradedCount === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl py-16 text-center shadow-xs">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800 text-sm">Chưa có điểm nào được nộp</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Bảng xếp hạng sẽ xuất hiện tại đây khi bạn bắt đầu chấm điểm các đội thi và nộp đánh giá trong trang Bài thi.</p>
                </div>
            ) : (
                <>
                    {/* Khu vực Bục nhận giải (Podium) */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs">
                        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest text-center mb-8 flex items-center justify-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Top đội xuất sắc nhất
                        </h4>

                        {/* Lưới chứa 3 bục giải */}
                        <div className="grid grid-cols-3 max-w-2xl mx-auto items-end gap-2 md:gap-6 pt-10">

                            {/* Giải Nhì (Bên trái) */}
                            <div className="flex flex-col items-center">
                                {secondPlace ? (
                                    <div className="text-center space-y-2 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 mx-auto text-xs">
                                            {getLogoText(secondPlace.teamName)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 truncate max-w-[90px] md:max-w-[120px]" title={secondPlace.teamName}>{secondPlace.teamName}</p>
                                            <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{secondPlace.totalScore} / 10</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-300 italic mb-4">Chưa có</p>
                                )}
                                <div className="bg-slate-50 border-t border-x border-slate-100 w-full rounded-t-2xl h-24 flex flex-col justify-between p-4 shadow-xs text-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto shadow-inner">
                                        <Medal className="w-4 h-4" />
                                    </div>
                                    <span className="font-black text-slate-300 text-xl font-mono">2nd</span>
                                </div>
                            </div>

                            {/* Giải Nhất (Ở giữa - Nổi bật nhất) */}
                            <div className="flex flex-col items-center">
                                {firstPlace ? (
                                    <div className="text-center space-y-2 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center font-black text-amber-700 mx-auto text-sm animate-pulse">
                                            {getLogoText(firstPlace.teamName)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 truncate max-w-[100px] md:max-w-[150px]" title={firstPlace.teamName}>{firstPlace.teamName}</p>
                                            <p className="text-xs font-mono font-bold text-amber-600 mt-0.5 bg-amber-50 px-2 py-0.5 rounded-full inline-block">{firstPlace.totalScore} / 10</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-300 italic mb-4">Chưa có</p>
                                )}
                                <div className="primary-gradient w-full rounded-t-3xl h-36 flex flex-col justify-between p-4 shadow-md text-center text-white relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                                    <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center mx-auto shadow-md">
                                        <Trophy className="w-5 h-5 text-amber-300 fill-amber-300" />
                                    </div>
                                    <span className="font-black text-white text-2xl font-mono relative z-10">1st</span>
                                </div>
                            </div>

                            {/* Giải Ba (Bên phải) */}
                            <div className="flex flex-col items-center">
                                {thirdPlace ? (
                                    <div className="text-center space-y-2 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-50/30 border border-amber-100 flex items-center justify-center font-bold text-amber-800 mx-auto text-xs">
                                            {getLogoText(thirdPlace.teamName)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 truncate max-w-[90px] md:max-w-[120px]" title={thirdPlace.teamName}>{thirdPlace.teamName}</p>
                                            <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{thirdPlace.totalScore} / 10</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-300 italic mb-4">Chưa có</p>
                                )}
                                <div className="bg-slate-50 border-t border-x border-slate-100 w-full rounded-t-2xl h-20 flex flex-col justify-between p-4 shadow-xs text-center">
                                    <div className="w-8 h-8 rounded-full bg-amber-100/50 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                                        <Award className="w-4 h-4" />
                                    </div>
                                    <span className="font-black text-slate-300 text-xl font-mono">3rd</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Bảng Chi tiết Bảng Xếp Hạng */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thứ hạng</th>
                                    <th className="px-6 py-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đội thi</th>
                                    <th className="px-6 py-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lĩnh vực</th>
                                    {!isGuestJudge && (
                                        <th className="px-6 py-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chi tiết điểm</th>
                                    )}
                                    <th className="px-6 py-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Điểm tổng kết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {teams.map((project) => {
                                    const isGraded = project.status !== 'PENDING';
                                    const rank = project.rank;

                                    return (
                                        <tr key={project.participantId} className="hover:bg-slate-50/50 transition-colors">
                                            {/* Số thứ hạng */}
                                            <td className="px-6 py-4 font-mono font-bold text-sm">
                                                {isGraded ? (
                                                    <div className="flex items-center gap-1 text-slate-700">
                                                        {rank === 1 && <Trophy className="w-4 h-4 text-amber-500" />}
                                                        {rank === 2 && <Medal className="w-4 h-4 text-slate-400" />}
                                                        {rank === 3 && <Award className="w-4 h-4 text-amber-700" />}
                                                        {rank > 3 && <span>#{rank}</span>}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 font-normal italic">-</span>
                                                )}
                                            </td>

                                            {/* Thông tin Nhóm thi */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border bg-slate-50 text-slate-600 border-slate-200">
                                                        {getLogoText(project.teamName)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{project.teamName}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Lĩnh vực (Category) */}
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md text-xs font-semibold">
                                                    {getTeamCategory(project.teamName)}
                                                </span>
                                            </td>

                                            {/* Chi tiết từng phần điểm */}
                                            {!isGuestJudge && (
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-slate-400 italic">API chưa cung cấp dữ liệu</span>
                                                </td>
                                            )}

                                            {/* Điểm tổng kết */}
                                            <td className="px-6 py-4 text-right">
                                                {isGraded ? (
                                                    <span className="text-sm font-black text-[#0058be] font-mono">
                                                        {project.totalScore.toFixed(1)} / 10.0
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-300 font-mono">Chờ đánh giá</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

        </div>
    );
}
