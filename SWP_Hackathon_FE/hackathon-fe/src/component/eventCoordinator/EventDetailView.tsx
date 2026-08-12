import { useState, useRef, useEffect } from 'react';
import { RefreshCw, ArrowLeft, Calendar, MapPin, Trophy, Target, FileText, Users, Clock, AlertCircle, Upload, Settings, CheckSquare, MoreVertical, LucideCircleChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import type { Hackathon } from '../../types/hackathonEvent/Hackathon';
import { completeWorkshop, cancelWorkshop, updateDeadlineRound, updateEventTime } from '../../services/event/eventService';
import type { RoundTimeData, EventTimeRequest } from '../../types/hackathonEvent/Hackathon';
import { useNotification } from '../../hook/useNotification';
import AssignCategoryView from './AssignCategoryView';
import RoundParticipantsView from './RoundParticipantsView';
import EvaluationAuditLogView from './EvaluationAuditLogView';

interface EventDetailViewProps {
    event: Hackathon;
    onBack: () => void;
    onRefresh?: () => void;
}

export default function EventDetailView({ event, onBack, onRefresh }: EventDetailViewProps) {
    const [activeView, setActiveView] = useState<'overview' | 'assign-category' | 'participants' | 'audit-log'>('overview');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedRound, setSelectedRound] = useState<{ id: number, name: string } | null>(null);
    const [editingRoundId, setEditingRoundId] = useState<number | null>(null);
    const [roundEditData, setRoundEditData] = useState<RoundTimeData>({
        startDate: '',
        endDate: '',
        submissionDeadline: '',
        evaluationDeadline: '',
        resolveAppealDeadline: ''
    });
    const [isEditingEventTime, setIsEditingEventTime] = useState(false);
    const [eventTimeData, setEventTimeData] = useState<EventTimeRequest>({
        registrationDeadline: '',
        workshopTime: '',
        startTime: '',
        endTime: ''
    });
    const menuRef = useRef<HTMLDivElement>(null);
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCompleteWorkshop = async () => {
        setIsMenuOpen(false);
        try {
            await completeWorkshop(event.eventId);
            addNotification("Success", "Đã hoàn thành workshop thành công");
        } catch (error: any) {
            addNotification("Warning", error.response?.data?.message || "Không thể hoàn thành workshop");
        }
    };

    const handleViewParticipants = (roundId: number, roundName: string) => {
        setSelectedRound({ id: roundId, name: roundName });
        setActiveView('participants');
    };

    const handleCancelWorkshop = async () => {
        setIsMenuOpen(false);
        try {
            await cancelWorkshop(event.eventId);
            addNotification("Success", "Đã hủy workshop thành công");
        } catch (error: any) {
            addNotification("Warning", error.response?.data?.message || "Không thể hủy workshop");
        }
    };

    const formatForDateInput = (dateString: string | undefined | null) => {
        if (!dateString) return '';
        return dateString.substring(0, 16);
    };

    const handleEditRound = (round: any) => {
        setEditingRoundId(round.roundId);
        setRoundEditData({
            startDate: round.startDate ? formatForDateInput(round.startDate) : '',
            endDate: round.endDate ? formatForDateInput(round.endDate) : '',
            submissionDeadline: round.submissionDeadline ? formatForDateInput(round.submissionDeadline) : '',
            evaluationDeadline: round.evaluationDeadline ? formatForDateInput(round.evaluationDeadline) : '',
            resolveAppealDeadline: round.resolveAppealDeadline ? formatForDateInput(round.resolveAppealDeadline) : ''
        });
    };

    const handleCancelEditRound = () => {
        setEditingRoundId(null);
    };

    const handleEditEventTime = () => {
        setEventTimeData({
            registrationDeadline: event.registrationDeadline ? formatForDateInput(event.registrationDeadline) : '',
            workshopTime: event.workshopTime ? formatForDateInput(event.workshopTime) : '',
            startTime: event.startDate ? formatForDateInput(event.startDate) : '',
            endTime: event.endDate ? formatForDateInput(event.endDate) : '',
        });
        setIsEditingEventTime(true);
    };

    const handleSaveEventTime = async () => {
        try {
            const convertToLocalDateTime = (dateStr: string) => {
                if (!dateStr) return '';
                if (dateStr.includes('T')) {
                    if (dateStr.length === 16) return `${dateStr}:00`;
                    return dateStr;
                }
                return `${dateStr}T00:00:00`;
            };

            const dataToUpdate: EventTimeRequest = {
                registrationDeadline: convertToLocalDateTime(eventTimeData.registrationDeadline),
                workshopTime: convertToLocalDateTime(eventTimeData.workshopTime),
                startTime: convertToLocalDateTime(eventTimeData.startTime),
                endTime: convertToLocalDateTime(eventTimeData.endTime)
            };
            await updateEventTime(event.eventId, dataToUpdate);
            addNotification("Success", "Cập nhật thời gian sự kiện thành công");
            setIsEditingEventTime(false);
            window.location.reload();
        } catch (error: any) {
            addNotification("Warning", error.response?.data?.message || "Không thể cập nhật thời gian");
        }
    };

    const handleSaveRoundTime = async (roundId: number) => {
        try {
            const convertToLocalDateTime = (dateStr: string) => {
                if (!dateStr) return '';
                if (dateStr.includes('T')) {
                    if (dateStr.length === 16) return `${dateStr}:00`;
                    return dateStr;
                }
                return `${dateStr}T00:00:00`;
            };

            const dataToUpdate = {
                startDate: convertToLocalDateTime(roundEditData.startDate),
                endDate: convertToLocalDateTime(roundEditData.endDate),
                submissionDeadline: convertToLocalDateTime(roundEditData.submissionDeadline),
                evaluationDeadline: convertToLocalDateTime(roundEditData.evaluationDeadline),
                resolveAppealDeadline: convertToLocalDateTime(roundEditData.resolveAppealDeadline)
            };
            await updateDeadlineRound(roundId, dataToUpdate);
            addNotification("Success", "Cập nhật thời gian vòng thi thành công");
            setEditingRoundId(null);
            window.location.reload();
        } catch (error: any) {
            addNotification("Warning", error.response?.data?.message || "Không thể cập nhật thời gian");
        }
    };
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ONGOING': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'ACTIVE': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'COMPLETED': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'DRAFT': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (activeView === 'assign-category') {
        return <AssignCategoryView event={event} onBack={() => setActiveView('overview')} />;
    }

    if (activeView === 'participants' && selectedRound) {
        return <RoundParticipantsView eventId={event.eventId} roundId={selectedRound.id} roundName={selectedRound.name} onBack={() => setActiveView('overview')} />;
    }

    if (activeView === 'audit-log') {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setActiveView('overview')}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors text-xs uppercase tracking-widest px-4 py-2 rounded-full hover:bg-white bg-white/50 border border-slate-200/60 shadow-sm backdrop-blur-sm cursor-pointer w-fit"
                >
                    <ArrowLeft className="w-4 h-4" /> Tổng quan
                </button>
                <EvaluationAuditLogView event={event} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-6"
        >
            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors w-fit px-4 py-2 rounded-xl hover:bg-white bg-transparent border border-transparent hover:border-slate-200/60 shadow-none hover:shadow-sm cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Trở về
                </button>
                <div className="flex items-center gap-3">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="flex items-center gap-2 text-slate-600 bg-white hover:bg-slate-50 hover:text-blue-600 font-semibold text-sm transition-colors w-fit px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Làm mới
                        </button>
                    )}
                    <button
                        onClick={() => setActiveView('assign-category')}
                        className="flex items-center gap-2 text-[#F26F21] bg-orange-50 hover:bg-orange-100 font-semibold text-sm transition-colors w-fit px-5 py-2.5 rounded-xl border border-orange-200 shadow-sm cursor-pointer"
                    >
                        <Target className="w-4 h-4" />
                        Gán hạng mục
                    </button>
                    <button
                        onClick={() => setActiveView('audit-log')}
                        className="flex items-center gap-2 text-orange-600 bg-orange-50 hover:bg-orange-100 font-semibold text-sm transition-colors w-fit px-5 py-2.5 rounded-xl border border-orange-200 shadow-sm cursor-pointer"
                    >
                        <Trophy className="w-4 h-4" />
                        Lịch sử chấm điểm
                    </button>
                    <button
                        onClick={() => navigate('/coordinator/create-event', { state: { isEdit: true, eventId: event.eventId, editData: event } })}
                        className="flex items-center gap-2 text-white bg-[#F26F21] hover:brightness-110 font-semibold text-sm transition-colors w-fit px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                    >
                        Cập nhật sự kiện
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden relative">
                <div className="h-64 md:h-80 w-full relative bg-slate-100">
                    <img
                        src={event.bannerUrl || 'https://via.placeholder.com/1200x600?text=Hackathon+Banner'}
                        alt="Event Banner"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/30 to-transparent pointer-events-none" />

                    <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-xs uppercase font-black tracking-widest border border-white/20 shadow-sm backdrop-blur-md ${getStatusStyle(event.status)}`}>
                        {event.status}
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-xs font-extrabold text-blue-400 uppercase tracking-widest mb-2">
                            {event.title || "Hackathon Season"} {event.season && `- ${event.season}`} {event.seasonYear}
                        </p>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                            {event.eventName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-200">
                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                                {' - '}
                                {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'TBD'}
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                                <MapPin className="w-4 h-4 text-rose-400" />
                                {event.address || 'Online'}
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                                <Users className="w-4 h-4 text-emerald-400" />
                                Tối thiểu: {event.minTeam || 'N/A'} đội
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                                <Users className="w-4 h-4 text-emerald-400" />
                                Tối đa: {event.maxTeam || 'N/A'} đội
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                                <Users className="w-4 h-4 text-emerald-400" />
                                đội ({event.minTeamSize}-{event.maxTeamSize} người)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Giới thiệu
                        </h2>
                        <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {event.description?.introduction || "Không có phần giới thiệu."}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-rose-500" />
                                Luật thi đấu
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                                {event.description?.competitionRules?.map((rule, idx) => (
                                    <li key={idx}>{rule}</li>
                                )) || <li>Chưa có luật cụ thể.</li>}
                            </ul>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-emerald-500" />
                                Quyền lợi tham gia
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                                {event.description?.participantBenefits?.map((benefit, idx) => (
                                    <li key={idx}>{benefit}</li>
                                )) || <li>Chưa có quyền lợi cụ thể.</li>}
                            </ul>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                Quy định loại
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                                {event.description?.disqualificationRules?.map((rule, idx) => (
                                    <li key={idx}>{rule}</li>
                                )) || <li>Chưa có quy định loại cụ thể.</li>}
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Right Column: Sidebar info */}
                <div className="space-y-6">
                    {/* Prizes */}
                    <div className="bg-linear-to-br from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-200/60 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <h2 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2 relative z-10">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            Giải thưởng
                        </h2>
                        <div className="space-y-4 relative z-10">
                            {event.description?.prizes?.map((prize, idx) => (
                                <div key={idx} className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-amber-100/50">
                                    <h3 className="font-bold text-amber-900 text-sm">{prize.title}</h3>
                                    <p className="text-amber-700 font-semibold mt-1">{prize.reward}</p>
                                </div>
                            )) || <p className="text-amber-700 text-sm">Chưa có giải thưởng.</p>}
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-orange-500" />
                            Hạng mục thi
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4">
                            {event.categories?.map((cat, idx) => (
                                <span key={idx} className="bg-orange-50 text-[#F26F21] border border-orange-100 px-3 py-1.5 rounded-xl text-sm font-medium">
                                    {cat.categoryName}
                                </span>
                            )) || <span className="text-sm text-slate-500">Chưa có hạng mục thi.</span>}
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Ngày quan trọng</h2>
                            {isEditingEventTime ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEventTime}
                                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm text-xs font-bold"
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        onClick={() => setIsEditingEventTime(false)}
                                        className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-3 py-1.5 rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm text-xs font-bold"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleEditEventTime}
                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm text-xs font-bold"
                                >
                                    Cập nhật
                                </button>
                            )}
                        </div>
                        <div className="w-full h-0.5 bg-blue-300 my-3"></div>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                <span className="text-slate-500">Bắt đầu sự kiện</span>
                                {isEditingEventTime ? (
                                    <input type="datetime-local" value={eventTimeData.startTime} onChange={e => setEventTimeData({ ...eventTimeData, startTime: e.target.value })} className="border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none" />
                                ) : (
                                    <span className="font-semibold text-slate-900">
                                        {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                <span className="text-slate-500">Kết thúc sự kiện</span>
                                {isEditingEventTime ? (
                                    <input type="datetime-local" value={eventTimeData.endTime} onChange={e => setEventTimeData({ ...eventTimeData, endTime: e.target.value })} className="border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none" />
                                ) : (
                                    <span className="font-semibold text-slate-900">
                                        {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'TBD'}
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                <span className="text-slate-500">Hạn đăng ký</span>
                                {isEditingEventTime ? (
                                    <input type="datetime-local" value={eventTimeData.registrationDeadline} onChange={e => setEventTimeData({ ...eventTimeData, registrationDeadline: e.target.value })} className="border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none" />
                                ) : (
                                    <span className="font-semibold text-slate-900">
                                        {event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString() : 'TBD'}
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3 relative">
                                <span className="text-slate-500">Thời gian Workshop</span>
                                <div className="flex items-center gap-1">
                                    {!isEditingEventTime && (
                                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-widest border shadow-sm backdrop-blur-md ${event.workshopStatus === 'COMPLETED' ? 'bg-green-500 text-white border-white/20' : 'bg-orange-500 text-white border-white/20'}`}>
                                            {event.workshopStatus}
                                        </span>
                                    )}
                                    {isEditingEventTime ? (
                                        <input type="datetime-local" value={eventTimeData.workshopTime} onChange={e => setEventTimeData({ ...eventTimeData, workshopTime: e.target.value })} className="border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none" />
                                    ) : (
                                        <span className="font-semibold text-slate-900 ml-1">
                                            {event.workshopTime ? new Date(event.workshopTime).toLocaleDateString() : 'TBD'}
                                        </span>
                                    )}

                                    <div className="relative" ref={menuRef}>
                                        <button
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {isMenuOpen && (
                                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200/60 py-1.5 z-50 overflow-hidden">
                                                <button
                                                    onClick={handleCompleteWorkshop}
                                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                                >
                                                    Hoàn thành Workshop
                                                </button>
                                                <button
                                                    onClick={handleCancelWorkshop}
                                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                >
                                                    Hủy Workshop
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {event.rounds && event.rounds.length > 0 && (
                <div className="w-full bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-500" />
                        Các vòng thi
                    </h2>
                    <div className="space-y-6">
                        {event.rounds.sort((a, b) => a.orderIndex - b.orderIndex).map((round, idx) => (
                            <div key={idx} className="flex flex-col gap-5 p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm relative overflow-hidden">
                                {/* Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
                                    <div>
                                        <div className="flex items-center gap-4 mb-1.5">
                                            <span className="bg-blue-100 text-brand-on-surface-700 text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                <h3 className="font-extrabold text-slate-900 text-xl">{round.roundName}</h3>
                                            </span>
                                            <span className="border border-gray-500/30 bg-white/60 text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                <h3 className="font-extrabold text-emerald-400 text-xl">{round?.status}</h3>
                                            </span>
                                        </div>
                                        {editingRoundId === round.roundId ? (
                                            <div className="flex flex-col sm:flex-row gap-4 mt-3 w-full max-w-xl">
                                                <div className="flex flex-col gap-1.5 flex-1">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" /> Bắt đầu
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        className="bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full px-3 py-2 transition-all hover:border-blue-300 shadow-sm"
                                                        value={roundEditData.startDate}
                                                        onChange={e => setRoundEditData({ ...roundEditData, startDate: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5 flex-1">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" /> Kết thúc
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        className="bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block w-full px-3 py-2 transition-all hover:border-blue-300 shadow-sm"
                                                        value={roundEditData.endDate}
                                                        onChange={e => setRoundEditData({ ...roundEditData, endDate: e.target.value })}
                                                    />
                                                </div>

                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                <div className="flex items-center gap-1.5 bg-blue-50/50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100/50 shadow-sm">
                                                    <Calendar className="w-4 h-4 text-blue-500" />
                                                    <span className="font-semibold text-sm">
                                                        {new Date(round.startDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <span className="text-slate-400 font-medium">-</span>
                                                <div className="flex items-center gap-1.5 bg-blue-50/50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100/50 shadow-sm">
                                                    <Calendar className="w-4 h-4 text-blue-500" />
                                                    <span className="font-semibold text-sm">
                                                        {new Date(round.endDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs font-bold items-center">
                                        {editingRoundId === round.roundId ? (
                                            <>
                                                <button
                                                    onClick={() => handleSaveRoundTime(round.roundId)}
                                                    className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                                                >
                                                    Lưu
                                                </button>
                                                <button
                                                    onClick={handleCancelEditRound}
                                                    className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-3 py-1.5 rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                                                >
                                                    Hủy
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleEditRound(round)}
                                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                                            >
                                                Cập nhật
                                            </button>
                                        )}
                                        <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1.5">
                                            <Upload className="w-4 h-4" />
                                            {round.submissionType}
                                        </span>
                                        <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                                            <Trophy className="w-4 h-4" />
                                            Top {round.topN}
                                        </span>
                                        <button
                                            onClick={() => handleViewParticipants(round.roundId, round.roundName)}
                                            className="bg-orange-100 text-[#F26F21] hover:bg-orange-200 px-3 py-1.5 rounded-xl border border-orange-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                                        >
                                            <Users className="w-4 h-4" />
                                            Các đội tham gia
                                        </button>
                                        <button
                                            onClick={() => onRefresh && onRefresh()}
                                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                                            title="Làm mới dữ liệu vòng thi"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Làm mới
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    {round.description || 'No description provided.'}
                                </p>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                    {/* Rules & Submission Settings */}
                                    <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                            <Settings className="w-4.5 h-4.5 text-orange-500" />
                                            Quy định & Thiết lập
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                                <span className="text-slate-500 font-medium">Quy định đi tiếp</span>
                                                <span className="font-bold text-slate-800 text-right">{round.advancementRule || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                                <span className="text-slate-500 font-medium flex items-center gap-2">Hạn nộp bài</span>
                                                {editingRoundId === round.roundId ? (
                                                    <input
                                                        type="datetime-local"
                                                        className="bg-white border border-slate-200 text-slate-800 text-xs rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-46.25 px-2.5 py-1.5 transition-all shadow-sm hover:border-orange-300"
                                                        value={roundEditData.submissionDeadline}
                                                        onChange={e => setRoundEditData({ ...roundEditData, submissionDeadline: e.target.value })}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200/60 shadow-sm">
                                                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                                                        <span className="font-bold text-xs">{round.submissionDeadline ? new Date(round.submissionDeadline).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                                <span className="text-slate-500 font-medium flex items-center gap-2">Hạn đánh giá</span>
                                                {editingRoundId === round.roundId ? (
                                                    <input
                                                        type="datetime-local"
                                                        className="bg-white border border-slate-200 text-slate-800 text-xs rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-46.25 px-2.5 py-1.5 transition-all shadow-sm hover:border-orange-300"
                                                        value={roundEditData.evaluationDeadline}
                                                        onChange={e => setRoundEditData({ ...roundEditData, evaluationDeadline: e.target.value })}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200/60 shadow-sm">
                                                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                                                        <span className="font-bold text-xs">{round.evaluationDeadline ? new Date(round.evaluationDeadline).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                                <span className="text-slate-500 font-medium flex items-center gap-2">Hạn khiếu nại</span>
                                                {editingRoundId === round.roundId ? (
                                                    <input
                                                        type="datetime-local"
                                                        className="bg-white border border-slate-200 text-slate-800 text-xs rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-46.25 px-2.5 py-1.5 transition-all shadow-sm hover:border-orange-300"
                                                        value={roundEditData.resolveAppealDeadline}
                                                        onChange={e => setRoundEditData({ ...roundEditData, resolveAppealDeadline: e.target.value })}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200/60 shadow-sm">
                                                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                                                        <span className="font-bold text-xs">{round.resolveAppealDeadline ? new Date(round.resolveAppealDeadline).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                                <span className="text-slate-500 font-medium">Số file tối đa</span>
                                                <span className="font-bold text-slate-800 text-right">{round.maxFileCount || 'Không giới hạn'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                                <span className="text-slate-500 font-medium">Kích thước tối đa cho 1 file</span>
                                                <span className="font-bold text-slate-800 text-right">10MB</span>
                                            </div>
                                            {round.allowedFileTypes && round.allowedFileTypes.length > 0 && (
                                                <div className="pt-2">
                                                    <span className="text-slate-500 font-medium block mb-2">Định dạng cho phép</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {round.allowedFileTypes.map((ext, i) => (
                                                            <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg font-mono font-bold border border-slate-200/60">{ext}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Criteria */}
                                    <div className="space-y-4 bg-white p-4 h-[80%] rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                                        <div className="flex justify-between items-center mb-1 h-[10%]">
                                            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                                <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                                                Tiêu chí chấm điểm
                                            </h4>
                                            {round.criteriaSetId && (
                                                <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded-md">
                                                    Set ID: {round.criteriaSetId}
                                                </span>
                                            )}
                                        </div>
                                        {round.customCriteriaDetatils && round.customCriteriaDetatils.length > 0 ? (
                                            <div className="space-y-4 flex-1 overflow-y-auto max-h-64 pr-2 h-[90%] custom-scrollbar">
                                                {round.customCriteriaDetatils.map((crit, i) => (
                                                    <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-y-3">
                                                        <div className="flex gap-5 font-bold text-slate-800 text-sm leading-tight">
                                                            <span >
                                                                <LucideCircleChevronRight className="w-4.5 h-4.5 text-pink-500" />
                                                            </span>

                                                            <span >
                                                                {crit.criteriaName}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm" title={crit.description}>
                                                                {crit.description}
                                                            </span>
                                                            <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                                                                {crit.customWeight}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center flex-1 h-32 border-2 border-dashed border-slate-100 rounded-xl">
                                                <p className="text-sm text-slate-400 font-medium">Chưa có tiêu chí cụ thể.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Experts */}
                                {round.categoryExperts && round.categoryExperts.length > 0 && (
                                    <div className="mt-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                                            <Users className="w-4.5 h-4.5 text-rose-500" />
                                            Chuyên gia đánh giá
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4">
                                            {round.categoryExperts.map((catExp, i) => (
                                                <div key={i} className="bg-rose-50/30 rounded-xl p-4 border border-rose-100/50">
                                                    <div className="flex items-center gap-2 border-b border-rose-100 pb-2 mb-3">
                                                        <Target className="w-3.5 h-3.5 text-rose-400" />
                                                        <h5 className="text-xs font-black text-rose-900 uppercase tracking-wider">
                                                            {event.categories?.find(cat => cat.categoryId === catExp.categoryId)?.categoryName}
                                                        </h5>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        {catExp.experts && catExp.experts.map((exp, j) => (
                                                            <div key={j} className="flex justify-between items-center text-sm bg-white px-3 py-2 rounded-lg border border-rose-50 shadow-sm">
                                                                <span className="font-bold text-slate-800 truncate pr-2">{exp.expertName}</span>
                                                                <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-1 rounded-md border border-rose-200 shrink-0">
                                                                    {exp.role}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </motion.div>
    );
}
