import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Globe, Trophy, Trash2, Loader2, Minus, Ban } from 'lucide-react';
import { getAllEvent, publishEvent, deleteEvent, getEventDetailById, cancelEvent, getYearOfEvents } from '../../services/event/eventService';
import type { Hackathon } from '../../types/hackathonEvent/Hackathon';
import { useNotification } from '../../hook/useNotification';
import EventDetailView from '../../component/eventCoordinator/EventDetailView';
import CustomSelect from '../../component/ui/CustomSelect';

export default function MyEventsPage() {
    const [events, setEvents] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotification();
    const [confirmDeleteEventId, setConfirmDeleteEventId] = useState<number | null>(null);
    const [confirmCancelEventId, setConfirmCancelEventId] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [isDeletingEvent, setIsDeletingEvent] = useState(false);
    const [isCancelingEvent, setIsCancelingEvent] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Hackathon | null>(null);
    const [loadingEventId, setLoadingEventId] = useState<number | null>(null);
    const [years, setYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | ''>('');

    const fetchEvents = async () => {
        try {
            const data = await getAllEvent();
            setEvents(data?.data || data || []);
        } catch (error: any) {
        } finally {
            setLoading(false);
        }
    };

    const fetchYears = async () => {
        try {
            const data: any = await getYearOfEvents();
            const yearList = data?.data || data || [];
            if (Array.isArray(yearList)) {
                setYears(yearList);
            }
        } catch (error: any) {
            console.error("Lỗi lấy danh sách năm:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchYears();
    }, []);

    const handlePublicEvent = async (eventId: number) => {
        try {
            await publishEvent(eventId);
            addNotification("Success", `Công bố sự kiện ${eventId} thành công`);
            fetchEvents();
        } catch (error: any) {
            addNotification("Info", error.response?.data?.message || "Không thể công bố sự kiện");
        }
    };

    const handleEventClick = async (eventId: number) => {
        setLoadingEventId(eventId);
        try {
            const data = await getEventDetailById(eventId);
            setSelectedEvent(data?.data || data || null);
        } catch (error: any) {
            console.error(error.response?.data?.message || "Không thể lấy chi tiết sự kiện");
        } finally {
            setLoadingEventId(null);
        }
    };

    const handleDeleteEventClick = (eventId: number) => {
        setConfirmDeleteEventId(eventId);
    };

    const handleCancelEventClick = (eventId: number) => {
        setConfirmCancelEventId(eventId);
        setCancelReason("");
    };

    const executeCancelEvent = async () => {
        if (confirmCancelEventId === null || !cancelReason.trim()) return;

        setIsCancelingEvent(true);
        try {
            await cancelEvent(confirmCancelEventId, cancelReason);
            addNotification("Success", "Đã hủy sự kiện thành công");
            fetchEvents();
            setConfirmCancelEventId(null);
        } catch (error: any) {
            console.error(error.response?.data?.message || "Không thể hủy sự kiện");
            addNotification("Info", error.response?.data?.message || "Không thể hủy sự kiện");
        } finally {
            setIsCancelingEvent(false);
        }
    };

    const executeDeleteEvent = async () => {
        if (confirmDeleteEventId === null) return;

        setIsDeletingEvent(true);
        try {
            await deleteEvent(confirmDeleteEventId);
            addNotification("Success", "Đã chuyển sự kiện vào thùng rác thành công");
            setEvents(prev => prev.filter(e => e.eventId !== confirmDeleteEventId));
            setConfirmDeleteEventId(null);
        } catch (error: any) {
            console.error(error.response?.data?.message || "Không thể xóa sự kiện");
        } finally {
            setIsDeletingEvent(false);
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

    const filteredEvents = selectedYear
        ? events.filter((e) => e.startDate && new Date(e.startDate).getFullYear() === selectedYear)
        : events;

    return (
        <div className="flex-1 p-6 md:p-10 font-sans text-slate-800 bg-[#f8fafc] min-h-screen relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-125 h-125 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />

            <div className="relative max-w-7xl mx-auto z-10 pb-24">
                {selectedEvent ? (
                    <EventDetailView event={selectedEvent} onBack={() => setSelectedEvent(null)} onRefresh={() => handleEventClick(selectedEvent.eventId)} />
                ) : (
                    <>
                        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight  text-slate-900">
                                    Sự kiện
                                </h1>
                                <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
                                    Quản lý và xem chi tiết tất cả các cuộc thi hackathon bạn đã tạo. Theo dõi trạng thái, tiến độ và thông tin từ AI.
                                </p>
                            </div>
                            <div className="flex gap-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200/60">
                                    <Trophy className="w-4 h-4 text-blue-500" />
                                    <span>{filteredEvents.length} Sự kiện</span>
                                </div>
                                <div className="relative w-48 z-20">
                                    <CustomSelect
                                        value={selectedYear}
                                        onChange={(val) => setSelectedYear(val ? Number(val) : '')}
                                        options={[
                                            { value: '', label: 'Tất cả các năm' },
                                            ...years.map(year => ({ value: year, label: `Năm ${year}` }))
                                        ]}
                                        placeholder="Chọn năm"
                                        className="text-sm font-semibold text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm h-112">
                                        <div className="bg-slate-200 h-48 w-full"></div>
                                        <div className="p-6 flex flex-col justify-between w-full h-full space-y-4">
                                            <div className="space-y-3">
                                                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                            </div>
                                            <div className="h-12 bg-slate-100 rounded-xl w-full mt-auto"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-24 bg-white rounded-4xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center"
                            >
                                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                    <Calendar className="w-10 h-10" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy sự kiện nào</h3>
                                <p className="text-slate-500 text-sm max-w-sm">Không có sự kiện nào cho năm này hoặc bạn chưa tạo sự kiện.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredEvents.map((event, idx) => (event.status !== 'DELETED' &&
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                                        onClick={() => {
                                            if (loadingEventId !== null) return;
                                            handleEventClick(event.eventId);
                                        }}
                                        className={`group bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-blue-200/60 rounded-3xl overflow-hidden transition-all duration-300 relative flex flex-col h-full ${loadingEventId !== null ? 'pointer-events-none' : 'cursor-pointer'}`}
                                    >
                                        <div className="relative h-48 w-full overflow-hidden bg-slate-100 shrink-0">
                                            <img
                                                src={event.bannerUrl || 'https://via.placeholder.com/800x600?text=Hackathon+Banner'}
                                                alt="Banner"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-slate-900/10 pointer-events-none" />

                                            {loadingEventId === event.eventId && (
                                                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                </div>
                                            )}

                                            <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest border border-white/20 shadow-sm backdrop-blur-md ${getStatusStyle(event.status)}`}>
                                                {event.status}
                                            </div>
                                            <div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteEventClick(event.eventId);
                                                    }}
                                                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors shadow-sm"
                                                    title="Chuyển vào thùng rác"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelEventClick(event.eventId);
                                                    }}
                                                    className="absolute top-4 right-14 p-2 bg-white/20 hover:bg-orange-500 text-white rounded-full backdrop-blur-md transition-colors shadow-sm"
                                                    title="Hủy sự kiện"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            </div>

                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="mb-4">
                                                <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-2 bg-blue-50 inline-block px-2 py-1 rounded-md">
                                                    {event.title || "Hackathon"}
                                                </p>
                                                <h2 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                                    {event.eventName}
                                                </h2>
                                            </div>

                                            <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-1">
                                                {event.description.introduction || "Không có mô tả cho sự kiện này. Bạn có thể cập nhật sau trong phần cài đặt."}
                                            </p>

                                            <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600 mb-6 shrink-0">
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                                                    <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                    <span className="truncate">
                                                        {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                                                    </span>
                                                    <Minus className="w-3 h-3 text-blue-500 shrink-0" />
                                                    <span className="truncate">
                                                        {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'TBD'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                                                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                    <span className="truncate">{event.address || 'Trực tuyến'}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 mt-auto shrink-0 pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePublicEvent(event.eventId);
                                                    }}
                                                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group/btn"
                                                >
                                                    <Globe className="w-4 h-4 text-blue-500 group-hover/btn:text-blue-600 transition-colors" />
                                                    Mở cổng đăng ký
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            {confirmDeleteEventId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <Trash2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">Chuyển vào thùng rác?</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Bạn có chắc chắn muốn xóa sự kiện này? Nó sẽ được chuyển vào Thùng rác và có thể được khôi phục sau.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                disabled={isDeletingEvent}
                                onClick={() => setConfirmDeleteEventId(null)}
                                className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                disabled={isDeletingEvent}
                                onClick={executeDeleteEvent}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-70"
                            >
                                {isDeletingEvent ? <Loader2 size={16} className="animate-spin" /> : null}
                                {isDeletingEvent ? 'Đang xóa...' : 'Chuyển vào thùng rác'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {confirmCancelEventId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                <Ban size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mt-1">Hủy sự kiện?</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Bạn có chắc chắn muốn hủy sự kiện này? Vui lòng nhập lý do hủy.
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 mb-6">
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Nhập lý do hủy sự kiện..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none h-24 text-sm"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                disabled={isCancelingEvent}
                                onClick={() => setConfirmCancelEventId(null)}
                                className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                                Đóng
                            </button>
                            <button
                                disabled={isCancelingEvent || !cancelReason.trim()}
                                onClick={executeCancelEvent}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCancelingEvent ? <Loader2 size={16} className="animate-spin" /> : null}
                                {isCancelingEvent ? 'Đang hủy...' : 'Xác nhận hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
