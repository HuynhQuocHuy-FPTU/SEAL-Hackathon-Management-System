import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Star, Loader2, ChevronDown } from 'lucide-react';
import type { Hackathon } from '../../types/hackathonEvent/Hackathon';
import { getAllRanking } from '../../services/event/rankTeams';
import type { Rank } from '../../types/rank/Rank';

interface RankingSectionProps {
    events: Hackathon[];
    isDark: boolean;
}

const GlassSelect = ({ options, value, onChange, placeholder, isDark }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = options.find((o: any) => o.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 rounded-2xl border backdrop-blur-md shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] ${isDark ? 'bg-slate-800/30 border-slate-700/50 text-white' : 'bg-white/40 border-white/60 text-slate-900'} focus:ring-2 focus:ring-amber-500/50 outline-none transition-all cursor-pointer font-medium hover:backdrop-blur-xl flex items-center justify-between`}
            >
                <span className={!selected ? (isDark ? 'text-slate-400' : 'text-slate-500') : 'truncate'}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={`absolute top-full left-0 mt-2 z-50 w-full py-2 rounded-2xl border backdrop-blur-md transform-gpu shadow-xl overflow-hidden max-h-60 overflow-y-auto ${isDark ? 'bg-slate-800/70 border-slate-700/50 text-white shadow-black/40' : 'bg-white/70 border-white/60 text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)]'}`}
                    >
                        {options.map((option: any) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-3 cursor-pointer text-sm transition-colors flex items-center ${value === option.value
                                    ? (isDark ? 'bg-amber-500/20 text-amber-400 ' : 'bg-amber-500/10 text-amber-600 font-bold')
                                    : (isDark ? 'hover:bg-slate-700/50' : 'hover:bg-white/60')
                                    }`}
                            >
                                {option.label}
                            </div>
                        ))}
                        {options.length === 0 && (
                            <div className="px-4 py-3 text-slate-300 text-center">Không có dữ liệu</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function RankingSection({ events, isDark }: RankingSectionProps) {
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
    const [rankData, setRankData] = useState<Rank | null>(null);
    const [loading, setLoading] = useState(false);

    const selectedEvent = events.find(e => e.eventId === selectedEventId);
    useEffect(() => {
        if (events.length > 0 && !selectedEventId) {
            setSelectedEventId(events[0].eventId);
        }
    }, [events, selectedEventId]);

    useEffect(() => {
        if (selectedEvent && selectedEvent.rounds && selectedEvent.rounds.length > 0) {
            setSelectedRoundId(selectedEvent.rounds[0].roundId);
        } else {
            setSelectedRoundId(null);
            setRankData(null);
        }
    }, [selectedEventId, selectedEvent]);

    useEffect(() => {
        const fetchRanking = async () => {
            if (!selectedRoundId) return;
            setLoading(true);
            try {
                const res = await getAllRanking(selectedRoundId);
                setRankData(res.data);
            } catch (error) {
                console.error("Failed to fetch ranking", error);
                setRankData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, [selectedRoundId]);

    const isFinalRound = selectedEvent?.rounds && selectedEvent.rounds.length > 0
        && selectedEvent.rounds[selectedEvent.rounds.length - 1].roundId === selectedRoundId;

    const isOverallRanking = isFinalRound || rankData?.advancementRule === 'TOP_N_OVERALL' || rankData?.advancementRule?.toUpperCase().includes('OVERALL');

    const advancedTeams = React.useMemo(() => {
        if (!rankData || !rankData.topN || rankData.topN <= 0 || !rankData.categoriesRanking) return [];

        if (isOverallRanking) {
            // Vòng chung kết: Lấy tất cả các đội gộp lại
            const allTeams = rankData.categoriesRanking.flatMap(cat =>
                cat.teams.map(team => ({
                    ...team,
                    categoryName: cat.categoryName,
                }))
            );

            allTeams.sort((a, b) => b.totalScore - a.totalScore);
            return allTeams.slice(0, rankData.topN).map((team, idx) => ({
                ...team,
                originalRank: idx + 1
            }));
        } else {
            return rankData.categoriesRanking.flatMap(cat =>
                cat.teams.slice(0, rankData.topN).map((team, idx) => ({
                    ...team,
                    categoryName: cat.categoryName,
                    originalRank: idx + 1
                }))
            ).sort((a, b) => b.totalScore - a.totalScore);
        }
    }, [rankData, isOverallRanking]);

    return (
        <section className={`py-20 ${isDark ? 'bg-[#080c14]' : 'bg-slate-50'} relative overflow-hidden`} id="ranking">
            {/* Header */}
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm mb-4 border border-amber-500/20 uppercase tracking-widest"
                    >
                        <Trophy className="w-4 h-4" />
                        Bảng Xếp Hạng
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={`text-3xl md:text-5xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}
                    >
                        Vinh Danh Thành Tích
                    </motion.h2>
                </div>
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 justify-center mb-12">
                    <div className="w-full md:w-64">
                        <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Sự kiện</label>
                        <GlassSelect
                            options={events.map(event => ({ value: event.eventId, label: event.eventName }))}
                            value={selectedEventId || ''}
                            onChange={(val: any) => setSelectedEventId(Number(val))}
                            placeholder="Chọn sự kiện..."
                            isDark={isDark}
                        />
                    </div>
                    {selectedEvent?.rounds && selectedEvent.rounds.length > 0 && (
                        <div className="w-full md:w-64">
                            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Vòng thi</label>
                            <GlassSelect
                                options={selectedEvent.rounds.map(round => ({ value: round.roundId, label: round.roundName }))}
                                value={selectedRoundId || ''}
                                onChange={(val: any) => setSelectedRoundId(Number(val))}
                                placeholder="Chọn vòng thi..."
                                isDark={isDark}
                            />
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Đang cập nhật bảng vàng...</p>
                    </div>
                ) : rankData && rankData.categoriesRanking?.length > 0 ? (
                    <div className="max-w-4xl mx-auto space-y-12">
                        {/* Display Round Info */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`text-center p-6 md:p-8 rounded-3xl ${isDark ? 'bg-linear-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50' : 'bg-white border border-slate-200 shadow-xl shadow-slate-200/40'} relative overflow-hidden`}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-400 via-amber-300 to-amber-500"></div>
                            <h3 className={`text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{rankData.roundName}</h3>
                        </motion.div>

                        {/* Advanced/Winning Teams Table */}
                        {rankData.topN > 0 && advancedTeams.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`rounded-3xl overflow-hidden border mb-12 ${isDark ? 'bg-amber-900/10 border-amber-500/30' : 'bg-linear-to-br from-amber-50 to-orange-50 border-amber-200 shadow-xl shadow-amber-200/20'}`}
                            >
                                <div className={`px-6 py-5 flex flex-col md:flex-row items-start md:items-center gap-4 border-b ${isDark ? 'border-amber-500/20 bg-amber-500/10' : 'border-amber-200/50 bg-amber-100/50'}`}>
                                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className={`text-xl md:text-2xl font-black uppercase tracking-wide ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                                            <p>Danh sách các đội tham gia </p>
                                        </h4>
                                        <p className={`text-sm font-medium mt-1 ${isDark ? 'text-amber-500/70' : 'text-amber-700/70'}`}>
                                            Top {rankData.topN} đội xuất sắc nhất {isOverallRanking ? 'toàn sự kiện và thắng giải' : 'mỗi bảng'}
                                        </p>
                                    </div>
                                </div>
                                <div className=" p-0 overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-150">
                                        <thead>
                                            <tr className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-amber-500/50 bg-black/20' : 'text-amber-800/60 bg-white/40'}`}>
                                                <th className="py-3 px-4 text-center w-20">Top</th>
                                                <th className="py-3 px-4">Tên đội</th>
                                                <th className="py-3 px-4 text-right">Tổng điểm</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isDark ? 'divide-amber-500/10' : 'divide-amber-200/40'}`}>
                                            {advancedTeams?.map((team) => (
                                                <tr key={team.participantId} className={`group transition-colors ${isDark ? 'hover:bg-amber-500/5' : 'hover:bg-white/60'}`}>
                                                    <td className="py-4 px-6 text-center">
                                                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-sm ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                                                            {team?.originalRank}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`font-bold text-base ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                            {team?.teamName}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <span className={`font-black text-lg ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                                            {team?.totalScore?.toFixed(2)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {rankData.categoriesRanking.map((category, index) => (
                                <motion.div
                                    key={category.categoryId}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`rounded-3xl overflow-hidden border ${isDark ? 'bg-slate-800/20 border-slate-700/50 backdrop-blur-sm' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/30'}`}
                                >
                                    <div className={`px-6 py-5 border-b flex items-center gap-3 ${isDark ? 'border-slate-700/50 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                                            <Star className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <h4 className={`text-xl font-bold uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                            Hạng mục: {category.categoryName}
                                        </h4>
                                    </div>
                                    <div className="p-0 overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-100">
                                            <thead>
                                                <tr className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400 bg-slate-900/40' : 'text-slate-500 bg-slate-50/50'}`}>
                                                    <th className="py-4 px-6 text-center w-20">Hạng</th>
                                                    <th className="py-4 px-6">Tên đội</th>
                                                    <th className="py-4 px-6 text-right">Tổng điểm</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                                {category.teams.map((team, idx) => (
                                                    <tr key={team.participantId} className={`group transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                                        <td className="py-4 px-6 text-center">
                                                            {idx === 0 ? (
                                                                <div className="w-8 h-8 mx-auto rounded-full bg-yellow-400/20 text-yellow-600 flex items-center justify-center font-black border-2 border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.2)]">1</div>
                                                            ) : idx === 1 ? (
                                                                <div className="w-8 h-8 mx-auto rounded-full bg-slate-300/20 text-slate-500 flex items-center justify-center font-black border-2 border-slate-300/40">2</div>
                                                            ) : idx === 2 ? (
                                                                <div className="w-8 h-8 mx-auto rounded-full bg-amber-700/10 text-amber-600 flex items-center justify-center font-black border-2 border-amber-700/30">3</div>
                                                            ) : (
                                                                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                    {idx + 1}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`font-bold text-base ${isDark ? 'text-slate-200 group-hover:text-amber-400' : 'text-slate-700 group-hover:text-blue-600'} transition-colors`}>
                                                                {team.teamName}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <span className={`font-black text-lg ${isDark ? 'text-amber-400' : 'text-blue-600'}`}>
                                                                {team?.totalScore?.toFixed(2)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {category.teams.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className={`py-12 text-center text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            Bảng thi này chưa có dữ liệu xếp hạng
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : rankData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`max-w-xl mx-auto p-12 rounded-3xl text-center border ${isDark ? 'bg-slate-800/20 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}
                    >
                        <Medal className="w-16 h-16 text-slate-300 mx-auto mb-6 opacity-50" strokeWidth={1.5} />
                        <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Chưa công bố kết quả</h3>
                        <p className={`text-base font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vòng thi này hiện chưa có dữ liệu bảng xếp hạng được công bố.</p>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
