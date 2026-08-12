import React, { useEffect, useState } from 'react';
import { Search, Filter, MessageSquare, Check, X, Clock, HelpCircle, FileText, AlertCircle, Eye, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import type { Request } from '../../types/mentor/Team';
import type { CategoryRound } from '../../types/mentor/Event';
import { getReceivedTeamRequestByExpertId, acceptTeamRequest, declineTeamRequest, getCategoryByEventId } from '../../services/mentor/expertService';
import { useNotification } from '../../hook/useNotification';

export default function RequestsTab() {
    const [localSearch, setLocalSearch] = useState('');
    const [selectedTrack, setSelectedTrack] = useState<string>('All');
    const [categories, setCategories] = useState<CategoryRound[]>([]);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [queuePage, setQueuePage] = useState(1);
    const [queueSearch, setQueueSearch] = useState('');
    const [queueTrackFilter, setQueueTrackFilter] = useState<string>('All');
    const [queueStatusFilter, setQueueStatusFilter] = useState<string>('All');
    const [viewModalRequest, setViewModalRequest] = useState<Request | null>(null);
    const [teamRequests, setTeamRequests] = useState<Request[]>([]);
    const [currentRoundId, setCurrentRoundId] = useState<number | null>(null);
    const [commentText, setCommentText] = useState('');
    const QUEUE_PAGE_SIZE = 10;

    const { addNotification } = useNotification();
    const showToast = (message: string, type: 'Success' | 'Info' | 'Warning' | 'Error' = 'Info') => {
        addNotification(type, message);
    };

    const fetchTeamRequests = async (roundId?: number) => {
        try {
            // Sử dụng roundId truyền vào, nếu không có thì lấy roundId đã lưu trong state
            const targetRoundId = roundId || currentRoundId;
            if (!targetRoundId) return; // Nếu không có roundId nào thì không gọi API

            if (roundId) setCurrentRoundId(roundId); // Lưu lại roundId để dùng cho các lần gọi sau (khi accept/decline)
            
            const response = await getReceivedTeamRequestByExpertId(targetRoundId);
            const requests = response.data || response;
            setTeamRequests(Array.isArray(requests) ? requests : []);
            if (Array.isArray(requests) && requests.length > 0 && !selectedRequestId) {
                setSelectedRequestId(requests[0].requestId);
            }
        } catch (error) {
            console.error('Error fetching team requests:', error);
        }
    };

    // Luồng dữ liệu (Data Fetching):
    // Giống trang MyTeams, cần lấy ID sự kiện (Event) trước, sau đó lấy danh mục Vòng thi (Categories),
    // cuối cùng mới gọi API lấy danh sách Yêu cầu dựa trên mã Vòng thi đó.
    useEffect(() => {
        const fetchCategoriesAndRequests = async () => {
            try {
                const savedUser = localStorage.getItem('user');
                const accountId = savedUser ? JSON.parse(savedUser).accountId : null;
                if (accountId) {
                    const { getHistoryByAccountId } = await import('../../services/mentor/expertService');
                    const eventsData = await getHistoryByAccountId(accountId);
                    const eventsArray = Array.isArray(eventsData) ? eventsData : [];

                    if (eventsArray.length > 0 && eventsArray[0].eventId) {
                        const fetchedCategories = await getCategoryByEventId(eventsArray[0].eventId);
                        setCategories(fetchedCategories || []);
                        
                        if (fetchedCategories && fetchedCategories.length > 0 && fetchedCategories[0].roundId) {
                            fetchTeamRequests(fetchedCategories[0].roundId);
                            return;
                        }
                        
                        return;
                    }
                }
                setCategories([]);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            }
            // Bỏ đi dòng fallback(1) fix cứng
        };

        fetchCategoriesAndRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Biến lưu trữ từ khóa tìm kiếm cục bộ (chỉ áp dụng ở Frontend)
    const activeSearch = localSearch.toLowerCase();

    // Tìm chi tiết của yêu cầu đang được chọn (click vào)
    const selectedRequest = teamRequests.find(r => r.requestId === selectedRequestId);

    // Lọc danh sách Yêu cầu đang CHỜ XỬ LÝ (PENDING) cho bảng điều khiển bên trái.
    // Kết quả sẽ được sắp xếp theo thời gian tạo cũ nhất lên đầu (FIFO).
    const pendingRequests = teamRequests
        .filter(req => {
            const matchesSearch =
                req.teamName.toLowerCase().includes(activeSearch) ||
                (req.requestMessage || '').toLowerCase().includes(activeSearch) ||
                (req.categoryName || '').toLowerCase().includes(activeSearch);
            const matchesTrack = selectedTrack === 'All' || req.categoryName === selectedTrack;
            return (req.status || '').toLowerCase() === 'pending' && matchesSearch && matchesTrack;
        })
        .sort((a, b) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime());

    // Lọc danh sách LỊCH SỬ HỖ TRỢ (Các yêu cầu Đã Xử Lý) cho bảng bên dưới.
    // Loại bỏ các yêu cầu đang 'PENDING', chỉ lấy 'RESOLVED' hoặc 'REJECTED'.
    // Kết quả được sắp xếp theo thời gian mới nhất lên đầu để dễ theo dõi.
    const queueSearchLower = queueSearch.toLowerCase();
    const processedRequests = teamRequests
        .filter(req => {
            if ((req.status || '').toLowerCase() === 'pending') return false;
            const matchesSearch =
                req.teamName.toLowerCase().includes(queueSearchLower) ||
                (req.requestMessage || '').toLowerCase().includes(queueSearchLower) ||
                (req.categoryName || '').toLowerCase().includes(queueSearchLower);
            const matchesTrack = queueTrackFilter === 'All' || req.categoryName === queueTrackFilter;
            const matchesStatus = queueStatusFilter === 'All' || (req.status || '').toUpperCase() === queueStatusFilter.toUpperCase();
            return matchesSearch && matchesTrack && matchesStatus;
        })
        .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());

    const totalQueuePages = Math.max(1, Math.ceil(processedRequests.length / QUEUE_PAGE_SIZE));
    const paginatedProcessed = processedRequests.slice((queuePage - 1) * QUEUE_PAGE_SIZE, queuePage * QUEUE_PAGE_SIZE);



    // Xử lý sự kiện khi Mentor click nút [Chấp nhận]
    const handleAcceptRequest = async (req: Request) => {
        try {
            await acceptTeamRequest(req.requestId, commentText.trim());
            setCommentText('');
            showToast(`Bạn đã chấp nhận yêu cầu từ nhóm ${req.teamName}!`, 'Success');
            fetchTeamRequests();
        } catch (error) {
            console.error('Failed to accept request:', error);
            showToast('Chấp nhận yêu cầu thất bại', 'Error');
        }
    };

    // Xử lý sự kiện khi Mentor click nút [Từ chối]
    const handleDeclineRequest = async (req: Request) => {
        try {
            await declineTeamRequest(req.requestId, commentText.trim());
            setCommentText('');
            showToast('Đã từ chối yêu cầu.', 'Info');
            fetchTeamRequests();
        } catch (error) {
            console.error('Failed to decline request:', error);
            showToast('Từ chối yêu cầu thất bại', 'Error');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Khu vực Tìm kiếm nhanh & Lọc theo Hạng mục */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4.5 h-4.5 text-slate-500" />
                        <span className="text-xs font-bold text-slate-800 font-geist">Bộ lọc yêu cầu chờ xử lý</span>
                    </div>

                    {/* Ô nhập từ khóa tìm kiếm */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhóm, hạng mục..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0058be] focus:bg-white w-48 md:w-56 transition-all"
                        />
                    </div>
                </div>

                {/* Thanh cuộn (Slider) chọn Hạng mục */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    <button
                        id={`track-filter-All`}
                        onClick={() => setSelectedTrack('All')}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all border ${selectedTrack === 'All'
                            ? 'bg-orange-50 border-orange-200 text-[#F26F21]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        Tất cả
                    </button>
                    {categories.map((category) => (
                        <button
                            id={`track-filter-${category.categoryId}`}
                            key={category.categoryId}
                            onClick={() => setSelectedTrack(category.categoryName)}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all border ${selectedTrack === category.categoryName
                                ? 'bg-orange-50 border-orange-200 text-[#F26F21]'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            {category.categoryName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Giao diện chia đôi: Trái là Danh sách chờ, Phải là Chi tiết yêu cầu */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* Cột trái: Danh sách yêu cầu đang chờ xử lý (chiếm 2/5 màn hình) */}
                <div className="lg:col-span-2 space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                    {pendingRequests.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                            <MessageSquare className="w-10 h-10 stroke-1 mx-auto mb-2 text-slate-300" />
                            <p className="text-xs font-bold text-slate-700">Không có yêu cầu nào chờ xử lý</p>
                            <p className="text-[10px] text-slate-400">Tất cả yêu cầu đã được xử lý</p>
                        </div>
                    ) : (
                        pendingRequests.map((req) => {
                            const isSelected = req.requestId === selectedRequestId;
                            return (
                                <div
                                    id={`request-item-${req.requestId}`}
                                    key={req.requestId}
                                    onClick={() => {
                                        setSelectedRequestId(req.requestId);
                                    }}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left relative ${isSelected
                                        ? 'bg-[#F26F21]/5 border-[#F26F21] shadow-xs'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {/* Dải màu đánh dấu trạng thái (Màu vàng = Chờ xử lý) */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-l-2xl"></div>

                                    <div className="pl-2">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className="text-[10px] font-bold text-[#727785] truncate max-w-[120px] font-geist tracking-wide">
                                                {req.categoryName}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {req.createDate ? new Date(req.createDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                                            </span>
                                        </div>

                                        <h4 className="font-sans font-bold text-xs text-slate-900 mb-1">{req.teamName}</h4>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                                            {req.requestMessage}
                                        </p>

                                        <div className="mt-3 flex justify-between items-center">
                                            <span className="text-[9px] font-black uppercase font-geist px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                                chờ xử lý
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Cột phải: Khu vực xem chi tiết & Ghi chú phản hồi (chiếm 3/5 màn hình) */}
                <div className="lg:col-span-3 max-h-[600px] overflow-y-auto">
                    {selectedRequest ? (
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col space-y-6 shadow-xs h-full">

                            {/* Phần đầu (Tiêu đề nhóm & Trạng thái) */}
                            <div className="border-b border-slate-150 pb-5">
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <div>
                                        <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg font-geist mb-2">
                                            {selectedRequest.categoryName}
                                        </span>
                                        <h3 className="font-sans font-bold text-base text-slate-900">
                                            Yêu cầu từ nhóm - {selectedRequest.teamName}
                                        </h3>
                                    </div>

                                    {/* Hiển thị nút Chấp nhận/Từ chối tùy theo Trạng thái của yêu cầu */}
                                    <div className="flex gap-2">
                                        {selectedRequest.status === 'PENDING' && (
                                            <>
                                                <button
                                                    id="btn-detail-accept"
                                                    onClick={() => handleAcceptRequest(selectedRequest)}
                                                    className="bg-[#F26F21] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl hover:bg-[#004395] transition-all flex items-center gap-1"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Chấp nhận
                                                </button>
                                                <button
                                                    id="btn-detail-decline"
                                                    onClick={() => handleDeclineRequest(selectedRequest)}
                                                    className="bg-white text-slate-700 border border-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1"
                                                >
                                                    <X className="w-3.5 h-3.5" /> Từ chối
                                                </button>
                                            </>
                                        )}
                                        {selectedRequest.status !== 'PENDING' && (
                                            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl ${(selectedRequest.status || '').toUpperCase() === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {(selectedRequest.status || '').toUpperCase() === 'RESOLVED' ? 'Đã chấp nhận' : (selectedRequest.status || '').toUpperCase() === 'REJECTED' ? 'Đã từ chối' : selectedRequest.status}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 border border-slate-150/60 p-4 rounded-2xl italic text-slate-600 text-xs leading-relaxed mt-4">
                                    {selectedRequest.requestMessage}
                                </div>
                            </div>


                            {/* Custom Mentor Advisory input field */}
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-geist uppercase">
                                    <FileText className="w-4 h-4 text-slate-500" /> Chi tiết yêu cầu
                                </h4>
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Hạng mục:</span>
                                        <span className="text-[11px] text-slate-700 font-semibold">{selectedRequest.categoryName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Ngày tạo:</span>
                                        <span className="text-[11px] text-slate-600">
                                            {selectedRequest.createDate ? new Date(selectedRequest.createDate).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Ô nhập tin nhắn nhận xét/lý do từ chối (chỉ hiện khi PENDING) */}
                            {selectedRequest.status === 'PENDING' && (
                                <div className="space-y-3 pt-4 border-t border-slate-150">
                                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-geist uppercase">
                                        <FileText className="w-4 h-4 text-slate-500" /> Nhận xét / Phản hồi
                                    </h4>
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Nhập phản hồi hoặc lý do từ chối (không bắt buộc)..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none h-24"
                                    />
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="h-full bg-slate-50 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                            <HelpCircle className="w-12 h-12 text-slate-300 stroke-1 mb-2 animate-bounce duration-1000" />
                            <p className="font-bold text-xs text-slate-800">Chọn một yêu cầu đang chờ xử lý từ danh sách bên trái</p>
                            <p className="text-[10px] text-slate-400 max-w-xs mt-1">Bạn có thể xem chi tiết, chấp nhận hoặc từ chối các yêu cầu hỗ trợ từ các nhóm.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Bảng Lịch sử Hỗ trợ (Chứa các yêu cầu Đã Xử Lý) */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                {/* Phần Header & Các nút Lọc của Bảng */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-3 md:items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-3 bg-gradient-to-b from-slate-700 to-slate-500 rounded-full" />
                        <h3 className="font-semibold text-sm text-slate-900">Lịch sử hỗ trợ</h3>
                        <span className="text-[10px] text-slate-400 ml-1">({processedRequests.length} đã xử lý)</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm yêu cầu đã xử lý..."
                                value={queueSearch}
                                onChange={(e) => { setQueueSearch(e.target.value); setQueuePage(1); }}
                                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#0058be] w-48 md:w-56"
                            />
                        </div>

                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-600 font-semibold font-geist">HẠNG MỤC:</span>
                            <select
                                value={queueTrackFilter}
                                onChange={(e) => { setQueueTrackFilter(e.target.value); setQueuePage(1); }}
                                className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0058be]"
                            >
                                <option value="All">Tất cả hạng mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.categoryId} value={cat.categoryName}>
                                        {cat.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
                            <button
                                onClick={() => { setQueueStatusFilter('All'); setQueuePage(1); }}
                                className={`px-3 py-1 text-[11px] font-semibold rounded transition-all ${queueStatusFilter === 'All'
                                    ? 'bg-[#F26F21] text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => { setQueueStatusFilter('RESOLVED'); setQueuePage(1); }}
                                className={`px-3 py-1 text-[11px] font-semibold rounded transition-all ${queueStatusFilter === 'RESOLVED'
                                    ? 'bg-[#F26F21] text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                Chấp nhận
                            </button>
                            <button
                                onClick={() => { setQueueStatusFilter('REJECTED'); setQueuePage(1); }}
                                className={`px-3 py-1 text-[11px] font-semibold rounded transition-all ${queueStatusFilter === 'REJECTED'
                                    ? 'bg-[#F26F21] text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                Từ chối
                            </button>
                        </div>
                    </div>
                </div>

                {/* Khung Bảng dữ liệu */}
                <div className="overflow-x-auto">
                    {processedRequests.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-bold text-sm">Chưa có yêu cầu nào được xử lý</p>
                            <p className="text-xs">Các yêu cầu đã chấp nhận hoặc từ chối sẽ hiển thị tại đây</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-6 py-3 text-xs font-bold text-slate-700 uppercase tracking-wide">Nhóm</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-700 uppercase tracking-wide">Hạng mục</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-700 uppercase tracking-wide">Thời gian</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-700 uppercase tracking-wide">Trạng thái</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-700 uppercase tracking-wide">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProcessed.map((req) => (
                                    <tr key={req.requestId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-[#F26F21]">{req.teamName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg inline-block ${req.categoryName === 'AI' ? 'bg-purple-100 text-purple-800' :
                                                req.categoryName === 'Design' ? 'bg-blue-100 text-blue-800' :
                                                    req.categoryName === 'Backend' ? 'bg-purple-100 text-purple-800' :
                                                        req.categoryName === 'Frontend' ? 'bg-blue-100 text-blue-800' :
                                                            req.categoryName === 'Business' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                }`}>
                                                {req.categoryName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-600">
                                                {req.createDate ? new Date(req.createDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[11px] font-bold flex items-center gap-1.5 ${(req.status || '').toUpperCase() === 'RESOLVED' ? 'text-emerald-600' : 'text-red-500'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${(req.status || '').toUpperCase() === 'RESOLVED' ? 'bg-emerald-500' : 'bg-red-400'
                                                    }`}></span>
                                                {(req.status || '').toUpperCase() === 'RESOLVED' ? 'Đã chấp nhận' : (req.status || '').toUpperCase() === 'REJECTED' ? 'Đã từ chối' : req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setViewModalRequest(req)}
                                                className="text-[11px] font-bold text-[#F26F21] hover:underline flex items-center gap-1"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Khu vực Phân trang (Pagination) */}
                {processedRequests.length > QUEUE_PAGE_SIZE && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
                        <span className="text-[11px] text-slate-500">
                            Đang hiển thị {(queuePage - 1) * QUEUE_PAGE_SIZE + 1}–{Math.min(queuePage * QUEUE_PAGE_SIZE, processedRequests.length)} / {processedRequests.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setQueuePage(p => Math.max(1, p - 1))}
                                disabled={queuePage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            {Array.from({ length: totalQueuePages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setQueuePage(page)}
                                    className={`w-7 h-7 text-[11px] font-bold rounded-lg transition-all ${page === queuePage
                                        ? 'bg-[#F26F21] text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setQueuePage(p => Math.min(totalQueuePages, p + 1))}
                                disabled={queuePage === totalQueuePages}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Hộp thoại Popup xem Chi tiết Giao dịch (Transaction Detail Modal) */}
            {viewModalRequest && (
                <TransactionDetailModal
                    request={viewModalRequest}
                    onClose={() => setViewModalRequest(null)}
                />
            )}

        </div>
    );
}

// Component Hộp thoại nội bộ (Inline Component) để thay thế cho file transactionPart.tsx cũ
function TransactionDetailModal({ request, onClose }: { request: Request, onClose: () => void }) {
    // Đóng hộp thoại khi click ra ngoài vùng nền mờ (Backdrop)
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const isAccepted = (request.status || '').toUpperCase() === 'RESOLVED';
    const isDeclined = (request.status || '').toUpperCase() === 'REJECTED';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-scale-in">
                {/* Phần đầu Hộp thoại */}
                <div className={`px-6 py-4 flex items-center justify-between ${isAccepted ? 'bg-emerald-50 border-b border-emerald-100' :
                    isDeclined ? 'bg-red-50 border-b border-red-100' :
                        'bg-slate-50 border-b border-slate-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        {isAccepted ? (
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-500" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-sans font-bold text-sm text-slate-900">
                                {request.teamName}
                            </h3>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${isAccepted ? 'text-emerald-600' : 'text-red-500'
                                }`}>
                                {isAccepted ? 'Đã chấp nhận' : isDeclined ? 'Đã từ chối' : request.status}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-all"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                {/* Phần thân Hộp thoại */}
                <div className="px-6 py-5 space-y-4">
                    {/* Dòng thông tin Hạng mục & Ngày tạo */}
                    <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg inline-block ${request.categoryName === 'AI' ? 'bg-purple-100 text-purple-800' :
                            request.categoryName === 'Design' ? 'bg-blue-100 text-blue-800' :
                                request.categoryName === 'Backend' ? 'bg-purple-100 text-purple-800' :
                                    request.categoryName === 'Frontend' ? 'bg-blue-100 text-blue-800' :
                                        request.categoryName === 'Business' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                            }`}>
                            {request.categoryName}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {request.createDate
                                ? new Date(request.createDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                                : 'N/A'}
                        </span>
                    </div>

                    {/* Nội dung chi tiết của yêu cầu từ nhóm */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide font-geist mb-1.5">
                            Nội dung yêu cầu
                        </h4>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Vòng:</span>
                                <span className="text-[11px] text-slate-700 font-semibold">{request.round}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Mã nhóm:</span>
                                <span className="text-[11px] text-slate-700 font-semibold">{request.teamId}</span>
                            </div>
                            {request.requestMessage && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tin nhắn của nhóm:</span>
                                    <p className="text-[11px] text-slate-700 italic">{request.requestMessage}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nội dung phản hồi của Mentor */}
                    {request.responseMessage && (
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide font-geist mb-1.5">
                                Phản hồi từ Mentor
                            </h4>
                            <div className={`p-3.5 rounded-xl border space-y-2 ${isAccepted ? 'bg-emerald-50 border-emerald-200' : isDeclined ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200/60'}`}>
                                <p className={`text-[11px] font-semibold italic ${isAccepted ? 'text-emerald-800' : isDeclined ? 'text-red-800' : 'text-slate-700'}`}>
                                    "{request.responseMessage}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Phần chân Hộp thoại (Nút Đóng) */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
