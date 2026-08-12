import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Clock,
    CheckCircle,
    Calendar,
    ArrowRight,
    GitCommit,
    GitPullRequest,
    Activity,
    Target,
    CheckSquare,
    Award,
    MessageSquare,
    LifeBuoy,
    LucideActivitySquare,
    X
} from 'lucide-react';
import type { CurrentTeamStatus } from '../../../types/team/TeamStatus';
import type { SubmissionEvaluatedDetail, SubmissionResponse } from '../../../types/submission/Submission';
import { sendAppeal, chooseFinalSubmission, sendRequestMentor, getEvaluatedSubmission, getSubmsisionEvaluatedDetail, viewPrize } from '../../../services/team/teamsService';
import { useNotification } from '../../../hook/useNotification';
import LoadingOverlay from '../../modals/LoadingOverlay';
import CustomSelect from '../../ui/CustomSelect';
import type { SubmissionEvaluated } from '../../../types/submission/Submission';
import type { Prize } from '../../../types/rank/Prize';

interface HasCompetitionProps {
    status: CurrentTeamStatus;
    submissions: SubmissionResponse[];
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

export default function HasCompetition({
    status,
    submissions
}: HasCompetitionProps) {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState<string>('--:--:--');
    const [isExpired, setIsExpired] = useState<boolean>(false);
    const [evaluatedSubmission, setEvaluatedSubmission] = useState<SubmissionEvaluated>();
    const [progress, setProgress] = useState(0);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [appealMessage, setAppealMessage] = useState("");
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [supportMessage, setSupportMessage] = useState("");
    const [appealPhase, setAppealPhase] = useState<'idle' | 'processing' | 'completed'>('idle');
    const { addNotification } = useNotification();
    const [localSubmissions, setLocalSubmissions] = useState<SubmissionResponse[]>([]);
    const [submissionDetail, setSubmissionDetail] = useState<SubmissionEvaluatedDetail>(null);
    const [allSubmissionDetails, setAllSubmissionDetails] = useState<SubmissionEvaluatedDetail[]>([]);
    const [selectedExpertIndex, setSelectedExpertIndex] = useState(0);
    const lastRound = status.rounds[status.rounds.length - 1];
    const [prizes, setPrizes] = useState<Prize>();
    const [showPrizeModal, setShowPrizeModal] = useState(false);
    useEffect(() => {
        const fetchPrize = async () => {
            try {
                const res = await viewPrize(status.eventID);
                if (res?.data) {
                    setPrizes(res.data);
                }
            } catch (error) { }
        };

        fetchPrize();
    }, []);

    useEffect(() => {
        if (prizes?.prizeTitle && prizes?.prizeReward) {
            setShowPrizeModal(true);
        }
    }, [prizes]);
    useEffect(() => {
        setLocalSubmissions(submissions);
    }, [submissions])
    useEffect(() => {
        const fetchEvaluated = async () => {
            try {
                const res = await getEvaluatedSubmission(lastRound.categoryRound);
                setEvaluatedSubmission(res.data);
            } catch (error: any) {
                console.log(error?.response?.data?.message);
            }
        }
        fetchEvaluated();
    }, [])


    const fetchSubmissionDetail = async () => {
        try {
            const subId = evaluatedSubmission?.submissionId || localSubmissions.find(s => s.final)?.submissionId;
            if (!subId) {
                addNotification("Error", "Không tìm thấy bài nộp chính thức nào để xem chi tiết.");
                return;
            }
            const res = await getSubmsisionEvaluatedDetail(subId);
            let detailData = res.data?.data || res.data || res;
            
            let dataArray = [];
            if (Array.isArray(detailData)) {
                dataArray = detailData;
            } else if (detailData) {
                dataArray = [detailData];
            }

            if (dataArray.length === 0) {
                addNotification("Info", "Chưa có chi tiết chấm điểm cho bài nộp này.");
                return;
            }
            
            setAllSubmissionDetails(dataArray);
            setSelectedExpertIndex(0);
            setSubmissionDetail(dataArray[0]);
        } catch (error: any) {
            console.log(error?.response?.data?.message);
            addNotification("Error", error?.response?.data?.message || "Không thể lấy chi tiết bài chấm.");
        }
    }

    const handleSetFinal = async (subId: number) => {
        try {
            await chooseFinalSubmission(subId);
            addNotification("Success", "Đã đánh dấu bài nộp là bản chính thức (Final)!");
            setLocalSubmissions(prev => prev.map(s => ({
                ...s,
                final: s.submissionId === subId
            })));
        } catch (error: any) {
            addNotification("Error", error.response?.data?.message || "Lỗi khi chọn bản Final");
        }
    };
    const handleSendAppeal = async () => {
        if (!appealMessage.trim()) return;
        setIsAppealModalOpen(false);
        setAppealPhase('processing');
        try {
            await sendAppeal(lastRound.roundId, appealMessage);
            setAppealPhase('completed');
        } catch (error: any) {
            setAppealPhase('idle');
            addNotification("Info", error.response?.data?.message || "Lỗi khi gửi khiếu nại");
        }
    };

    const handleSendSupport = async () => {
        if (!supportMessage.trim()) return;
        setIsSupportModalOpen(false);
        setAppealPhase('processing');
        try {
            await sendRequestMentor(lastRound.roundId, supportMessage);
            setAppealPhase('completed');
            setSupportMessage("");
        } catch (error: any) {
            setAppealPhase('idle');
            addNotification("Info", error.response?.data?.message || "Lỗi khi gửi yêu cầu");
        }
    };

    useEffect(() => {
        const deadlineStr = lastRound.SubmissionDeadline;
        if (!deadlineStr) {
            setTimeLeft('--:--:--');
            return;
        }

        const calculateTimeLeft = () => {
            const deadline = new Date(deadlineStr).getTime();
            const now = new Date().getTime();
            const difference = deadline - now;

            if (difference <= 0) {
                setTimeLeft("Hết hạn nộp bài");
                setIsExpired(true);
                return;
            }

            const d = Math.floor(difference / (1000 * 60 * 60 * 24));
            const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((difference % (1000 * 60)) / 1000);

            const format = (val: number) => val.toString().padStart(2, '0');
            setTimeLeft(`${format(d)}d ${format(h)}h ${format(m)}m ${format(s)}s`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [lastRound]);

    useEffect(() => {
        if (!lastRound.StartTime || !lastRound.EndTime) return;
        const start = new Date(lastRound?.StartTime).getTime();
        const end = new Date(lastRound?.EndTime).getTime();
        const now = new Date().getTime();
        if (now < start) {
            setProgress(0);
        } else if (now > end) {
            setProgress(100);
        } else {
            setProgress(((now - start) / (end - start)) * 100);
        }
    }, [status]);

    return (
        <div className="min-h-screen bg-[#F7F8FC] p-4 sm:p-8 font-sans text-slate-900 rounded-4xl selection:bg-[#F26F21]/30">
            <LoadingOverlay phase={appealPhase} setPhase={setAppealPhase} />
            <motion.div
                key="state-joined"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6 max-w-300 mx-auto pb-10"
            >
                <motion.div variants={itemVariants} className="bg-white rounded-[20px] p-8 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100/50">
                    <div className="absolute inset-0 bg-linear-to-br from-orange-50/80 via-white to-violet-50/30 opacity-70"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F26F21]/5 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="text-[10px] font-bold text-[#F26F21] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100/50 flex items-center gap-1.5 shadow-sm">
                                    <Target className="w-3 h-3" />
                                    {status?.eventName}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${status?.rounds?.[0]?.roundStatus === 'ONGOING' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' : status?.rounds?.[0]?.roundStatus === 'UPCOMING' ? 'bg-amber-50 text-amber-700 border-amber-100/50' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                    {lastRound.roundStatus}
                                    {/* {status?.rounds?.[0]?.roundStatus === 'ONGOING' ? 'Live Phase' : status?.rounds?.[0]?.roundStatus === 'UPCOMING' ? 'Pending' : 'Completed'} */}
                                </span>
                                <div className="flex gap-3">

                                    <button
                                        onClick={() => setIsSupportModalOpen(true)}
                                        className="ml-auto text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                                    >
                                        <LifeBuoy className="w-3.5 h-3.5" />
                                        Yêu cầu hỗ trợ
                                    </button>
                                    <p
                                        className="ml-auto text-[11px] font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-full border border-violet-200 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                                    >
                                        <LucideActivitySquare className="w-3.5 h-3.5" />
                                        Trạng thái đội đấu: {lastRound.status}
                                    </p>

                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                                {lastRound.roundName}
                            </h1>
                            <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
                                hạng mục thi đấu: <span className="text-[#F26F21]">{status?.categoryName}</span>
                            </p>

                            {/* Progress Bar under title */}
                            <div className="mt-8 pt-6 border-t border-slate-100 w-full max-w-md">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                    <span>Tiến độ vòng đấu</span>
                                    <span className="text-[#F26F21]">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                                        className="h-full bg-[#F26F21] rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                                    ></motion.div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
                            <div className="bg-white/60 backdrop-blur-md p-4 rrounded-2xl border border-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 text-slate-400 shadow-sm">
                                    <Calendar className="w-4 h-4 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Start Date</p>
                                    <p className="text-sm font-semibold text-slate-800">{lastRound.StartTime ? new Date(lastRound.StartTime).toLocaleDateString() : '--'}</p>
                                </div>
                            </div>
                            <div className="bg-white/60 backdrop-blur-md p-4 rrounded-2xl border border-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 text-slate-400 shadow-sm">
                                    <Calendar className="w-4 h-4 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">End Date</p>
                                    <p className="text-sm font-semibold text-slate-800">{lastRound.EndTime ? new Date(lastRound.EndTime).toLocaleDateString() : '--'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Minimalist Countdown Timer */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[20px] p-8 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Thời gian còn lại
                            </span>
                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                                <Clock className={`w-4 h-4 ${isExpired ? 'text-slate-400' : 'text-[#F26F21]'}`} />
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            <span className={`text-3xl sm:text-4xl font-light tracking-tight tabular-nums whitespace-nowrap ${isExpired ? 'text-red-400 font-semibold' : 'text-slate-800'}`}>
                                {timeLeft}
                            </span>
                            <p className="text-xs text-slate-400 font-medium mt-3 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                Hạn chót {lastRound.SubmissionDeadline ? new Date(lastRound.SubmissionDeadline).toLocaleDateString() : '--'}
                            </p>
                        </div>
                    </motion.div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <motion.div variants={itemVariants} className="bg-white rounded-[20px] p-8 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <GitPullRequest className="w-4 h-4 text-orange-500" />
                                        Current Build
                                    </div>
                                    <span className="text-[10px] bg-slate-50 text-slate-500 font-bold uppercase px-2.5 py-1 rounded-md border border-slate-200">
                                        Đang chờ
                                    </span>
                                </div>

                                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 font-mono text-xs text-slate-500 flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-slate-700 font-bold text-[11px]">#a1b2c3d</span>
                                        <span className="text-[11px]">Initial scaffold</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-3.5 h-3.5 text-slate-300" />
                                        <span className="text-[11px]">Awaiting final submission...</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/team/submission', {
                                    state: {
                                        eventId: status.eventID,
                                        roundId: lastRound.roundId,
                                        eventCurrentStatus: status
                                    }
                                })}
                                className="mt-6 w-full bg-[#F26F21] hover:brightness-110 text-white text-xs font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.3)] active:scale-[0.98]"
                            >
                                Nộp Bài
                                <ArrowRight className="w-3.5 h-3.5 opacity-90" />
                            </button>
                        </motion.div>

                        <motion.div variants={itemVariants} className={`bg-white rounded-[20px] p-8 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative ${submissionDetail ? 'z-50' : 'z-10'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Kết quả chấm bài
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100/50">
                                    {evaluatedSubmission?.totalScore > 0 ? "Đã chấm" : "Chưa chấm"}
                                </span>
                            </div>

                            <div className="flex-1 flex items-center justify-center gap-6">
                                <div className="relative w-20 h-20 flex flex-col items-center justify-center shrink-0">
                                    <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                                        <path
                                            className="text-slate-50"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <motion.path
                                            initial={{ strokeDasharray: `0, 100` }}
                                            animate={{ strokeDasharray: `${evaluatedSubmission?.totalScore || 0}, 100` }}
                                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                                            className="text-[#F26F21] drop-shadow-[0_2px_4px_rgba(79,70,229,0.3)]"
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <div className="relative z-10 flex flex-col items-center justify-center pt-1">
                                        <span className="text-shadow-lg font-bold text-slate-800 leading-none">{evaluatedSubmission?.totalScore == null ? "--" : evaluatedSubmission?.totalScore}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Hạng hiện tại: {evaluatedSubmission?.rank == null ? "Chưa có hạng" : evaluatedSubmission?.rank}
                                </div>
                            </div>
                            <button
                                onClick={() => submissionDetail ? setSubmissionDetail(null) : fetchSubmissionDetail()}
                                className="mt-6 w-full backdrop-blur-xl bg-orange-50/40 border border-orange-200/50 shadow-[0_8px_32px_0_rgba(79,70,229,0.1)] text-[#F26F21] hover:bg-orange-50 text-xs font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                {submissionDetail ? 'Đóng chi tiết bài chấm' : 'Xem chi tiết bài chấm'}
                            </button>

                            <AnimatePresence>
                                {submissionDetail && (
                                    <motion.div
                                        key="detail-popup"
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className="absolute right-full top-1/2 -translate-y-1/2 w-full mt-4 z-100"
                                    >
                                        <div className="relative overflow-hidden bg-gray-300 backdrop-blur-2xl backdrop-saturate-[1.8] rounded-4xl p-6 border border-white/60 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] ring-1 ring-white/40">
                                            <div className="absolute inset-0 bg-linear-to-br from-white/70 via-white/10 to-transparent pointer-events-none" />
                                            <div className="relative z-10 flex flex-col gap-4">
                                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Award className="w-5 h-5 text-orange-500" />
                                                        <h4 className="text-sm font-bold text-slate-800">Chi tiết tiêu chí</h4>
                                                    </div>
                                                    {allSubmissionDetails.length > 1 && (
                                                        <CustomSelect
                                                            options={allSubmissionDetails.map((_, idx) => ({ value: idx, label: `Giám khảo ${idx + 1}` }))}
                                                            value={selectedExpertIndex}
                                                            onChange={(val) => {
                                                                setSelectedExpertIndex(Number(val));
                                                                setSubmissionDetail(allSubmissionDetails[Number(val)]);
                                                            }}
                                                            variant="inline"
                                                            className="w-35"
                                                        />
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white/40 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl p-4 border border-white/70 shadow-[0_8px_16px_rgba(0,0,0,0.03)] ring-1 ring-white/40">
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 opacity-80">Tổng điểm</p>
                                                        <p className="text-2xl font-black text-[#F26F21] tracking-tight">{submissionDetail?.totalScore}</p>
                                                    </div>
                                                    <div className="bg-white/40 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl p-4 border border-white/70 shadow-[0_8px_16px_rgba(0,0,0,0.03)] ring-1 ring-white/40">
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 opacity-80">Trạng thái</p>
                                                        <p className="text-sm font-bold text-slate-700 mt-1.5">{submissionDetail.status}</p>
                                                    </div>
                                                    {submissionDetail.comment && (
                                                        <div className="col-span-2 bg-white/40 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl p-4 border border-white/70 shadow-[0_8px_16px_rgba(0,0,0,0.03)] ring-1 ring-white/40">
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 opacity-80">Nhận xét chung</p>
                                                            <p className="text-sm text-slate-700 font-medium leading-relaxed">{submissionDetail.comment}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-4 mt-2 max-h-80 overflow-y-auto custom-scrollbar pr-2 pb-2">
                                                    {submissionDetail.listEvaluationDetail?.length > 0 ? (
                                                        submissionDetail.listEvaluationDetail.map((detail, idx) => (
                                                            <div key={idx} className="bg-white/40 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl p-4 border border-white/70 shadow-[0_8px_16px_rgba(0,0,0,0.03)] ring-1 ring-white/40 transition-all hover:bg-white/50">
                                                                <div className="flex justify-between items-start mb-2 gap-1">
                                                                    <h5 className="font-bold text-sm text-slate-800">{detail.criteriaName}</h5>
                                                                    <span className="bg-white/60 text-[#F26F21] font-bold px-3 py-1 rounded-full text-xs shadow-sm border border-white/80 backdrop-blur-md text-nowrap">
                                                                        {detail.score} đ
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-600 mb-3 leading-relaxed font-medium">{detail.criteriaDescription}</p>
                                                                {detail.comment && (
                                                                    <div className="bg-white/50 backdrop-blur-md rounded-xl p-3 border border-white/60 shadow-inner">
                                                                        <p className="text-[11px] text-slate-600 italic">"{detail.comment}"</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-slate-500 text-center py-2">Không có chi tiết</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                <div className="flex gap-6 ">
                    <motion.div variants={itemVariants} className="w-3/5 bg-white rounded-[20px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60">
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-orange-500" />
                            <h3 className="text-sm font-bold text-slate-900">Các bài đã nộp</h3>
                        </div>
                        <div className="space-y-6">
                            {localSubmissions && localSubmissions.length > 0 ? (
                                localSubmissions.map((sub, i) => {
                                    return (
                                        <div key={sub.submissionId} className="flex gap-2 w-11/12">
                                            <div className="relative flex-col items-center hidden sm:flex mt-2">
                                                <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center z-10 shadow-sm">
                                                    <GitCommit className="w-3.5 h-3.5 text-orange-500" />
                                                </div>
                                                {i !== localSubmissions.length - 1 && <div className="w-0.5 h-full bg-orange-50 absolute top-8"></div>}
                                            </div>
                                            <div className="pb-6 w-full group">
                                                <div className="overflow-hidden flex flex-col gap-3 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-100 group-hover:bg-orange-50/10">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                        <div className="flex flex-wrap items-center gap-2.5">
                                                            <span className="font-bold text-slate-900 text-base">Bài nộp</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleSetFinal(sub.submissionId)}
                                                            className={`group/btn px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${sub.final
                                                                ? 'bg-emerald-500 text-white cursor-default shadow-emerald-500/20'
                                                                : 'bg-white text-slate-500 hover:bg-emerald-500 hover:text-white border border-slate-200 hover:border-emerald-500 hover:shadow-emerald-500/20'}`}
                                                            title={sub.final ? "Bản chính thức (Final)" : "Đánh dấu là bản chính thức (Final)"}
                                                        >
                                                            <CheckCircle className={`w-3.5 h-3.5 transition-colors ${sub.final ? 'text-white' : 'text-slate-400 group-hover/btn:text-white'}`} />
                                                            {sub.final ? 'FINAL' : 'CHỌN FINAL'}
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{new Date(sub.createAt).toLocaleString()}</span>
                                                    </div>

                                                    {(sub.githubUrl || (sub.fileDTOList && sub.fileDTOList.length > 0)) && (
                                                        <div className="mt-2 space-y-2 border-t border-slate-100 pt-3">
                                                            {sub.githubUrl && (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded bg-slate-50 flex items-center justify-center shrink-0">
                                                                        <GitPullRequest className="w-3.5 h-3.5 text-slate-400" />
                                                                    </div>
                                                                    <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-600 hover:text-[#F26F21] hover:underline truncate transition-colors font-medium">
                                                                        {sub.githubUrl}
                                                                    </a>
                                                                </div>
                                                            )}

                                                            {sub.fileDTOList && sub.fileDTOList.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 pt-1">
                                                                    {sub.fileDTOList.map((file, idx) => (
                                                                        <a key={idx} href={file.fileUrl} target="_blank" rel="noreferrer" className="text-[11px] font-medium bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-orange-50 hover:text-[#F26F21] hover:border-orange-200 transition-all flex items-center gap-1.5">
                                                                            <CheckSquare className="w-3.5 h-3.5 text-orange-400" />
                                                                            {file.fileName}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-sm text-slate-500 text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                                        <GitCommit className="w-6 h-6 text-slate-300" />
                                    </div>
                                    Chưa có bài nộp nào
                                </div>
                            )}
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="w-2/5 bg-white rounded-[20px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-orange-500" />
                                <h3 className="text-sm font-bold text-slate-900">Tiêu chí Đánh giá</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 flex-1">
                            {lastRound.evaluetionCriteria && lastRound.evaluetionCriteria.length > 0 ? (
                                lastRound.evaluetionCriteria.map((criterion) => (
                                    <div key={criterion.evaluationCriteriaId} className="group p-4 rounded-2xl border border-slate-100 hover:border-orange-100 hover:bg-orange-50/20 transition-colors flex items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center transition-colors border border-slate-100/50 group-hover:border-orange-100 shadow-sm group-hover:shadow-orange-500/10">
                                                <Target className="w-4 h-4 text-slate-500 group-hover:text-[#F26F21] transition-colors" />
                                            </div>
                                            <div className="pr-4">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-sm font-semibold text-slate-900">{criterion.criteriaName}</p>
                                                    <span className="text-[10px] font-bold text-[#F26F21] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100/50">
                                                        Trọng số: {criterion.weight}%
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{criterion.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <Award className="w-6 h-6 text-slate-300 mb-2" />
                                    <p className="text-xs font-semibold text-slate-500">Chưa có tiêu chí đánh giá</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isAppealModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                        >
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Gửi Khiếu Nại</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Vui lòng nhập chi tiết nội dung khiếu nại về kết quả đánh giá của vòng thi này.
                            </p>
                            <textarea
                                value={appealMessage}
                                onChange={(e) => setAppealMessage(e.target.value)}
                                placeholder="Nhập nội dung khiếu nại..."
                                className="w-full h-32 p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none mb-4"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsAppealModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSendAppeal}
                                    disabled={!appealMessage.trim()}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-[#F26F21] hover:brightness-110 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Gửi Khiếu Nại
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSupportModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <LifeBuoy className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Yêu cầu Mentor Hỗ trợ</h3>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">
                                Vui lòng mô tả chi tiết vấn đề hoặc thắc mắc nhóm bạn đang gặp phải trong lúc thi để được hỗ trợ.
                            </p>
                            <textarea
                                value={supportMessage}
                                onChange={(e) => setSupportMessage(e.target.value)}
                                placeholder="Nhập nội dung cần hỗ trợ..."
                                className="w-full h-32 p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none mb-4"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsSupportModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSendSupport}
                                    disabled={!supportMessage.trim()}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-[#F26F21] hover:brightness-110 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Gửi Yêu Cầu
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prize Modal */}
            <AnimatePresence>
                {showPrizeModal && prizes && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.8 }}
                            className="relative w-full max-w-4xl bg-[#fdfdfc] rounded-lg shadow-2xl overflow-hidden text-left"
                        >
                            <style>
                                {`
                                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
                                .font-cursive { font-family: 'Great Vibes', cursive; }
                                .font-lora { font-family: 'Lora', serif; }
                                `}
                            </style>

                            {/* Decorative Watercolor Blobs mimicking floral aesthetic */}
                            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#93c5fd] rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
                            <div className="absolute top-10 -right-10 w-48 h-48 bg-[#6366f1] rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
                            
                            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#7dd3fc] rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
                            <div className="absolute bottom-10 -left-10 w-48 h-48 bg-[#0284c7] rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
                            
                            {/* Subtle paper texture border */}
                            <div className="absolute inset-2 border border-slate-200/60 rounded-md pointer-events-none"></div>
                            <div className="absolute inset-3 border border-slate-100 rounded-sm pointer-events-none"></div>

                            <button
                                onClick={() => setShowPrizeModal(false)}
                                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative z-10 p-6 md:p-10">
                                {/* Logo Area */}
                                <div className="mb-2 flex items-center">
                                    <div className="font-bold text-2xl tracking-tighter text-[#1e3a8a] flex items-center gap-1.5">
                                        <Award className="w-8 h-8 text-[#ef4444]" />
                                        Hackathon
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="text-center mb-6">
                                    <h2 className="text-5xl md:text-7xl text-[#1e3a8a] font-cursive">
                                        Thank You
                                    </h2>
                                </div>

                                {/* Content */}
                                <div className="space-y-3 text-[#334155] text-sm md:text-base leading-relaxed font-lora px-2 md:px-10">
                                    <p>Kính gửi đội thi <span className="font-semibold text-[#0f172a]">{prizes.teamName}</span>,</p>
                                    
                                    <p>Vậy là một mùa giải nữa khép lại, đã đến lúc nhìn lại hành trình tuyệt vời mà chúng ta đã đi qua. Ban tổ chức muốn cảm ơn những đóng góp vô giá của đội bạn. Bởi lẽ, sự sáng tạo và nỗ lực không ngừng nghỉ của các bạn đã tạo nên những dấu ấn ấn tượng trong cuộc thi.</p>
                                    
                                    <p>Điều đó đã giúp sự kiện phát triển không ngừng dẫu cho có sự cạnh tranh khốc liệt. Bất chấp mọi thách thức, các bạn vẫn luôn giữ vững sự tập trung, không để vuột mất cơ hội thể hiện bản lĩnh của mình.</p>
                                    
                                    <p>Đặc biệt chúc mừng đội thi đã xuất sắc giành được danh hiệu <span className="font-semibold text-[#1e3a8a]">{prizes.prizeTitle}</span> (Top {prizes.ranking}) trong {prizes.roundName}. Tôi tin rằng chúng ta sẽ tiếp tục phát huy sự xuất sắc của mình trong tương lai.</p>
                                    
                                    <p>Một bức thư cảm ơn về sự cống hiến của các bạn là không đủ để nói hết. Cuối cùng, xin chúc tất cả các thành viên trong đội một năm học thật nhiều niềm vui, tràn ngập thành công, và sức khỏe dồi dào.</p>
                                </div>

                                {/* Sign-off */}
                                <div className="mt-8 text-right pr-2 md:pr-10 font-lora">
                                    <p className="text-[#475569] mb-1">Trân trọng,</p>
                                    <p className="font-bold text-lg text-[#1e3a8a]">Ban tổ chức {prizes.eventName}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}