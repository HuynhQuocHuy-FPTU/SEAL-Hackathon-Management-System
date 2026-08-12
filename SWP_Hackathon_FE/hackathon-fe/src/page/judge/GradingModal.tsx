import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Save, CheckCircle2 } from 'lucide-react';
import { getCriteriaByRoundId, submitEvaluation, getSubmissionEvaluation } from '../../services/judge/judgeService';
import type { CriteriaDTO } from '../../types/judge/Criteria';
import type { EvaluationRequest } from '../../types/judge/Submission';
import type { EvaluationDetailResponse } from '../../types/judge/EvaluationResponse';

interface GradingModalProps {
  submissionId: number;
  roundId: number;
  teamName: string;
  mode: 'PRESENTATION' | 'SUBMISSION';
  isViewOnly?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GradingModal({ submissionId, roundId, teamName, mode, isViewOnly, onClose, onSuccess }: GradingModalProps) {
  const [criteria, setCriteria] = useState<CriteriaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State quản lý Form nhập điểm
  const [scores, setScores] = useState<Record<number, number>>({});
  const [criteriaComments, setCriteriaComments] = useState<Record<number, string>>({});
  const [generalComment, setGeneralComment] = useState('');

  const [submissionResult, setSubmissionResult] = useState<EvaluationDetailResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getCriteriaByRoundId(roundId);
        if (res.success && res.data) {
          const filteredData = res.data.filter(c => c.type === mode);
          setCriteria(filteredData);
          // Khởi tạo Object chứa điểm mặc định (mức 0)
          const initScores: Record<number, number> = {};
          const initComments: Record<number, string> = {};
          filteredData.forEach(c => {
            initScores[c.evaluationCriteriaId] = 0;
            initComments[c.evaluationCriteriaId] = '';
          });

          // Kéo dữ liệu bài chấm cũ (nếu có)
          try {
            const evalRes = await getSubmissionEvaluation(submissionId);
            if (evalRes.success && evalRes.data) {
              setGeneralComment(evalRes.data.comment || '');

              if (isViewOnly) {
                // Nếu ở chế độ Chỉ xem (View Only), hiển thị thẳng màn hình chi tiết kết quả
                setSubmissionResult(evalRes.data as any);
                setShowDetails(true);
              }

              if (evalRes.data.criteriaScores) {
                evalRes.data.criteriaScores.forEach(cs => {
                  if (initScores[cs.evaluationCriteriaId] !== undefined) {
                    initScores[cs.evaluationCriteriaId] = cs.score || 0;
                    initComments[cs.evaluationCriteriaId] = cs.comment || '';
                  }
                });
              }
            }
          } catch (e) {
            
          }

          setScores(initScores);
          setCriteriaComments(initComments);
        } else {
          setError(res.message || 'Failed to load criteria');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load criteria');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [roundId, mode, submissionId]);

  const handleSubmit = async () => {
    // Validate và gom nhóm dữ liệu Điểm + Nhận xét
    const criteriaScores = criteria.map(c => ({
      evaluationCriteriaId: c.evaluationCriteriaId,
      score: scores[c.evaluationCriteriaId] || 0,
      comment: criteriaComments[c.evaluationCriteriaId] || ''
    }));

    // Tạm thời chưa bắt lỗi trường hợp nhập 0 điểm, cho qua
    const requestData: EvaluationRequest = {
      comment: generalComment,
      criteriaScores: criteriaScores
    };

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await submitEvaluation(submissionId, mode, requestData);
      if (res && res.evaluationId) {
        setSubmissionResult(res);
      } else if ((res as any).success || (res as any).status) {
        onSuccess();
      } else {
        setError((res as any).message || 'Failed to submit evaluation');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showDetails && submissionResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Chi tiết kết quả đánh giá</h2>
            <button onClick={() => onSuccess()} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Mã Đánh giá</p>
                <p className="font-bold text-slate-800">{submissionResult.evaluationId}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Trạng thái</p>
                <p className="font-bold text-slate-800">{submissionResult.status}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                <p className="text-xs text-blue-600 mb-1">Tổng điểm</p>
                <p className="font-bold text-blue-700 text-lg">{submissionResult.totalScore}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Điểm TB GK khác</p>
                <p className="font-bold text-slate-800">{submissionResult.averageOtherTotalScore}</p>
              </div>
            </div>

            {submissionResult.hasTotalDeviationWarning && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800">
                <p className="font-bold flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Cảnh báo độ lệch tổng điểm</p>
                <p className="text-sm mt-1">{submissionResult.deviationWarningMessage} (Lệch {submissionResult.totalDeviation} điểm - {submissionResult.totalDeviationPercentage}%)</p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg">Chi tiết từng tiêu chí</h3>
              {submissionResult.criteriaScores?.map(cs => (
                <div key={cs.evaluationCriteriaId} className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between mb-3 gap-2">
                    <div>
                      <span className="font-bold text-slate-800">{cs.criteriaName}</span>
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{cs.type}</span>
                      <p className="text-xs text-slate-500 mt-1">Trọng số: {cs.weight}%</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600 text-lg">{cs.score} điểm</span>
                    </div>
                  </div>
                  
                  {cs.comment && (
                    <div className="bg-slate-50 p-3 rounded-lg mb-3">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Nhận xét của bạn:</p>
                      <p className="text-sm text-slate-800">{cs.comment}</p>
                    </div>
                  )}

                  {cs.hasCriteriaDeviationWarning && (
                    <div className="bg-amber-50 p-3 rounded-lg mb-3 text-sm text-amber-800 border border-amber-100 flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>Cảnh báo lệch điểm: Lệch {cs.criteriaDeviation} điểm ({cs.criteriaDeviationPercentage}%) so với TB ({cs.averageOtherScore})</p>
                    </div>
                  )}

                  {cs.otherJudgesScores && cs.otherJudgesScores.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Điểm của các giám khảo khác</p>
                      <ul className="text-sm space-y-2">
                        {cs.otherJudgesScores.map(ojs => (
                          <li key={ojs.expertId} className="bg-slate-50 p-3 rounded-lg flex flex-col md:flex-row gap-2 md:items-center justify-between">
                            <div>
                              <span className="font-semibold text-slate-700">{ojs.expertName}</span>
                              {ojs.comment && <span className="text-slate-500 text-xs italic block md:inline md:ml-2">"{ojs.comment}"</span>}
                            </div>
                            <span className="font-bold text-slate-800 bg-white px-3 py-1 rounded-md border border-slate-200">{ojs.score} đ</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button onClick={() => onSuccess()} className="px-6 py-2.5 bg-[#F26F21] hover:brightness-110 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-500/30">
              Đóng & Hoàn thành
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submissionResult && !showDetails) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Chấm điểm thành công!</h2>
          <p className="text-slate-500 mb-8">Đã lưu điểm cho đội <span className="font-bold text-slate-700">{teamName}</span></p>
          
          <div className="flex gap-3 w-full">
            <button onClick={() => onSuccess()} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
              Đóng
            </button>
            <button onClick={() => setShowDetails(true)} className="flex-1 py-3 bg-[#F26F21] hover:brightness-110 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalScore = criteria.reduce((sum, c) => sum + (scores[c.evaluationCriteriaId] || 0), 0);
  const maxPossibleScore = criteria.reduce((sum, c) => sum + (c.weight * 10), 0); // Giả định tính tổng điểm tối đa theo trọng số

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
                <span className="text-2xl font-black text-blue-600">{totalScore}</span>
              </div>

              {/* Danh sách Tiêu chí */}
              <div className="space-y-6">
                {criteria.map((crit) => (
                  <div key={crit.evaluationCriteriaId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-slate-800">{crit.criteriaName}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {crit.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{crit.description}</p>
                        <p className="text-xs font-mono font-semibold text-purple-600 bg-purple-50 inline-block px-2 py-1 rounded">
                          Trọng số: {crit.weight}%
                        </p>
                      </div>

                      <div className="w-full md:w-64 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Điểm {crit.maxScore}</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={scores[crit.evaluationCriteriaId] || ''}
                            onChange={(e) => setScores({ ...scores, [crit.evaluationCriteriaId]: Number(e.target.value) })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-lg font-bold"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nhận xét</label>
                          <textarea
                            rows={2}
                            value={criteriaComments[crit.evaluationCriteriaId] || ''}
                            onChange={(e) => setCriteriaComments({ ...criteriaComments, [crit.evaluationCriteriaId]: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm resize-none custom-scrollbar"
                            placeholder="Nhận xét (không bắt buộc)..."
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* Nhận xét chung */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <label className="block text-sm font-bold text-slate-800 mb-2">Đánh giá chung</label>
                <textarea
                  rows={4}
                  value={generalComment}
                  onChange={(e) => setGeneralComment(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none custom-scrollbar"
                  placeholder="Tóm tắt đánh giá của bạn cho đội này..."
                />
              </div>

            </div>
          )}
        </div>

        {/* Phần Chân Modal (Footer) */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting || criteria.length === 0}
            className="px-6 py-2.5 bg-[#F26F21] text-white rounded-full font-bold flex items-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/30"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Nộp điểm
          </button>
        </div>

      </div>
    </div>
  );
}
