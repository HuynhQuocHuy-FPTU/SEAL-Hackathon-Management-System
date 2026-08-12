import { useEffect, useState } from 'react';
import { X, Users, UserCheck, Calendar, ShieldAlert, Loader2, Mail, GraduationCap, Hash, Trophy } from 'lucide-react';
import { getPendingTeamDetail } from '../../services/event/registerService';
import type { Registration } from '../../types/registration/Registration';

interface RegistrationDetailModalProps {
    registrationId: number;
    onClose: () => void;
}

export default function RegistrationDetailModal({ registrationId, onClose }: RegistrationDetailModalProps) {
    const [detail, setDetail] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const fetchDetail = async () => {
            try {
                const data = await getPendingTeamDetail(registrationId);
                setDetail(data);
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || 'Không thể tải thông tin đăng ký');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [registrationId]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200);
    };

    if (!registrationId) return null;

    return (
        <div className={`fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div
                className={`bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
            >
                {/* Header (Clean & Minimal) */}
                <div className="bg-white px-6 py-4 flex justify-between items-center shrink-0 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                            <Trophy size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{detail?.eventName || 'Chi tiết đăng ký'}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    #{detail?.registrationId || registrationId}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                            <p className="text-sm font-medium tracking-wide">Đang tải thông tin...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-rose-50 rounded-2xl border border-rose-100">
                            <ShieldAlert className="w-10 h-10 text-rose-400 mb-3" />
                            <p className="text-sm font-semibold text-rose-600">{error}</p>
                        </div>
                    ) : detail ? (
                        <div className="space-y-6">

                            {/* Team Identity Banner */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tên đội</p>
                                    <h3 className="text-xl font-bold text-slate-800">{detail.teamName || 'Đội chưa đặt tên'}</h3>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <Users size={14} className="text-slate-400" />
                                        <span className="text-xs font-semibold text-slate-700">{detail.teamSize || 0} Thành viên</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span className="text-xs font-semibold text-slate-700">{detail.registrationDate ? new Date(detail.registrationDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Roster Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-sm font-bold text-slate-700">Danh sách thành viên</h4>
                                    <div className="h-px flex-1 bg-slate-200"></div>
                                </div>

                                {/* Leader */}
                                {detail.leader && (
                                    <div className="relative bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                        <div className="absolute top-3 right-3 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                                            <UserCheck size={12} />
                                            Trưởng nhóm
                                        </div>

                                        <img src={detail.leader.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(detail.leader.fullName || 'Leader')}&background=f1f5f9&color=64748b`} alt="Avatar" className="w-14 h-14 rounded-full object-cover border border-slate-200" />

                                        <div className="flex-1 text-center sm:text-left min-w-0 pt-1">
                                            <h4 className="text-base font-bold text-slate-800 truncate mb-1">{detail.leader.fullName || 'N/A'}</h4>
                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] font-medium text-slate-500">
                                                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100 truncate"><Mail size={10} className="text-slate-400" /> {detail.leader.email}</span>
                                                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100"><Hash size={10} className="text-slate-400" /> {detail.leader.studentCode}</span>
                                                {detail.leader.major && <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100"><GraduationCap size={10} className="text-slate-400" /> {detail.leader.major}</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Members */}
                                {detail.members && detail.members.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {detail.members.map((member, idx) => (
                                            <div key={idx} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center gap-3 hover:border-slate-300 transition-colors">
                                                <img src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName || 'Member')}&background=f8fafc&color=94a3b8`} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-sm font-bold text-slate-800 truncate mb-0.5">{member.fullName || 'N/A'}</h5>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                                                        <span>{member.studentCode}</span>
                                                        {member.major && <span className="text-slate-300">•</span>}
                                                        {member.major && <span className="truncate">{member.major}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

