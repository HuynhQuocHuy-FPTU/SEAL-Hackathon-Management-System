import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Trophy, Trash2, Loader2, RotateCcw } from 'lucide-react';
import { getTrashEvent, restoreEvent, permanentDeleteEvent } from '../../services/event/eventService';
import type { Hackathon } from '../../types/hackathonEvent/Hackathon';
import { useNotification } from '../../hook/useNotification';

export default function TrashEventsPage() {
    const [events, setEvents] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotification();

    const [confirmRestoreEventId, setConfirmRestoreEventId] = useState<number | null>(null);
    const [isRestoringEvent, setIsRestoringEvent] = useState(false);

    const [confirmPermanentDeleteId, setConfirmPermanentDeleteId] = useState<number | null>(null);
    const [isPermanentDeleting, setIsPermanentDeleting] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await getTrashEvent();
            setEvents(data?.data || data || []);
        } catch (error) {
            console.error("Error fetching trash events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRestoreEventClick = (eventId: number) => {
        setConfirmRestoreEventId(eventId);
    };

    const executeRestoreEvent = async () => {
        if (confirmRestoreEventId === null) return;

        setIsRestoringEvent(true);
        try {
            await restoreEvent(confirmRestoreEventId);
            addNotification("Success", "Khôi phục sự kiện thành công");
            setEvents(prev => prev.filter(e => e.eventId !== confirmRestoreEventId));
            setConfirmRestoreEventId(null);
        } catch (error: any) {
            console.error(error);
            addNotification("Error", error.response?.data?.message || "Không thể khôi phục sự kiện");
        } finally {
            setIsRestoringEvent(false);
        }
    };

    const handlePermanentDeleteClick = (eventId: number) => {
        setConfirmPermanentDeleteId(eventId);
    };

    const executePermanentDelete = async () => {
        if (confirmPermanentDeleteId === null) return;

        setIsPermanentDeleting(true);
        try {
            await permanentDeleteEvent(confirmPermanentDeleteId);
            addNotification("Success", "Xóa sự kiện vĩnh viễn thành công");
            setEvents(prev => prev.filter(e => e.eventId !== confirmPermanentDeleteId));
            setConfirmPermanentDeleteId(null);
        } catch (error: any) {
            console.error(error);
            addNotification("Error", error.response?.data?.message || "Không thể xóa vĩnh viễn sự kiện");
        } finally {
            setIsPermanentDeleting(false);
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

    return (
        <div className="flex-1 p-6 md:p-10 font-sans text-slate-800 bg-[#f8fafc] min-h-screen relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-125 h-125 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />

            <div className="relative max-w-7xl mx-auto z-10 pb-24">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                            <Trash2 className="w-8 h-8 text-red-500" />
                            Thùng rác
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
                            Các sự kiện đã xóa được lưu trữ ở đây. Bạn có thể khôi phục chúng nếu vô tình xóa.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200/60">
                        <Trophy className="w-4 h-4 text-red-500" />
                        <span>{events.length} Sự kiện trong Thùng rác</span>
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
                ) : events.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white rounded-4xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center"
                    >
                        <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Thùng rác trống</h3>
                        <p className="text-slate-500 text-sm max-w-sm">Không có sự kiện nào đã xoá trong thùng rác.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.4 }}
                                className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative flex flex-col h-full opacity-80 hover:opacity-100"
                            >
                                {/* Top Banner */}
                                <div className="relative h-48 w-full overflow-hidden bg-slate-100 shrink-0 grayscale group-hover:grayscale-0 transition-all duration-500">
                                    <img
                                        src={event.bannerUrl || 'https://via.placeholder.com/800x600?text=Hackathon+Banner'}
                                        alt="Banner"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-slate-900/10 pointer-events-none" />

                                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-widest backdrop-blur-md shadow-sm border border-white/20 ${getStatusStyle(event.status)}`}>
                                        {event.status}
                                    </div>
                                    <button
                                        onClick={() => handleRestoreEventClick(event.eventId)}
                                        className="absolute top-4 right-4 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full backdrop-blur-md transition-colors shadow-sm"
                                        title="Khôi phục sự kiện"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-widest border border-slate-200 mb-2 inline-block">
                                            {event.title || "Hackathon Theme"}
                                        </span>
                                        <h2 className="text-xl font-extrabold text-slate-900 leading-tight mb-2 line-clamp-2">
                                            {event.eventName}
                                        </h2>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-1">
                                        {event.description.introduction || "Không có mô tả cho sự kiện này."}
                                    </p>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-2 text-[10px] shrink-0 pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                            <span className="font-semibold text-slate-700 truncate">
                                                {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100">
                                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                            <span className="font-semibold text-slate-700 truncate">
                                                {event.address || 'Trực tuyến'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handlePermanentDeleteClick(event.eventId)}
                                        className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Xóa vĩnh viễn
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Restore Confirmation Modal */}
            {confirmRestoreEventId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <RotateCcw size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">Khôi phục sự kiện?</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Bạn có chắc chắn muốn khôi phục sự kiện này? Nó sẽ được chuyển lại vào danh sách sự kiện đang hoạt động.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                disabled={isRestoringEvent}
                                onClick={() => setConfirmRestoreEventId(null)}
                                className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                disabled={isRestoringEvent}
                                onClick={executeRestoreEvent}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer disabled:opacity-70"
                            >
                                {isRestoringEvent ? <Loader2 size={16} className="animate-spin" /> : null}
                                {isRestoringEvent ? 'Đang khôi phục...' : 'Khôi phục'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Permanent Delete Confirmation Modal */}
            {confirmPermanentDeleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <Trash2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">Xóa vĩnh viễn?</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Bạn có chắc chắn muốn xóa vĩnh viễn sự kiện này? Hành động này không thể hoàn tác.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                disabled={isPermanentDeleting}
                                onClick={() => setConfirmPermanentDeleteId(null)}
                                className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                disabled={isPermanentDeleting}
                                onClick={executePermanentDelete}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-70"
                            >
                                {isPermanentDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                                {isPermanentDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
