import { motion } from 'motion/react'
import {
    Users,
    Trophy,
    Trees,
    Sparkles,
    Rocket,
    FileText,
    Calendar,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Avatar from '../../ui/Avatar';
import type { Member, TeamDetail } from '../../../types/team/TeamDetail';
import { trackingRegistration } from '../../../services/team/teamsService';
import type { RegistrationViewing } from '../../../types/registration/Registration';

interface NoCompetitionProps {
    teamName: string;
    members: Member[];
    slot: number;
    teamDetail: TeamDetail;
}

export default function NoCompetitionProps({
    teamName,
    members,
    slot
}: NoCompetitionProps) {
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState<RegistrationViewing[]>([]);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const res = await trackingRegistration();
                if (res && res.data) {
                    setRegistrations(res.data);
                } else if (Array.isArray(res)) {
                    setRegistrations(res);
                }
            } catch (error) {
            }
        };
        fetchRegistrations();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'PENDING':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle className="w-3.5 h-3.5" />;
            case 'PENDING':
                return <Clock className="w-3.5 h-3.5" />;
            case 'REJECTED':
                return <XCircle className="w-3.5 h-3.5" />;
            default:
                return null;
        }
    };

    return (
        <>
            <motion.div
                key="state-not-joined"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
            >
                <div className="bg-white rounded-3xl border border-brand-outline-variant/60 p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-brand-on-surface-variant font-medium"> <Trees /> </span>
                                <h2 className="text-xl md:text-2xl font-bold text-brand-on-surface">
                                    {teamName}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-brand-primary text-white text-xs font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all cursor-pointer hover:brightness-105 active:scale-95 shrink-0 flex items-center gap-2 animate-pulse"
                        >
                            <Trophy className="w-4 h-4" />
                            Tìm kiêm cuộc thi
                        </button>
                    </div>
                </div>

                {/* Split layout: Members List & Dynamic Announcements */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Danh sách thành viên (Span 6) */}
                    <div className="lg:col-span-6 bg-white rounded-3xl border border-brand-outline-variant/60 p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b pb-4 border-brand-outline-variant/30 mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-brand-on-surface flex items-center gap-2">
                                        <Users className="w-4.5 h-4.5 text-cyan-600" />
                                        Danh sách thành viên ({members.length})
                                    </h3>
                                    <p className="text-[11px] text-brand-on-surface-variant/80">Quản lý các thành viên trong đội hình chiến lược</p>
                                </div>
                            </div>
                            <div className="space-y-3.5">
                                {members.map((m, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-brand-surface rounded-xl border border-brand-outline-variant/25 ">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                src={m.avatarUrl}
                                                name={m.fullName}
                                                className="w-9 h-9 rounded-full object-cover border border-[#c2c6d6]/45 text-[11px]"
                                            />
                                            <div>
                                                <p className="text-xs font-bold text-brand-on-surface">{m.fullName}</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] bg-white font-bold text-brand-secondary border border-brand-outline-variant/30 px-2 py-0.5 rounded">
                                            {m.leader ? 'Leader' : 'Member'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 mt-6 border-t border-brand-outline-variant/20">
                            <p className="text-[10px] text-brand-on-surface-variant/70 italic text-center">
                                Bạn có thể mời thêm tối đa {slot} thành viên khác trong phần cài đặt (Settings).
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Checklist & Featured Competitions (Span 6) */}
                    <div className="h-full lg:col-span-6 flex flex-col gap-3">

                        {/* Registration Tracking */}
                        <div className="h-60/100 bg-white rounded-4xl border border-brand-outline-variant/60 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-4.5 h-4.5 text-brand-secondary" />
                                <h3 className="text-sm font-bold text-brand-on-surface">Đơn đăng ký tham gia</h3>
                            </div>
                            <div className="space-y-3 max-h-75 overflow-y-auto pr-1">
                                {registrations.length > 0 ? (
                                    registrations.map((reg) => (
                                        <div key={reg.registrationId} className="p-3 bg-brand-surface rounded-xl border border-brand-outline-variant/25">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h4 className="text-xs font-bold text-brand-on-surface line-clamp-2">
                                                    {reg.eventName}
                                                </h4>
                                                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getStatusStyle(reg.status)}`}>
                                                    {getStatusIcon(reg.status)}
                                                    {reg.status === 'APPROVED' ? 'Chấp thuận' : reg.status === 'PENDING' ? 'Chờ duyệt' : reg.status === 'REJECTED' ? 'Từ chối' : reg.status}
                                                </span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-[11px] text-brand-on-surface-variant">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span>{reg.teamName} ({reg.teamSize} thành viên)</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-brand-on-surface-variant">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{new Date(reg.registrationDate).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-xs text-brand-on-surface-variant/70">Chưa có đơn đăng ký nào.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Featured Competitions */}
                        <div className="bg-linear-to-br from-orange-50 to-purple-50 rounded-3xl border border-orange-100/50 p-6 shadow-sm relative overflow-hidden flex-1">
                            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                                <Sparkles className="w-32 h-32 text-orange-500" />
                            </div>
                            <div className="relative z-10 flex flex-col">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Rocket className="w-4.5 h-4.5 text-[#F26F21]" />
                                        <h3 className="text-sm font-bold text-orange-900">Sẵn sàng tranh tài?</h3>
                                    </div>
                                    <p className="text-xs text-orange-800/80 mb-4 max-w-[85%] leading-relaxed">
                                        Đội của bạn đã được thành lập. Hãy lướt qua danh sách các sự kiện Hackathon sắp diễn ra để không bỏ lỡ cơ hội!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    )
}