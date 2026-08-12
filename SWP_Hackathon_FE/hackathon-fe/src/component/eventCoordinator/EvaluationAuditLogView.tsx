import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Target, Users, Search, ChevronRight, FileText, X, AlertCircle } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import type { Hackathon, RoundResponse } from '../../types/hackathonEvent/Hackathon';
import { getAuditLogEvaluations, getEvaluationAttempts, getAuditAttemptDetails } from '../../services/event/EvaluationAuditLog';
import { getRankingByRoundId } from '../../services/event/rankTeams';
import { useNotification } from '../../hook/useNotification';
import type { EvaluationAuditListResponse, EvaluationAuditAttemptResponse, EvaluationDetailAuditResponse } from '../../types/hackathonEvent/EvaluationAuditResponse';

interface EvaluationAuditLogViewProps {
    event: Hackathon;
}

export default function EvaluationAuditLogView({ event }: EvaluationAuditLogViewProps) {
    const [selectedRoundId, setSelectedRoundId] = useState<number | null>(event.rounds?.length > 0 ? event.rounds[0].roundId : null);
    const [selectedCategoryRoundId, setSelectedCategoryRoundId] = useState<number | null>(null);
    const [categories, setCategories] = useState<{ id: number, name: string, categoryRoundId: number }[]>([]);
    
    const [evaluations, setEvaluations] = useState<EvaluationAuditListResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationAuditListResponse | null>(null);
    const [attempts, setAttempts] = useState<EvaluationAuditAttemptResponse[]>([]);
    const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
    
    const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
    const [attemptDetails, setAttemptDetails] = useState<Record<number, EvaluationDetailAuditResponse[]>>({});
    
    const { addNotification } = useNotification();

    // Fetch categories when round changes
    useEffect(() => {
        if (!selectedRoundId) return;
        const fetchCategories = async () => {
            try {
                const rankRes = await getRankingByRoundId(selectedRoundId);
                const rankData = rankRes?.data || rankRes;
                if (rankData?.categoriesRanking) {
                    const mappedCats = rankData.categoriesRanking.map((c: any) => ({
                        id: c.categoryId,
                        name: c.categoryName,
                        categoryRoundId: c.categoryRoundId
                    }));
                    setCategories(mappedCats);
                    if (mappedCats.length > 0) {
                        setSelectedCategoryRoundId(mappedCats[0].categoryRoundId);
                    } else {
                        setSelectedCategoryRoundId(null);
                        setEvaluations([]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch categories ranking", error);
            }
        };
        fetchCategories();
    }, [selectedRoundId]);

    // Fetch evaluations when categoryRoundId changes
    useEffect(() => {
        if (!selectedCategoryRoundId) return;
        const fetchEvaluations = async () => {
            setIsLoading(true);
            try {
                const res = await getAuditLogEvaluations(selectedCategoryRoundId);
                setEvaluations((res as any)?.data || res || []);
            } catch (error: any) {
                console.error(error);
                addNotification("Info", "Không thể lấy danh sách bài chấm");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvaluations();
    }, [selectedCategoryRoundId]);

    const handleViewAttempts = async (evaluation: EvaluationAuditListResponse) => {
        setSelectedEvaluation(evaluation);
        setIsLoadingAttempts(true);
        try {
            const res = await getEvaluationAttempts(evaluation.evaluationId);
            setAttempts((res as any)?.data || res || []);
        } catch (error) {
            console.error(error);
            addNotification("Info", "Không thể lấy lịch sử thay đổi");
        } finally {
            setIsLoadingAttempts(false);
        }
    };

    const handleToggleAttemptDetails = async (attemptId: number) => {
        if (selectedAttemptId === attemptId) {
            setSelectedAttemptId(null);
            return;
        }
        setSelectedAttemptId(attemptId);
        if (!attemptDetails[attemptId]) {
            try {
                const res = await getAuditAttemptDetails(attemptId);
                setAttemptDetails(prev => ({ ...prev, [attemptId]: (res as any)?.data || res || [] }));
            } catch (error) {
                console.error(error);
                addNotification("Info", "Không thể lấy chi tiết điểm");
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
        >
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <History className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Lịch sử chấm điểm</h2>
                        <p className="text-sm text-slate-500">Xem và theo dõi toàn bộ lịch sử chỉnh sửa điểm của các Giám khảo.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vòng thi</label>
                        <CustomSelect
                            options={event.rounds?.map(r => ({ value: r.roundId, label: r.roundName })) || []}
                            value={selectedRoundId}
                            onChange={(val) => setSelectedRoundId(Number(val))}
                            placeholder="Chọn vòng thi"
                        />
                    </div>
                    {categories.length > 0 && (
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hạng mục thi đấu</label>
                            <CustomSelect
                                options={categories.map(c => ({ value: c.categoryRoundId, label: c.name }))}
                                value={selectedCategoryRoundId}
                                onChange={(val) => setSelectedCategoryRoundId(Number(val))}
                                placeholder="Chọn hạng mục"
                            />
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
                    </div>
                ) : evaluations.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <History className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Chưa có dữ liệu chấm điểm cho hạng mục này.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden border border-slate-200 rounded-2xl">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Đội thi</th>
                                    <th className="px-6 py-4">Giám khảo</th>
                                    <th className="px-6 py-4 text-center">Trạng thái</th>
                                    <th className="px-6 py-4 text-center">Tổng điểm</th>
                                    <th className="px-6 py-4 text-center">Số lần sửa</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {evaluations.map((evalItem) => (
                                    <tr key={evalItem.evaluationId} className="bg-white hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            {evalItem.teamName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {evalItem.judgeName}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${evalItem.currentStatus === 'GRADED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                                                {evalItem.currentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-blue-600">
                                            {evalItem.currentScore}
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-slate-500">
                                            {evalItem.totalAttempts}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleViewAttempts(evalItem)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Attempts Modal/Drawer */}
            <AnimatePresence>
                {selectedEvaluation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setSelectedEvaluation(null)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full max-w-4xl h-full bg-white shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Lịch sử thay đổi điểm</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Đội: <span className="font-semibold text-slate-700">{selectedEvaluation.teamName}</span> | 
                                        Giám khảo: <span className="font-semibold text-slate-700">{selectedEvaluation.judgeName}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedEvaluation(null)}
                                    className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                                {isLoadingAttempts ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                    </div>
                                ) : attempts.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-slate-500 text-sm">Chưa có lịch sử thay đổi.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { type: 'SUBMISSION', title: 'Submission' },
                                            { type: 'PRESENTATION', title: 'Presentation' }
                                        ].map(column => {
                                            const filteredAttempts = attempts.filter(a => a.criteriaType === column.type);
                                            return (
                                                <div key={column.type} className="flex flex-col">
                                                    <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${column.type === 'SUBMISSION' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                                                        {column.title}
                                                    </h4>
                                                    
                                                    {filteredAttempts.length === 0 ? (
                                                        <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                            <p className="text-slate-400 text-sm">Chưa có lịch sử {column.title.toLowerCase()}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                                                            {filteredAttempts.map((attempt, idx) => (
                                                                <div key={attempt.attemptId} className="relative pl-6">
                                                                    <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ${column.type === 'SUBMISSION' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                                                                    
                                                                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                                                                        <div className="p-4 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                                                             onClick={() => handleToggleAttemptDetails(attempt.attemptId)}
                                                                        >
                                                                            <div>
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <span className="text-xs font-bold text-slate-500 uppercase">Lần {attempt.attemptNumber}</span>
                                                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">{attempt.action}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-3 text-sm">
                                                                                    <span className="font-semibold text-slate-800">Tổng điểm: <span className="text-blue-600">{attempt.totalScore}</span></span>
                                                                                    <span className="text-slate-400 text-xs">{new Date(attempt.createdAt).toLocaleString()}</span>
                                                                                </div>
                                                                            </div>
                                                                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${selectedAttemptId === attempt.attemptId ? 'rotate-90' : ''}`} />
                                                                        </div>
                                                                        
                                                                        <AnimatePresence>
                                                                            {selectedAttemptId === attempt.attemptId && (
                                                                                <motion.div
                                                                                    initial={{ height: 0, opacity: 0 }}
                                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                                    exit={{ height: 0, opacity: 0 }}
                                                                                    className="overflow-hidden bg-slate-50/50"
                                                                                >
                                                                                    <div className="p-4 space-y-3">
                                                                                        {attempt.totalComment && (
                                                                                            <div className="bg-white rounded-xl p-3 border border-slate-200 text-sm">
                                                                                                <span className="text-xs font-bold text-slate-500 block mb-1">Nhận xét chung</span>
                                                                                                <p className="text-slate-700 italic">{attempt.totalComment}</p>
                                                                                            </div>
                                                                                        )}
                                                                                        
                                                                                        {!attemptDetails[attempt.attemptId] ? (
                                                                                            <div className="text-center py-4 text-xs text-slate-500">Đang tải chi tiết...</div>
                                                                                        ) : (
                                                                                            <div className="space-y-2">
                                                                                                <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Chi tiết từng tiêu chí</h4>
                                                                                                {attemptDetails[attempt.attemptId].map(detail => (
                                                                                                    <div key={detail.detailAuditId} className="bg-white rounded-xl p-3 border border-slate-200">
                                                                                                        <div className="flex justify-between items-start gap-4">
                                                                                                            <div>
                                                                                                                <p className="text-sm font-semibold text-slate-800">{detail.criteriaName} <span className="text-[10px] text-slate-400 font-normal">({detail.criteriaWeight}%)</span></p>
                                                                                                                {detail.comment && <p className="text-xs text-slate-500 mt-1 italic">{detail.comment}</p>}
                                                                                                            </div>
                                                                                                            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg shrink-0">{detail.score} đ</span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
