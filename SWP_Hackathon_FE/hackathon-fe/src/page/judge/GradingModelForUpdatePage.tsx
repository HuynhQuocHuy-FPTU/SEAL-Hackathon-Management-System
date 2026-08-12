import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Save } from 'lucide-react';
import { getCriteriaByRoundId, reEvaluatedCode, reEvaluatedPresentation } from '../../services/judge/judgeService';
import type { EvaluationRequest } from '../../types/judge/Submission';

interface GradingModalProps {
    submission?: any;
    requestId: number;
    roundId: number;
    teamName: string;
    mode: 'PRESENTATION' | 'SUBMISSION';
    onClose: () => void;
    onSuccess: () => void;
}

export default function GradingModelForUpdatePage({ submission, requestId, roundId, teamName, mode, onClose, onSuccess }: GradingModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State quản lý Form nhập điểm
    const [scores, setScores] = useState<Record<number, number>>({});
    const [criteriaComments, setCriteriaComments] = useState<Record<number, string>>({});
    const [generalComment, setGeneralComment] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await getCriteriaByRoundId(roundId);
                if (res.success && res.data) {
                    const initScores: Record<number, number> = {};
                    const initComments: Record<number, string> = {};
                    
                    if (submission && submission.listEvaluationDetail) {
                        submission.listEvaluationDetail = submission.listEvaluationDetail.map((detail: any) => {
                            const matched = res.data.find((c: any) => c.criteriaName === detail.criteriaName);
                            return {
                                ...detail,
                                evaluationCriteriaId: matched?.evaluationCriteriaId || detail.evaluationCriteriaId,
                                weight: matched?.weight || detail.weight,
                                criteriaType: matched?.type || detail.criteriaType || (mode === 'PRESENTATION' ? 'PRESENTATION' : 'SUBMISSION')
                            };
                        });

                        submission.listEvaluationDetail.forEach((crit: any) => {
                            const id = crit.evaluationCriteriaId || crit.evaluationDetailId;
                            initScores[id] = crit.score || 0;
                            initComments[id] = crit.comment || '';
                        });
                    }

                    setScores(initScores);
                    setCriteriaComments(initComments);
                    if (submission) {
                        setGeneralComment(submission.comment || '');
                    }
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load criteria');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [roundId, mode, requestId]);

    const handleUpdateGroup = async (groupType: 'PRESENTATION' | 'SUBMISSION') => {
        const groupCriteria = submission.listEvaluationDetail.filter((crit: any) =>
            groupType === 'PRESENTATION' ? crit.criteriaType === 'PRESENTATION' : crit.criteriaType !== 'PRESENTATION'
        );
        const criteriaScores = groupCriteria.map((crit: any) => {
            const id = crit.evaluationCriteriaId || crit.evaluationDetailId;
            return {
                evaluationCriteriaId: crit.evaluationCriteriaId || id,
                score: scores[id] || 0,
                comment: criteriaComments[id] || ''
            };
        });

        const requestData: EvaluationRequest = {
            requestId: requestId,
            comment: generalComment,
            criteriaScores: criteriaScores
        };
        try {
            setIsSubmitting(true);
            setError(null);
            const res = groupType === 'PRESENTATION'
                ? await reEvaluatedPresentation(requestData)
                : await reEvaluatedCode(requestData);

            if (res.success || res.status) {
                onSuccess();
            } else {
                setError(res.message || 'Failed to submit evaluation');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit evaluation');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Phần Tiêu đề (Header) */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {mode === 'PRESENTATION' ? 'Chấm điểm thuyết trình' : 'Chấm điểm bài nộp'}
                        </h2>
                        <p className="text-sm font-mono text-slate-500 mt-0.5">Đội: {teamName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nội dung chính (Content) */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">Đang tải tiêu chí...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-8">

                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
                                <span className="font-semibold text-blue-800">Tổng điểm hiện tại</span>
                                <span className="text-2xl font-black text-blue-600">{submission.totalScore}</span>
                            </div>

                            {/* Ô Nhận xét chung */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                <label className="block text-sm font-bold text-slate-800 mb-2">Đánh giá chung (Áp dụng cho cả 2 phần)</label>
                                <textarea
                                    rows={4}
                                    value={generalComment}
                                    onChange={(e) => setGeneralComment(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none custom-scrollbar"
                                    placeholder="Tóm tắt đánh giá của bạn cho đội này..."
                                />
                            </div>

                            {/* Phần Thuyết trình (Presentation Group) */}
                            {submission.listEvaluationDetail.filter((c: any) => c.criteriaType === 'PRESENTATION').length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Phần Thuyết trình (Presentation)</h3>
                                    {submission.listEvaluationDetail.filter((c: any) => c.criteriaType === 'PRESENTATION').map((crit: any) => {
                                        const critId = crit.evaluationCriteriaId || crit.evaluationDetailId;
                                        return (
                                            <div key={critId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-purple-200 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-bold text-slate-800">{crit.criteriaName}</h4>
                                                        </div>
                                                        <p className="text-sm text-slate-600 mb-3">{crit.criteriaDescription}</p>
                                                        <p className="text-xs font-mono font-semibold text-purple-600 bg-purple-50 inline-block px-2 py-1 rounded">
                                                            Trọng số: {crit.weight}%
                                                        </p>
                                                    </div>
                                                    <div className="w-full md:w-64 space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Điểm (0-100)</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={scores[critId] !== undefined ? scores[critId] : (crit.score || 0)}
                                                                onChange={(e) => setScores({ ...scores, [critId]: Number(e.target.value) })}
                                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-lg font-bold"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nhận xét</label>
                                                            <textarea
                                                                rows={2}
                                                                value={criteriaComments[critId] || ''}
                                                                onChange={(e) => setCriteriaComments({ ...criteriaComments, [critId]: e.target.value })}
                                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm resize-none custom-scrollbar"
                                                                placeholder="Nhận xét (không bắt buộc)..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => handleUpdateGroup('PRESENTATION')}
                                            disabled={isSubmitting}
                                            className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-500/30 flex items-center gap-2"
                                        >
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Nộp điểm Presentation
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Phần Nộp bài (Submission Group) */}
                            {submission.listEvaluationDetail.filter((c: any) => c.criteriaType !== 'PRESENTATION').length > 0 && (
                                <div className="space-y-4 mt-8">
                                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Phần Nộp bài (Submission)</h3>
                                    {submission.listEvaluationDetail.filter((c: any) => c.criteriaType !== 'PRESENTATION').map((crit: any) => {
                                        const critId = crit.evaluationCriteriaId || crit.evaluationDetailId;
                                        return (
                                            <div key={critId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-200 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-bold text-slate-800">{crit.criteriaName}</h4>
                                                        </div>
                                                        <p className="text-sm text-slate-600 mb-3">{crit.criteriaDescription}</p>
                                                        <p className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                                                            Trọng số: {crit.weight}%
                                                        </p>
                                                    </div>
                                                    <div className="w-full md:w-64 space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Điểm (0-100)</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={scores[critId] !== undefined ? scores[critId] : (crit.score || 0)}
                                                                onChange={(e) => setScores({ ...scores, [critId]: Number(e.target.value) })}
                                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-lg font-bold"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nhận xét</label>
                                                            <textarea
                                                                rows={2}
                                                                value={criteriaComments[critId] || ''}
                                                                onChange={(e) => setCriteriaComments({ ...criteriaComments, [critId]: e.target.value })}
                                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm resize-none custom-scrollbar"
                                                                placeholder="Nhận xét (không bắt buộc)..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => handleUpdateGroup('SUBMISSION')}
                                            disabled={isSubmitting}
                                            className="px-6 py-2.5 bg-[#F26F21] text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-md shadow-blue-500/30 flex items-center gap-2"
                                        >
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Nộp điểm Submission
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Phần Chân Modal (Footer) */}
                <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Đóng
                    </button>
                </div>

            </div>
        </div>
    );
}
