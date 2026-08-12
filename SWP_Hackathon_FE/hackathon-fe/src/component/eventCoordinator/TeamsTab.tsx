import React, { useState } from 'react';
import { Search, Eye, Users, CheckCircle, XCircle, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RegistrationDetailModal from './RegistrationDetailModal';
import { approvedPendingTeam, rejectedPendingTeam } from '../../services/event/registerService';
import { useNotification } from '../../hook/useNotification';
interface TeamsTabProps {
    teams: any[];
    setTeams: React.Dispatch<React.SetStateAction<any[]>>;
    statusFilter?: 'PENDING' | 'APPROVED';
}

export default function TeamsTab({ teams, setTeams, statusFilter = 'PENDING' }: TeamsTabProps) {
    const [searchText, setSearchText] = useState<string>('');
    const [selectedRegistrationId, setSelectedRegistrationId] = useState<number | null>(null);
    const { addNotification } = useNotification();

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: (inputValue?: string) => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });
    const [modalInputValue, setModalInputValue] = useState('');

    const openPromptModal = (title: string, message: string, onConfirm: (inputValue?: string) => void) => {
        setModalConfig({ isOpen: true, title, message, onConfirm });
        setModalInputValue('');
    };

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    const filteredTeams = teams.filter(team => {
        const term = searchText.toLowerCase();
        return team.name?.toLowerCase().includes(term);
    });

    const handleApprove = async (registrationId: number) => {
        try {
            await approvedPendingTeam(registrationId);
            setTeams(prev => prev.filter(t => (t.registrationId || t.id) !== registrationId));
        } catch (error: any) {
            console.log(error.response)
            addNotification("Error", error.response?.data?.message || "Không thể phê duyệt đội");
        }
    };

    const handleReject = (registrationId: number) => {
        openPromptModal("Từ chối đội", "Nhập lý do từ chối:", async (reason) => {
            if (reason && reason.trim() !== '') {
                try {
                    await rejectedPendingTeam(registrationId, reason.trim());
                    setTeams(prev => prev.filter(t => (t.registrationId || t.id) !== registrationId));
                    addNotification("Success", "Đã từ chối đội thành công.");
                } catch (error: any) {
                    console.error(error.response?.data?.message || "Không thể từ chối đội");
                }
            } else {
                addNotification("Error", "Vui lòng nhập lý do từ chối.");
            }
        });
    };

    const handleDisqualify = (registrationId: number) => {
        addNotification("Info", "API loại đội chưa được triển khai");
        console.log("Disqualify team:", registrationId);
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        {statusFilter === 'APPROVED' ? 'Các đội đã duyệt' : 'Đăng ký chờ duyệt'}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        {statusFilter === 'APPROVED' ? 'Xem và quản lý các đội đã được phê duyệt.' : 'Xem xét đơn đăng ký của đội và chi tiết đăng ký.'}
                    </p>
                </div>
                <div className="relative w-full md:w-96">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={16} />
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên đội..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                </div>
            </div>

            {/* List */}
            {filteredTeams.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                        {statusFilter === 'APPROVED' ? 'Không tìm thấy đội nào đã được phê duyệt.' : 'Không tìm thấy đăng ký nào đang chờ duyệt.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredTeams.map(team => (
                        <div key={team.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-400 hover:shadow-md transition-all duration-300">

                            {/* Team Identity */}
                            <div className="flex-[0.8] min-w-40 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-blue-600 font-black text-lg">
                                    {team.name ? team.name.charAt(0).toUpperCase() : 'T'}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{team.name}</h3>
                                </div>
                            </div>

                            {/* Leader Info */}
                            {team.leader && (
                                <div className="flex-[1.2] min-w-50 flex items-center bg-slate-50/50 rounded-xl p-2.5 border border-slate-100/50 mr-auto">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 font-bold text-sm shadow-sm">
                                            {team.leader.fullName ? team.leader.fullName.charAt(0).toUpperCase() : 'L'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/70 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 shadow-sm">Trưởng nhóm</span>
                                                <p className="text-sm font-bold text-slate-700 truncate">{team.leader.fullName}</p>
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1.5">
                                                <span className="font-semibold text-slate-600">{team.leader.studentCode}</span>
                                                {team.leader.major && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                                                        <span className="truncate">{team.leader.major}</span>
                                                    </>
                                                )}
                                                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                                                <span className="truncate">{team.leader.email}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions & Stats */}
                            <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                                {team.teamSize > 0 && (
                                    <div className="bg-slate-50/70 px-3 py-2 rounded-xl border border-slate-100 flex items-center gap-2">
                                        <Users size={14} className="text-slate-400" />
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Thành viên</p>
                                            <p className="text-[11px] font-bold text-slate-700 leading-none">{team.teamSize}</p>
                                        </div>
                                    </div>
                                )}
                                {statusFilter === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(team.registrationId || team.id)}
                                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 hover:border-emerald-300 font-bold p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 group"
                                            title="Phê duyệt"
                                        >
                                            <CheckCircle size={16} className="group-hover:scale-110 transition-transform" />
                                        </button>

                                        <button
                                            onClick={() => handleReject(team.registrationId || team.id)}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 font-bold p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 group"
                                            title="Từ chối"
                                        >
                                            <XCircle size={16} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    </>
                                )}

                                {statusFilter === 'APPROVED' && (
                                    <button
                                        onClick={() => handleDisqualify(team.registrationId || team.id)}
                                        className="bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 hover:border-amber-300 font-bold p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 group"
                                        title="Loại"
                                    >
                                        <Ban size={16} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                )}

                                <button
                                    onClick={() => setSelectedRegistrationId(team.registrationId || team.id)}
                                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center gap-2 group"
                                >
                                    <Eye size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedRegistrationId && (
                <RegistrationDetailModal
                    registrationId={selectedRegistrationId}
                    onClose={() => setSelectedRegistrationId(null)}
                />
            )}

            {/* Prompt Modal */}
            <AnimatePresence>
                {modalConfig.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{modalConfig.title}</h3>
                                <p className="text-sm text-slate-500 mb-6">{modalConfig.message}</p>

                                <div className="mb-6">
                                    <textarea
                                        autoFocus
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                                        rows={3}
                                        placeholder="Nhập lý do..."
                                        value={modalInputValue}
                                        onChange={(e) => setModalInputValue(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => {
                                            modalConfig.onConfirm(modalInputValue);
                                            closeModal();
                                        }}
                                        className="px-5 py-2 text-sm font-bold text-white bg-[#F26F21] hover:brightness-110 rounded-xl transition-colors shadow-sm cursor-pointer"
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
