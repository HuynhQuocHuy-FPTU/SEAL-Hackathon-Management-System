import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, FileCheck2, ArrowLeft, LucideUploadCloud } from 'lucide-react';
import { useNotification } from '../../hook/useNotification'
import ReviewTab from '../../component/team/submission/ReviewTab';
import PortalTab from '../../component/team/submission/PortalTab';
import LoadingOverlay from '../../component/modals/LoadingOverlay';
import type { SubmissionResponse } from '../../types/submission/Submission';
import { getSubmissionByRoundId } from '../../services/team/teamsService';
import { getEventDetailById } from '../../services/event/eventService';
import { useLocation, useNavigate } from 'react-router-dom';
import type { CurrentTeamStatus } from '../../types/team/TeamStatus';
export default function SubmissionsView() {
  const [subTab, setSubTab] = useState<'reviewer' | 'portal'>('reviewer');
  const { addNotification } = useNotification();
  const { state } = useLocation();
  const [currentTeamStatus, setCurrentTeamStatus] = useState<CurrentTeamStatus>(state?.eventCurrentStatus);
  const navigate = useNavigate();
  const [submissionsList, setSubmissionsList] = useState<SubmissionResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [editModeData, setEditModeData] = useState<SubmissionResponse | null>(null);
  const [submittingPhase, setSubmittingPhase] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [eventDetail, setEventDetail] = useState<any>(null);

  const handleTriggerEdit = (proj: SubmissionResponse) => {
    setEditModeData(proj);
    setSubTab('portal');
  };

  const currentRound = currentTeamStatus.rounds[currentTeamStatus.rounds.length - 1];
  console.log(currentRound)
  const handleProjectSubmit = async (submissionRes: any, isEdit: boolean) => {
    setSubmittingPhase('processing');
    try {
      if (isEdit && editModeData) {
        setSubmissionsList(prev => prev.map(item =>
          item.submissionId === editModeData.submissionId ? { ...item, ...submissionRes.data } : item
        ));
        addNotification("Success", `Đã cập nhật và lưu thay đổi bài nộp`);
        setSelectedProjectId(editModeData.submissionId);
      } else {
        setSubmissionsList(prev => [submissionRes.data, ...prev]);
        addNotification("Success", `Đã nộp thành công dự án mới lên hệ thống!`);
        setSelectedProjectId(submissionRes.data.submissionId);
      }
      setEditModeData(null);
      setSubTab('reviewer');
    } catch (error: any) {
      addNotification("Error", error.response.data.message);
    } finally {
      setSubmittingPhase('completed');
    }
  };
  useEffect(() => {
    console.log(currentRound);
    const getSubmission = async () => {
      try {
        const res = await getSubmissionByRoundId(currentRound.categoryRound);
        setSubmissionsList(res.data);
      } catch (error: any) {
        console.log(error?.response?.data?.message);
      }
    }
    const fetchEventDetail = async () => {
      try {
        const res = await getEventDetailById(currentTeamStatus.eventID);
        setEventDetail(res?.data || res);
      } catch (error) {
        console.error(error);
      }
    };
    getSubmission();
    fetchEventDetail();
  }, [currentRound, currentTeamStatus.eventID])

  const roundDetail = eventDetail?.rounds?.find((r: any) => r.roundId === currentRound.roundId);

  return (
    <div className="space-y-6 animate-fade-in relative min-h-150">
      <LoadingOverlay phase={submittingPhase} setPhase={setSubmittingPhase} />

      <div className="flex gap-5 w-150">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#F26F21] transition-colors bg-white hover:bg-orange-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm active:scale-95 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Trở về Dashboard
        </button>
        <p
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#F26F21] transition-colors bg-white hover:bg-orange-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit"
        >
          <LucideUploadCloud className="w-4 h-4" />
          {(roundDetail?.submissionType || currentRound?.submissionType) === 'BOTH' ? 'Nộp cả 2 dạng Github và Tệp đính kèm' : 
           (roundDetail?.submissionType || currentRound?.submissionType) === 'GITHUB_URL' ? 'Chỉ nộp Link Github' : 
           (roundDetail?.submissionType || currentRound?.submissionType) === 'FILE' ? 'Chỉ nộp Tệp đính kèm' : 'Quy định nộp bài'}
        </p>
      </div>

      <div className="flex border-b border-brand-outline-variant/30 pb-px mt-2">
        <button
          onClick={() => {
            setSubTab('reviewer');
            if (editModeData) setEditModeData(null);
          }}
          className={`px-6 py-3 text-xs font-bold transition-all relative flex items-center gap-2 ${subTab === 'reviewer' ? 'text-brand-secondary' : 'text-brand-on-surface-variant/80'}`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          Xem lại bài nộp & Điểm giám khảo
          {subTab === 'reviewer' && <motion.div layoutId="subNavigationUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-secondary" />}
        </button>

        <button
          onClick={() => setSubTab('portal')}
          className={`px-6 py-3 text-xs font-bold transition-all relative flex items-center gap-2 ${subTab === 'portal' ? 'text-brand-secondary' : 'text-brand-on-surface-variant/80'}`}
        >
          <FileCheck2 className="w-4 h-4 shrink-0" />
          {editModeData ? '✏️ Tạo bản cập nhật' : '📤 Nộp deliverables mới'}
          {subTab === 'portal' && <motion.div layoutId="subNavigationUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-secondary" />}
        </button>
      </div>

      {/* 3. Main Content */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {subTab === 'reviewer' && (
            <ReviewTab
              currentRound={currentRound}
              key="reviewer"
              selectedId={selectedProjectId}
              onSelect={setSelectedProjectId}
              onEdit={handleTriggerEdit}
            />
          )}

          {subTab === 'portal' && (
            <PortalTab
              currentRound={currentRound}
              roundDetail={roundDetail}
              onSubmit={(res) => handleProjectSubmit(res, !!editModeData)}
              editModeId={editModeData?.submissionId.toString() || null}
              initialData={editModeData as any || undefined}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}