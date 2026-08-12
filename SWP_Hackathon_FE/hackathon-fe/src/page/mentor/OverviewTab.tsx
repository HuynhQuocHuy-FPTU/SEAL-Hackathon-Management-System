

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Gavel, CheckCircle2, Database, ArrowRight, PieChart as PieChartIcon, Sparkles } from 'lucide-react';
import type { CategoryRound, Hackathon } from '../../types/mentor/Event';
import type { Request } from '../../types/mentor/Team';
import { motion } from 'motion/react';
import { getCategoryByEventId, getHistoryByAccountId, getReceivedTeamRequestByExpertId } from '../../services/mentor/expertService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
    hackingProgress: number;
    teamRequests: Request[];
    rounds: CategoryRound[];
    events: Hackathon[];
    onNavigateToTab: (tab: string) => void;
}

export function DashboardView({
    hackingProgress,
    teamRequests,
    rounds,
    events,
    onNavigateToTab,
}: DashboardViewProps) {

    const [viewModalEvent, setViewModalEvent] = useState<Hackathon | null>(null);

    // Lọc ra các yêu cầu đang chờ xử lý
    const pendingRequests = teamRequests.filter(r => r.status?.toLowerCase() === 'pending');
    const filteredRequests = pendingRequests.slice(0, 3); // Chỉ lấy 3 yêu cầu đầu tiên để hiển thị trên Dashboard

    // Lọc danh sách sự kiện (chỉ lấy 3 sự kiện đầu tiên)
    const filteredEvents = events.slice(0, 3);

    // Tính toán dữ liệu cho Biểu đồ Donut (Hình vòng tròn)
    const pendingCount = pendingRequests.length;
    
    // Mảng dữ liệu trả về từ API mới chứa sẵn tổng số lượng Yêu cầu Đã Nhận và Đã Từ chối 
    // trong object đầu tiên, để tránh việc phải đếm lại thủ công trên Frontend.
    const firstReq = teamRequests.length > 0 ? (teamRequests[0] as any) : null;
    
    // Nếu API có trả về 'acceptedRequests' thì lấy số đó, ngược lại (fallback) thì sẽ 
    // tự động dùng hàm filter() để đếm thủ công những dòng có status là 'accepted'.
    const acceptedCount = firstReq?.acceptedRequests !== undefined 
        ? firstReq.acceptedRequests 
        : teamRequests.filter(r => r.status?.toLowerCase() === 'accepted').length;
        
    const rejectedCount = firstReq?.rejectedRequests !== undefined 
        ? firstReq.rejectedRequests 
        : teamRequests.filter(r => r.status?.toLowerCase() === 'rejected').length;

    let donutData = [
        { name: 'Đang chờ', value: pendingCount, color: '#f59e0b' },
        { name: 'Đã nhận', value: acceptedCount, color: '#10b981' },
        { name: 'Từ chối', value: rejectedCount, color: '#ef4444' }
    ].filter(item => item.value > 0);

    if (donutData.length === 0) {
        donutData = [{ name: 'Chưa có dữ liệu', value: 1, color: '#e5e7eb' }];
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
            >

                {/* Thẻ hiển thị Tên Sự Kiện hiện tại */}
                {events.length > 0 && events[0].eventName && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6b38d4]/10 to-[#8455ef]/10 border border-[#6b38d4]/20 shadow-sm">
                        <Sparkles className="w-5 h-5 text-[#6b38d4]" />
                        <span className="text-sm font-black tracking-wide uppercase text-[#6b38d4]">
                            Sự kiện hiện tại: {events[0].eventName}
                        </span>
                    </div>
                )}

                {/* Biểu đồ Donut Thống kê Yêu cầu hỗ trợ */}
                <div className="bg-white border border-[#c2c6d6] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#8455ef]/10 rounded-lg">
                                <PieChartIcon className="text-[#6b38d4] w-5 h-5" />
                            </div>
                            <h2 className="text-[#191c1d] font-bold text-lg uppercase tracking-tight">Thống kê Yêu cầu hỗ trợ</h2>
                        </div>
                        <p className="text-[#727785] text-sm mb-6">Tỷ lệ các trạng thái yêu cầu bạn đã xử lý và đang chờ</p>
                        
                        <div className="grid grid-cols-3 gap-4">
                             <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/20 p-4 rounded-xl text-center transition-all hover:shadow-sm">
                                 <p className="text-[#f59e0b] font-extrabold text-3xl">{pendingCount}</p>
                                 <p className="text-[10px] font-bold text-[#727785] uppercase tracking-wider mt-1">Đang chờ</p>
                             </div>
                             <div className="bg-[#10b981]/5 border border-[#10b981]/20 p-4 rounded-xl text-center transition-all hover:shadow-sm">
                                 <p className="text-[#10b981] font-extrabold text-3xl">{acceptedCount}</p>
                                 <p className="text-[10px] font-bold text-[#727785] uppercase tracking-wider mt-1">Đã nhận</p>
                             </div>
                             <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 p-4 rounded-xl text-center transition-all hover:shadow-sm">
                                 <p className="text-[#ef4444] font-extrabold text-3xl">{rejectedCount}</p>
                                 <p className="text-[10px] font-bold text-[#727785] uppercase tracking-wider mt-1">Từ chối</p>
                             </div>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-64 h-56 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {donutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #c2c6d6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#191c1d' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Chữ hiển thị ở chính giữa biểu đồ */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-extrabold text-[#191c1d]">{teamRequests.length}</span>
                            <span className="text-[10px] font-bold text-[#727785] uppercase tracking-wider">Tổng</span>
                        </div>
                    </div>
                </div>

                {/* Bố cục Lưới 2 Cột của Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* CỘT A: Các yêu cầu đang chờ xử lý */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#c2c6d6] flex flex-col h-[520px]">
                        <div className="p-5 border-b border-[#c2c6d6] bg-[#f3f4f5] flex justify-between items-center">
                            <h2 className="text-sm font-bold text-[#191c1d] flex items-center gap-2 uppercase tracking-wide">
                                <span className="w-2.5 h-2.5 bg-[#ba1a1a] rounded-full animate-ping"></span>
                                Yêu cầu chờ xử lý
                            </h2>
                        </div>

                        {/* Danh sách thẻ yêu cầu */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-4">
                            {filteredRequests.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-[#727785] text-center p-6 space-y-2">
                                    <p className="text-sm font-semibold">Không có yêu cầu nào chờ xử lý</p>
                                    <p className="text-xs">Tất cả yêu cầu đã được xử lý hoặc không có kết quả phù hợp.</p>
                                </div>
                            ) : (
                                filteredRequests.map((req) => (
                                    <div
                                        key={req.requestId}
                                        className="bg-[#f8f9fa] border border-[#c2c6d6] hover:border-[#F26F21] rounded-xl p-4 transition-all hover:shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded bg-[#2170e4]/10 text-[#F26F21] flex items-center justify-center font-bold text-sm">
                                                    {req.teamName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#191c1d] text-sm">{req.teamName}</h4>
                                                    <p className="text-[10px] text-[#727785] font-bold uppercase tracking-wider">
                                                        {req.categoryName}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-[#727785] font-mono bg-white px-2 py-0.5 rounded border border-[#c2c6d6]/60">
                                                ID: {req.requestId}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#424754] italic font-sans pl-1 border-l-2 border-[#F26F21]/25 py-0.5 line-clamp-3">
                                            "{req.requestMessage}"
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-[#f3f4f5] border-t border-[#c2c6d6]">
                            <button
                                onClick={() => onNavigateToTab('requests')}
                                className="w-full bg-[#F26F21] hover:bg-[#004e5c] text-white font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm shadow-sm"
                            >
                                <span>XEM TẤT CẢ YÊU CẦU ({pendingRequests.length})</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* CỘT B: Lịch trình Mentoring */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#c2c6d6] flex flex-col h-[520px]">
                        <div className="p-4 border-b border-[#c2c6d6] bg-[#f3f4f5] flex justify-between items-center">
                            <h2 className="text-sm font-bold text-[#191c1d] flex items-center gap-2 uppercase tracking-wide">
                                <Gavel className="text-[#6b38d4] w-4.5 h-4.5" />
                                Lịch trình Mentoring
                            </h2>
                        </div>

                        {/* Danh sách các Vòng thi */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            {rounds && rounds.length > 0 ? (
                                rounds.map((round, index) => (
                                    <div key={`${round.categoryRoundId}-${index}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-px flex-1 bg-[#c2c6d6]"></div>
                                            <h3 className="text-[10px] font-bold text-[#6b38d4] uppercase tracking-wider bg-[#e9ddff]/75 px-2.5 py-1 rounded">
                                                {round.roundName.toLowerCase() === 'first idea pitching' ? 'Vòng 1' :
                                                    round.roundName.toLowerCase() === 'technical mentoring support' ? 'Vòng 2' :
                                                        round.roundName}
                                            </h3>
                                            <div className="h-px flex-1 bg-[#c2c6d6]"></div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="bg-[#ffffff] border border-[#c2c6d6] border-l-4 border-l-[#0058be] rounded-xl p-3 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="text-center bg-[#8455ef]/5 border border-[#8455ef]/20 px-2.5 py-1.5 rounded-lg flex flex-col justify-center">
                                                        <span className="text-[#6b38d4] font-bold text-[10px] uppercase mb-0.5">{round.categoryName}</span>
                                                        <p className="text-[#6b38d4] font-bold font-mono text-[9px] opacity-80 leading-none">
                                                            {round.roundDate ? new Date(round.roundDate).toLocaleDateString('vi-VN') : 'N/A'} - {round.roundEnd ? new Date(round.roundEnd).toLocaleDateString('vi-VN') : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[#191c1d] text-xs">{round.roundName}</h4>
                                                    </div>
                                                </div>
                                                <div className="text-[#6b38d4]">
                                                    <CheckCircle2 size={18} className="fill-[#6b38d4]/10" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-[#727785] text-center py-2">Không có lịch trình mentoring nào</p>
                            )}
                        </div>


                    </div>
                </div>

                {/* 3. Historical Archive Section (Lưu trữ các mùa trước) */}
                {/* Khu vực hiển thị bảng Lịch sử tham gia của Mentor. Dữ liệu lấy từ prop 'events'. 
                    Thay vì hiển thị toàn bộ lịch sử (có thể rất dài), chúng ta dùng 'filteredEvents'
                    đã được cắt ở đầu file (slice(0, 3)) để chỉ hiển thị tối đa 3 sự kiện gần nhất làm Preview. */}
                <div className="bg-white border border-[#c2c6d6] rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-[#c2c6d6] flex justify-between items-center bg-[#f3f4f5]">
                        <h2 className="text-sm font-bold text-[#191c1d] flex items-center gap-2 uppercase tracking-wide">
                            <Database className="text-[#2170e4] w-4.5 h-4.5" />
                            Lưu trữ: Các mùa trước
                        </h2>

                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse font-sans">
                            <thead>
                                <tr className="bg-white text-[#727785] border-b border-[#c2c6d6]">
                                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Mùa</th>
                                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Tên sự kiện</th>
                                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Vòng</th>
                                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Hạng mục</th>
                                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Vai trò</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#c2c6d6]/60">
                                {filteredEvents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-semibold">
                                            Không có dữ liệu sự kiện nào phù hợp
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEvents.map((event, index) => (
                                        <tr key={`${event.eventId}-${index}`} className="hover:bg-[#f3f4f5]/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-[#F26F21] font-bold">{event.season}</td>
                                            <td className="px-6 py-4 font-bold text-[#191c1d]">{event.eventName}</td>
                                            <td className="px-6 py-4 text-[#424754]">{event.roundName}</td>
                                            <td className="px-6 py-4 text-[#424754]">{event.categoryName}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a] px-2 py-1 rounded">
                                                    {event.expertRole}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-white border-t border-[#c2c6d6] text-center">
                        <button
                            onClick={() => onNavigateToTab('past-seasons')}
                            className="text-[#F26F21] text-xs font-bold hover:underline hover:text-[#2170e4]"
                        >
                            XEM TOÀN BỘ LƯU TRỮ
                        </button>
                    </div>
                </div>
            </motion.div>

            {viewModalEvent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setViewModalEvent(null);
                    }}
                >
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-scale-in">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h3 className="font-sans font-bold text-lg text-slate-900">
                                    {viewModalEvent.eventName}
                                </h3>
                                <span className="text-xs font-bold uppercase tracking-wide text-[#F26F21]">
                                    {viewModalEvent.season}
                                </span>
                            </div>
                            <button
                                onClick={() => setViewModalEvent(null)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-all"
                            >
                                <span className="font-bold text-lg leading-none">×</span>
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Tên vòng</h4>
                                    <p className="text-sm text-slate-800 font-medium">
                                        {viewModalEvent.roundName || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Hạng mục</h4>
                                    <p className="text-sm text-slate-800 font-medium">
                                        {viewModalEvent.categoryName || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Vai trò</h4>
                                <span className="inline-block bg-[#ffdad6] text-[#ba1a1a] px-2.5 py-1 rounded-lg text-xs font-bold">
                                    {viewModalEvent.expertRole || 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setViewModalEvent(null)}
                                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function OverviewTab() {
    const navigate = useNavigate();
    const [hackingProgress] = useState(65);
    const [rounds, setRounds] = useState<CategoryRound[]>([]);
    const [teamRequests, setTeamRequests] = useState<Request[]>([]);
    const [events, setEvents] = useState<Hackathon[]>([]);

    const handleNavigateToTab = (tab: string) => {
        if (tab === 'requests') {
            navigate('/mentor/requests');
        } else {
            console.log("Navigate to", tab);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            // Lấy ID tài khoản (accountId) từ dữ liệu lưu trong localStorage
            const savedUser = localStorage.getItem('user');
            const accountId = savedUser ? JSON.parse(savedUser).accountId?.toString() : '';

            let activeEventId = null;

            // Bước 1: Lấy danh sách Sự kiện (Hackathons) mà tài khoản này tham gia (History).
            try {
                if (accountId) {
                    const eventsData = await getHistoryByAccountId(accountId);
                    const eventsArray = Array.isArray(eventsData) ? eventsData : [];
                    setEvents(eventsArray);
                    
                    if (eventsArray.length > 0) {
                        activeEventId = eventsArray[0].eventId;
                    }
                }
            } catch (error) {
                console.error("Error fetching events for expert:", error);
            }

            // Bước 2: Dựa vào Sự kiện đang hoạt động (activeEventId), gọi API lấy danh sách 
            // các Vòng thi (Rounds).
            let fetchedRoundId = 1; // Giá trị mặc định
            if (activeEventId) {
                try {
                    const roundsData = await getCategoryByEventId(activeEventId);
                    const roundsArray = Array.isArray(roundsData) ? roundsData : [];
                    setRounds(roundsArray);
                    if (roundsArray.length > 0 && roundsArray[0].roundId) {
                        fetchedRoundId = roundsArray[0].roundId;
                    }
                } catch (error) {
                    console.error("Error fetching rounds for expert:", error);
                }
            }

            // Bước 3: Dựa vào Round (Vòng thi), lấy danh sách Yêu cầu từ các nhóm (Team Requests)
            try {
                const requestsData = await getReceivedTeamRequestByExpertId(fetchedRoundId);
                setTeamRequests(Array.isArray(requestsData.data) ? requestsData.data : (Array.isArray(requestsData) ? requestsData : []));
            } catch (error) {
                console.error("Error fetching team requests for expert:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <DashboardView
            hackingProgress={hackingProgress}
            teamRequests={teamRequests}
            rounds={rounds}
            events={events}
            onNavigateToTab={handleNavigateToTab}
        />
    );
}
