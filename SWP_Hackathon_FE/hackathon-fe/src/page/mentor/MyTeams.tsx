import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    UsersRound, Search, RefreshCw, Users, Tag, Hash, Eye, X,
    GraduationCap, BookOpen
} from 'lucide-react';
import type { Team, TeamDetail } from '../../types/mentor/Team';
import { getTeamInfoByExpertId, getTeamDetailByTeamId, getCategoryByEventId } from '../../services/mentor/expertService';

function getInitials(name?: string) {
    if (!name) return 'U';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

const AVATAR_GRADIENTS = [
    'from-blue-500 to-orange-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
];

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    leader: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    member: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    default: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

function getRoleColors(role: string) {
    const key = role?.toLowerCase();
    return ROLE_COLORS[key] ?? ROLE_COLORS['default'];
}

// ─── Team Detail Popup ────────────────────────────────────────────────────────
interface TeamDetailModalProps {
    team: Team;
    onClose: () => void;
}

function TeamDetailModal({ team, onClose }: TeamDetailModalProps) {
    const [detail, setDetail] = useState<TeamDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Gọi API lấy danh sách thành viên chi tiết của 1 nhóm khi Modal vừa bật lên
    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getTeamDetailByTeamId(team.teamId);
                const data = response.data || response;
                setDetail(data);
            } catch {
                setError('Không thể tải chi tiết nhóm.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [team.teamId]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
                >
                    {/* Modal Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-[#0058be] to-[#2170e4] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-extrabold text-sm">
                                {getInitials(team.teamName)}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg leading-tight">{team.teamName}</h3>
                                <p className="text-white/70 text-xs mt-0.5">{team.categoryName} · {team.sizeTeam} thành viên</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-4 p-3 rounded-xl border border-[#e7e8e9]">
                                        <div className="w-10 h-10 rounded-xl bg-[#e7e8e9]" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3.5 w-32 bg-[#e7e8e9] rounded" />
                                            <div className="h-3 w-48 bg-[#e7e8e9] rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="py-10 text-center">
                                <UsersRound className="w-10 h-10 text-[#c2c6d6] mx-auto mb-3" />
                                <p className="text-sm font-semibold text-[#727785]">{error}</p>
                            </div>
                        ) : !detail ? (
                            <div className="py-10 text-center">
                                <UsersRound className="w-10 h-10 text-[#c2c6d6] mx-auto mb-3" />
                                <p className="text-sm font-semibold text-[#727785]">Không có dữ liệu thành viên.</p>
                            </div>
                        ) : (
                            <>
                                {/* Hàm ẩn (IIFE) dùng để gộp nhóm trưởng (leader) và thành viên (members) thành 1 mảng chung để dễ map/hiển thị */}
                                {(() => {
                                    const allMembers = [];
                                    if (detail.leader) {
                                        allMembers.push({ ...detail.leader, isLeader: true });
                                    }
                                    if (detail.members && Array.isArray(detail.members)) {
                                        allMembers.push(...detail.members.map(m => ({ ...m, isLeader: false })));
                                    }
                                    return (
                                        <>
                                            <p className="text-xs font-bold uppercase tracking-widest text-[#727785] mb-3">
                                                Thành viên nhóm ({allMembers.length})
                                            </p>
                                            <div className="space-y-3">
                                                {allMembers.map((member, idx) => {
                                                    const roleColors = getRoleColors(member.isLeader ? 'leader' : 'member');
                                                    const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                                                    return (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className="flex items-center gap-4 p-3.5 rounded-xl border border-[#c2c6d6]/60 hover:border-[#F26F21]/30 hover:bg-[#f3f4f5]/50 transition-all"
                                                        >
                                                            {/* Avatar */}
                                                            {member.avatarUrl ? (
                                                                <img
                                                                    src={member.avatarUrl}
                                                                    alt={member.fullName}
                                                                    className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0 ring-2 ring-white"
                                                                    onError={(e) => {
                                                                        const img = e.currentTarget as HTMLImageElement;
                                                                        img.style.display = 'none';
                                                                        const fallback = img.nextElementSibling as HTMLElement | null;
                                                                        if (fallback) fallback.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div
                                                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold text-xs shadow-sm shrink-0`}
                                                                style={{ display: member.avatarUrl ? 'none' : 'flex' }}
                                                            >
                                                                {getInitials(member.fullName)}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-bold text-[#191c1d] text-sm">{member.fullName}</span>
                                                                    {member.isLeader && (
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${roleColors.bg} ${roleColors.text} border ${roleColors.border}`}>
                                                                            Trưởng nhóm
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                                    {member.email && (
                                                                        <span className="flex items-center gap-1 text-xs text-[#727785]">
                                                                            <GraduationCap className="w-3 h-3 shrink-0" />
                                                                            {member.email}
                                                                        </span>
                                                                    )}
                                                                    {member.major && (
                                                                        <span className="flex items-center gap-1 text-xs text-[#727785]">
                                                                            <BookOpen className="w-3 h-3 shrink-0" />
                                                                            {member.major}
                                                                        </span>
                                                                    )}
                                                                    {member.studentCode && (
                                                                        <span className="flex items-center gap-1 text-xs text-[#727785]">
                                                                            <Hash className="w-3 h-3 shrink-0" />
                                                                            {member.studentCode}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    );
                                })()}
                            </>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-3.5 bg-[#f8f9fa] border-t border-[#c2c6d6] flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 text-xs font-bold text-[#727785] bg-white border border-[#c2c6d6] rounded-xl hover:bg-[#e7e8e9] transition-all"
                        >
                            Đóng
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyTeamsTab() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [eventName, setEventName] = useState<string>('');
    const [roundName, setRoundName] = useState<string>('');
    const [selectedRound, setSelectedRound] = useState<string>('all');
    const [availableRounds, setAvailableRounds] = useState<string[]>([]);

    // Hàm fetchTeams: Lấy danh sách các nhóm mà Mentor quản lý
    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            // Bước 1: Lấy thông tin user (accountId) từ LocalStorage
            const savedUser = localStorage.getItem('user');
            const accountId = savedUser ? JSON.parse(savedUser).accountId : null;
            if (accountId) {
                // Bước 2: Gọi API lấy sự kiện (Event) mà Mentor này đang tham gia
                const { getHistoryByAccountId } = await import('../../services/mentor/expertService');
                const eventsData = await getHistoryByAccountId(accountId);
                const eventsArray = Array.isArray(eventsData) ? eventsData : [];
                
                if (eventsArray.length > 0 && eventsArray[0].eventId) {
                    const eventId = eventsArray[0].eventId;
                    setEventName(eventsArray[0].eventName || '');
                    
                    // Bước 3: Lấy danh sách các vòng thi (Round) của Sự kiện đó để làm bộ lọc (Filter)
                    try {
                        const roundsData = await getCategoryByEventId(eventId);
                        const roundsArray = Array.isArray(roundsData) ? roundsData : [];
                        const uniqueRounds = Array.from(new Set(roundsArray.map((r: any) => r.roundName))).filter(Boolean);
                        if (uniqueRounds.length > 0) {
                            setRoundName(uniqueRounds.join(' & '));
                            setAvailableRounds(uniqueRounds as string[]);
                        } else {
                            const rName = eventsArray[0].roundName || '';
                            setRoundName(rName);
                            setAvailableRounds(rName ? [rName] : []);
                        }
                    } catch (error) {
                        const rName = eventsArray[0].roundName || '';
                        setRoundName(rName);
                        setAvailableRounds(rName ? [rName] : []);
                    }

                    // Bước 4: Sau khi có eventId, gọi API để lấy danh sách các Nhóm mà Mentor này phụ trách
                    const data = await getTeamInfoByExpertId(eventId);
                    setTeams(Array.isArray(data) ? data : []);
                    return;
                }
            }
            setTeams([]);
        } catch {
            setTeams([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    // Lọc danh sách nhóm dựa trên: (1) Thanh tìm kiếm, và (2) Dropdown chọn vòng thi
    const filtered = teams.filter(t => {
        const q = search.toLowerCase();
        // Kiểm tra xem tên nhóm hoặc tên hạng mục có chứa từ khoá tìm kiếm không
        const matchSearch = t.teamName.toLowerCase().includes(q) || t.categoryName.toLowerCase().includes(q);
        // Kiểm tra xem vòng thi của nhóm có khớp với vòng thi được chọn ở Dropdown không ('all' là lấy hết)
        const matchRound = selectedRound === 'all' || t.roundName === selectedRound;
        return matchSearch && matchRound;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#F26F21]/10 border border-[#F26F21]/20 rounded-xl">
                        <UsersRound className="text-[#F26F21] w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-[#191c1d] font-bold text-xl tracking-tight">Nhóm của tôi</h1>
                        <p className="text-[#727785] text-sm mt-0.5">
                            Các nhóm được phân công trong sự kiện:{' '}
                            <span className="font-bold text-[#F26F21]">
                                {eventName || 'N/A'} {roundName ? `- ${roundName}` : ''}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-[#c2c6d6] rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                        <UsersRound className="w-4 h-4 text-[#F26F21]" />
                        <span className="text-sm font-bold text-[#191c1d]">{teams.length}</span>
                        <span className="text-xs text-[#727785]">nhóm</span>
                    </div>
                    <div className="bg-white border border-[#c2c6d6] rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                        <Users className="w-4 h-4 text-[#6b38d4]" />
                        <span className="text-sm font-bold text-[#191c1d]">
                            {teams.reduce((acc, t) => acc + (t.sizeTeam || 0), 0)}
                        </span>
                        <span className="text-xs text-[#727785]">thành viên</span>
                    </div>
                </div>
            </div>

            {/* Search + Filter + Refresh (Khu vực Tìm kiếm & Lọc) */}
            {/* Đây là khu vực thanh công cụ nằm trên bảng, cho phép người dùng gõ từ khóa tìm kiếm (lưu vào biến 'search') 
                hoặc chọn vòng thi (lưu vào biến 'selectedRound'). Bất cứ khi nào 2 biến này thay đổi, mảng 'filtered' 
                ở trên sẽ tự động được tính toán lại ngay lập tức (Reactive) mà không cần gọi API. */}
            <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727785]" />
                    <input
                        id="my-teams-search"
                        type="text"
                        placeholder="Tìm kiếm theo tên nhóm, hạng mục hoặc ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-[#c2c6d6] rounded-xl text-sm text-[#191c1d] placeholder-[#727785] focus:outline-none focus:border-[#F26F21] focus:ring-2 focus:ring-[#0058be]/10 transition-all"
                    />
                </div>
                {availableRounds.length > 1 && (
                    <select
                        value={selectedRound}
                        onChange={(e) => setSelectedRound(e.target.value)}
                        className="w-full md:w-auto px-4 py-2 bg-white border border-[#c2c6d6] rounded-xl text-sm text-[#191c1d] focus:outline-none focus:border-[#F26F21] focus:ring-2 focus:ring-[#0058be]/10 transition-all shadow-sm"
                    >
                        <option value="all">Tất cả vòng thi</option>
                        {availableRounds.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                )}
                <button
                    id="refresh-teams-btn"
                    onClick={fetchTeams}
                    className="p-2 w-full md:w-auto flex items-center justify-center bg-white border border-[#c2c6d6] rounded-xl hover:border-[#F26F21] hover:bg-[#F26F21]/5 text-[#727785] hover:text-[#F26F21] transition-all shadow-sm"
                    title="Làm mới"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Table Card (Bảng Danh sách Nhóm) */}
            <div className="bg-white border border-[#c2c6d6] rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-[#c2c6d6] bg-[#f3f4f5] flex items-center gap-2">
                    <UsersRound className="w-4 h-4 text-[#F26F21]" />
                    <h2 className="text-sm font-bold text-[#191c1d] uppercase tracking-wide">Nhóm được phân công</h2>
                    {/* Hiển thị số lượng nhóm thoả mãn điều kiện lọc / Tổng số nhóm */}
                    <span className="ml-auto bg-[#F26F21]/10 text-[#F26F21] text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {filtered.length} / {teams.length}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-[#f8f9fa] border-b border-[#c2c6d6]">
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#727785] whitespace-nowrap">
                                    <div className="flex items-center gap-1.5"><Hash className="w-3 h-3" /> ID</div>
                                </th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#727785]">
                                    <div className="flex items-center gap-1.5"><Users className="w-3 h-3" /> Nhóm</div>
                                </th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#727785] text-center">
                                    Thành viên
                                </th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#727785]">
                                    <div className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> Hạng mục</div>
                                </th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#727785] text-center">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c2c6d6]/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-8 bg-[#e7e8e9] rounded" /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[#e7e8e9]" />
                                                <div className="h-4 w-28 bg-[#e7e8e9] rounded" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center"><div className="h-6 w-12 bg-[#e7e8e9] rounded-full mx-auto" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-32 bg-[#e7e8e9] rounded-full" /></td>
                                        <td className="px-6 py-4 text-center"><div className="h-7 w-16 bg-[#e7e8e9] rounded-lg mx-auto" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                /* Trạng thái Empty: Khi mảng filtered rỗng (không tìm thấy nhóm nào) */
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <UsersRound className="w-10 h-10 text-[#c2c6d6] mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-[#727785]">Không tìm thấy nhóm nào</p>
                                        <p className="text-xs text-[#c2c6d6] mt-1">Hãy thử điều chỉnh từ khóa tìm kiếm.</p>
                                    </td>
                                </tr>
                            ) : (
                                /* Render dữ liệu thật: Duyệt qua mảng 'filtered' và in ra từng dòng (<tr>) */
                                filtered.map((team, idx) => {
                                    // Tạo màu gradient nền ngẫu nhiên cho Avatar dựa trên index của mảng
                                    const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                                    return (
                                        <motion.tr
                                            key={team.teamId}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className="hover:bg-[#f3f4f5]/50 transition-colors group"
                                        >
                                            {/* ID */}
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs font-bold text-[#727785] bg-[#e7e8e9] px-2 py-0.5 rounded border border-[#c2c6d6]/60">
                                                    #{team.teamId}
                                                </span>
                                            </td>

                                            {/* Team Name */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold text-xs shadow-sm shrink-0`}>
                                                        {getInitials(team.teamName)}
                                                    </div>
                                                    <span className="font-bold text-[#191c1d] text-sm group-hover:text-[#F26F21] transition-colors">
                                                        {team.teamName}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Members count */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center gap-1 bg-[#F26F21]/8 text-[#F26F21] border border-[#F26F21]/20 text-xs font-bold px-3 py-1 rounded-full">
                                                    <Users className="w-3 h-3" />
                                                    {team.sizeTeam}
                                                </span>
                                            </td>

                                            {/* Category */}
                                            <td className="px-6 py-4">
                                                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                                                    {team.categoryName}
                                                </span>
                                            </td>

                                            {/* View button */}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    id={`view-team-${team.teamId}`}
                                                    onClick={() => setSelectedTeam(team)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#F26F21] bg-[#F26F21]/8 border border-[#F26F21]/25 rounded-lg hover:bg-[#F26F21] hover:text-white transition-all shadow-sm"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Xem
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!loading && filtered.length > 0 && (
                    <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#c2c6d6] flex items-center justify-between">
                        <p className="text-xs text-[#727785]">
                            Đang hiển thị <span className="font-bold text-[#191c1d]">{filtered.length}</span> /{' '}
                            <span className="font-bold text-[#191c1d]">{teams.length}</span> nhóm
                        </p>
                        <p className="text-xs text-[#727785]">
                            Tổng số thành viên:{' '}
                            <span className="font-bold text-[#F26F21]">
                                {filtered.reduce((acc, t) => acc + (t.sizeTeam || 0), 0)}
                            </span>
                        </p>
                    </div>
                )}
            </div>

            {/* Detail Modal (Hộp thoại xem chi tiết) */}
            {/* Khi người dùng click nút "Xem" ở bảng, biến 'selectedTeam' sẽ được gán giá trị của nhóm đó. 
                Đoạn code dưới đây kiểm tra nếu 'selectedTeam' có dữ liệu (!= null) thì mới render cái Modal ra màn hình. */}
            {selectedTeam && (
                <TeamDetailModal
                    team={selectedTeam}
                    onClose={() => setSelectedTeam(null)}
                />
            )}
        </motion.div>
    );
}
