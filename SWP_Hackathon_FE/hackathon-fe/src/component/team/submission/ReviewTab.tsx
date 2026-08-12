import { motion, AnimatePresence } from 'motion/react';
import {
  FileCode,
  AlertTriangle,
  ExternalLink,
  Edit,
  FileText,
  Link2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { SubmissionResponse } from '../../../types/submission/Submission';
import type { RoundCurrent } from '../../../types/team/TeamStatus';
import { useEffect, useState } from 'react';
import { getAllSubmissionByRoundId, chooseFinalSubmission } from '../../../services/team/teamsService';
import { useNotification } from '../../../hook/useNotification';

interface ReviewTabProps {
  currentRound: RoundCurrent;
  selectedId: number;
  onSelect: (id: number) => void;
  onEdit: (proj: SubmissionResponse) => void;
}


export default function ReviewTab({ currentRound, selectedId, onSelect, onEdit }: ReviewTabProps) {
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const selectedProject = submissions.find(s => s.submissionId === selectedId) ?? submissions[0];
  const { addNotification } = useNotification();

  const handleSetFinal = async (e: React.MouseEvent, subId: number) => {
    e.stopPropagation();
    try {
      await chooseFinalSubmission(subId);
      addNotification("Success", "Đã đánh dấu bài nộp là bản chính thức (Final)!");
      setSubmissions(prev => prev.map(s => ({
        ...s,
        final: s.submissionId === subId
      })));
    } catch (error: any) {
      addNotification("Error", error.response?.data?.message || "Lỗi khi chọn bản Final");
    }
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await getAllSubmissionByRoundId(currentRound.roundId);
        setSubmissions(response.data);
      } catch (error: any) {
        console.log(error?.response.data.message);
      }
    }
    fetchSubmissions();
  }, [currentRound])
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* ===== CỘT TRÁI ===== */}
      <div className="lg:col-span-4 flex flex-col gap-4">

        {/* Submission history list */}
        <div className="bg-white rounded-2xl border border-brand-outline-variant/50 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider">
              Lịch sử nộp bài
            </h3>
            <span className="text-[10px] font-bold bg-brand-surface-high text-brand-on-surface-variant px-2 py-0.5 rounded-full">
              {submissions.length}
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="w-10 h-10 rounded-full bg-brand-surface-high flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5 text-brand-on-surface-variant/50" />
              </div>
              <p className="text-xs text-brand-on-surface-variant/60">Chưa có bài nộp nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((sub, idx) => {
                const isSelected = sub.submissionId === selectedId;
                const isSubmitted = sub.status === 'SUBMITTED';
                return (
                  <motion.div
                    key={sub.submissionId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    onClick={() => onSelect(sub.submissionId)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer group relative overflow-hidden backdrop-blur-sm ${isSelected
                      ? 'bg-white/80 border-orange-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-orange-50/50'
                      : 'bg-white/40 border-slate-200/60 hover:bg-white/90 hover:border-orange-200 hover:shadow-md'
                      }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="selectedIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#F26F21] rounded-r-full"
                      />
                    )}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm font-bold line-clamp-1 leading-tight transition-colors ${isSelected ? 'text-orange-900' : 'text-slate-700 group-hover:text-orange-800'}`}>
                          {sub.teamName}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase shrink-0 tracking-wide border ${isSubmitted
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {isSubmitted ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isSubmitted ? 'Đã nộp' : 'Chưa nộp'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <FileCode className="w-3.5 h-3.5 text-orange-400" />
                          <span>{sub.fileDTOList?.length || 0} tệp</span>
                        </div>

                        <button
                          onClick={(e) => handleSetFinal(e, sub.submissionId)}
                          className={`group/btn px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${sub.final
                            ? 'bg-emerald-500 text-white cursor-default shadow-emerald-500/20'
                            : 'bg-white text-slate-500 hover:bg-emerald-500 hover:text-white border border-slate-200 hover:border-emerald-500 hover:shadow-emerald-500/20'}`}
                          title={sub.final ? "Bản chính thức (Final)" : "Đánh dấu là bản chính thức (Final)"}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 transition-colors ${sub.final ? 'text-white' : 'text-slate-400 group-hover/btn:text-white'}`} />
                          {sub.final ? 'FINAL' : 'CHỌN FINAL'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Deadline warning */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.2 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">Thời hạn sửa và nộp</h4>
              <p className="text-[11px] text-amber-800/80 leading-relaxed mt-1">
                Hạn chót nộp bài là <strong className="text-amber-900">{new Date(currentRound.SubmissionDeadline).toLocaleDateString()}</strong>. Bạn có thể cập nhật và chỉnh sửa deliverables nhiều lần trước hạn.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== CỘT PHẢI ===== */}
      <div className="lg:col-span-8 space-y-5">
        <AnimatePresence mode="wait">
          {selectedProject ? (
            <motion.div
              key={selectedProject.submissionId}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl border border-brand-outline-variant/60 p-6 md:p-8 shadow-sm"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-5 border-brand-outline-variant/20 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] bg-brand-surface-high font-bold px-2.5 py-1 rounded-lg text-brand-primary uppercase tracking-widest font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse inline-block" />
                    Báo cáo nộp bài
                  </span>
                  <h2 className="text-xl font-bold text-brand-on-surface mt-2.5">
                    {selectedProject.teamName}
                  </h2>
                </div>

                <button
                  onClick={() => onEdit(selectedProject)}
                  className="shrink-0 inline-flex items-center gap-1.5 bg-white hover:bg-orange-50 border border-brand-outline-variant hover:border-brand-primary/40 text-brand-on-surface hover:text-brand-primary font-semibold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Chỉnh sửa
                </button>
              </div>

              {/* Description */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-2">Mô tả dự án</h3>
                  <p className="text-xs text-brand-on-surface-variant leading-relaxed bg-brand-surface/50 rounded-xl p-3 border border-brand-outline-variant/20">
                    {/* {selectedProject.description || <span className="italic text-brand-on-surface-variant/40">Chưa có mô tả</span>} */}
                  </p>
                </div>

                {/* GitHub */}
                <div>
                  <h3 className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-2">Kho mã nguồn</h3>
                  <div className="flex items-center justify-between p-3 bg-brand-surface border border-brand-outline-variant/30 rounded-xl group/gh hover:border-brand-primary/30 transition-colors">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg bg-brand-on-surface/5 flex items-center justify-center shrink-0">
                        <Link2 className="w-4 h-4 text-brand-on-surface/70" />
                      </div>
                      <span className="text-[11px] truncate text-brand-on-surface-variant font-medium">
                        {selectedProject.githubUrl || 'Chưa cung cấp GitHub URL'}
                      </span>
                    </div>
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-brand-secondary hover:text-brand-primary transition-colors p-1 rounded-lg hover:bg-brand-surface-high"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                {selectedProject.fileDTOList?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider">
                        Tệp đính kèm
                      </h3>
                      <span className="text-[10px] font-bold bg-brand-surface-high text-brand-on-surface-variant px-2 py-0.5 rounded-full">
                        {selectedProject.fileDTOList.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedProject.fileDTOList.map((file, i) => (
                        <motion.div
                          key={`${file.fileName}-${i}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center justify-between p-2.5 bg-brand-surface hover:bg-orange-50/60 border border-brand-outline-variant/30 hover:border-brand-primary/20 rounded-xl cursor-pointer group transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-brand-primary/8 flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5 text-brand-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-brand-on-surface truncate group-hover:text-brand-primary transition-colors">
                                {file.fileName}
                              </p>
                            </div>
                          </div>
                          <span className="text-brand-on-surface-variant/30 group-hover:text-brand-secondary transition-colors text-sm shrink-0 ml-1">↓</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl border border-brand-outline-variant/60 p-12 shadow-sm text-center"
            >
              <div className="w-14 h-14 bg-brand-surface-high rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7 text-brand-on-surface-variant/40" />
              </div>
              <p className="text-sm font-semibold text-brand-on-surface/60">Chưa chọn bài nộp nào</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}