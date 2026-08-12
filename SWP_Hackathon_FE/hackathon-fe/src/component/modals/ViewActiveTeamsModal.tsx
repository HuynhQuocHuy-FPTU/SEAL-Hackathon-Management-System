import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Clock, Search, ShieldCheck } from 'lucide-react';
import { getActiveTeams, joinTeam, viewRequestJoinTeamStatus } from '../../services/team/teamActiveListService';
import type { TeamActiveResponse, TeamJoinRequest, TeamJoinRequestStatus } from '../../types/team/TeamActive';
import { useNotification } from '../../hook/useNotification';
import { useAuthContext } from '../../hook/useAuthContext';
import { useNavigate } from 'react-router-dom';

interface ViewActiveTeamsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDark?: boolean;
}

export default function ViewActiveTeamsModal({ isOpen, onClose, isDark = false }: ViewActiveTeamsModalProps) {
    const [teams, setTeams] = useState<TeamActiveResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [reasonText, setReasonText] = useState('');
    const [showSentRequests, setShowSentRequests] = useState(false);
    const [sentRequests, setSentRequests] = useState<TeamJoinRequestStatus[]>([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const { user } = useAuthContext();

    const fetchSentRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const data = await viewRequestJoinTeamStatus();
            setSentRequests(Array.isArray(data) ? data : ((data as any)?.data || []));
        } catch (error: any) {
            addNotification("Info", error.response?.data?.message || "Không thể lấy danh sách lời mời đã gửi");
        } finally {
            setIsLoadingRequests(false);
        }
    };

    useEffect(() => {
        if (showSentRequests && isOpen) {
            fetchSentRequests();
        }
    }, [showSentRequests, isOpen]);
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    useEffect(() => {
        if (isOpen) {
            const fetchTeams = async () => {
                setIsLoading(true);
                try {
                    const data = await getActiveTeams();
                    const teamList = Array.isArray(data) ? data : ((data as any)?.data || []);
                    setTeams(teamList);
                } catch (error) {

                } finally {
                    setIsLoading(false);
                }
            };
            fetchTeams();
        }
    }, [isOpen]);

    const hanldeJoinTeam = async (teamId: number, reason: TeamJoinRequest) => {
        try {
            if (user == null) {
                navigate("/login");
            }
            await joinTeam(teamId, reason);
            addNotification("Success", "Yêu cầu tham gia đã được gửi thành công");
            setSelectedTeamId(null);
            setReasonText('');
        } catch (error: any) {
            addNotification("Info", error?.response?.data?.reason || error?.response?.data?.message);
        }
    }

    const filteredTeams = teams.filter(team =>
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.leaderName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: 1.5 }}
                        exit={{ opacity: 0.5 }}
                        className="fixed inset-0 bg-black/15 z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0.3, x: '100%' }}
                        animate={{ opacity: 1.5, x: 0 }}
                        exit={{ opacity: 0.5, x: '100%' }}
                        transition={{ type: "tween", bounce: 0, duration: 0.3 }}
                        className={`fixed right-0 top-0 h-full w-full max-w-md flex flex-col shadow-2xl z-50 overflow-hidden ${isDark ? 'bg-[#0f172a] border-l border-white/10' : 'bg-white border-l border-slate-200'
                            }`}
                    >
                        {/* Header */}
                        <div className={`p-6 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        Các Nhóm Hiện Có
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Danh sách các nhóm đang hoạt động trên hệ thống
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-xl transition-colors cursor-pointer ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                                    }`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search & Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowSentRequests(false)}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${!showSentRequests ? (isDark ? 'text-white bg-linear-to-br from-orange-500 to-pink-500' : 'text-white bg-linear-to-br from-orange-500 to-pink-500') : (isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}
                                >
                                    Các nhóm
                                </button>
                                <button
                                    onClick={() => setShowSentRequests(true)}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${showSentRequests ? (isDark ? 'text-white bg-linear-to-br from-orange-500 to-pink-500' : 'text-white bg-linear-to-br from-orange-500 to-pink-500') : (isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}
                                >
                                    Lời mời đã gửi
                                </button>
                            </div>

                            {showSentRequests ? (
                                isLoadingRequests ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : sentRequests.length === 0 ? (
                                    <div className="text-center py-20">
                                        <Clock className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
                                        <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            Bạn chưa gửi lời mời nào
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {sentRequests.map(req => (
                                            <div key={req.requestId} className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{req.teamName}</h3>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                        req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                                                        req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {req.status === 'PENDING' ? 'Đang chờ' : req.status === 'ACCEPTED' ? 'Chấp nhận' : req.status === 'REJECTED' ? 'Từ chối' : req.status}
                                                    </span>
                                                </div>
                                                <p className={`text-sm mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}><span className="font-semibold">Lý do:</span> {req.reason || 'Không có lý do'}</p>
                                                <div className={`text-xs flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(req.createdAt).toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <>
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên nhóm hoặc trưởng nhóm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-11 pr-4 py-3 rounded-2xl outline-none transition-all ${isDark
                                            ? 'bg-white/5 border-white/10 text-white focus:border-blue-500'
                                            : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                        } border`}
                                />
                            </div>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : filteredTeams.length === 0 ? (
                                <div className="text-center py-20">
                                    <Users className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
                                    <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Không tìm thấy nhóm nào
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    {filteredTeams.map(team => (
                                        <div
                                            key={team.teamId}
                                            className={`p-5 rounded-2xl border transition-all flex flex-col ${isDark
                                                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                                                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                        {team.teamName}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        {team.leaderName} (Leader)
                                                    </div>
                                                </div>
                                                <div className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {team.memberNames.length + 1} / {team.maxTeamSize}
                                                </div>
                                            </div>

                                            <div className="space-y-3 mt-auto">
                                                <div>
                                                    <p className={`text-xs font-medium mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        Thành viên
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {team.memberNames.filter(name => name !== team.leaderName).map((name, idx) => (
                                                            <span key={idx} className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                                                                }`}>
                                                                {name}
                                                            </span>
                                                        ))}
                                                        {team.memberNames.length <= 1 && (
                                                            <span className={`text-[11px] italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                Chưa có thành viên
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`flex items-center gap-1.5 text-xs pt-3 border-t ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-100 text-slate-400'
                                                    }`}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Ngày tạo: {new Date(team.createAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 mt-4">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => {
                                                            if (selectedTeamId === team.teamId) {
                                                                setSelectedTeamId(null);
                                                                setReasonText('');
                                                            } else {
                                                                setSelectedTeamId(team.teamId);
                                                                setReasonText('');
                                                            }
                                                        }}
                                                        className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${isDark ? 'bg-linear-to-br from-red-500 to-orange-500 text-white hover:bg-blue-500' : 'bg-linear-to-br from-red-500 to-orange-500 text-white hover:bg-blue-500'}`}
                                                    >
                                                        Tham gia
                                                    </button>
                                                </div>
                                                <AnimatePresence>
                                                    {selectedTeamId === team.teamId && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className={`p-3 rounded-xl mt-2 border ${isDark ? 'bg-[#1e293b] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                                                <textarea
                                                                    value={reasonText}
                                                                    onChange={(e) => setReasonText(e.target.value)}
                                                                    placeholder="Nhập lý do tham gia nhóm..."
                                                                    className={`w-full text-sm p-2.5 rounded-lg outline-none resize-none h-20 ${isDark ? 'bg-black/20 text-white placeholder-slate-500' : 'bg-white text-slate-700 placeholder-slate-400 border border-slate-200 focus:border-blue-500'}`}
                                                                />
                                                                <div className="flex justify-end mt-2 gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedTeamId(null);
                                                                            setReasonText('');
                                                                        }}
                                                                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                                                                    >
                                                                        Hủy
                                                                    </button>
                                                                    <button
                                                                        onClick={() => hanldeJoinTeam(team.teamId, { reason: reasonText })}
                                                                        disabled={!reasonText.trim()}
                                                                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-[#F26F21] text-white hover:bg-blue-500' : 'bg-[#F26F21] text-white hover:bg-blue-500'}`}
                                                                    >
                                                                        Xác nhận
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
