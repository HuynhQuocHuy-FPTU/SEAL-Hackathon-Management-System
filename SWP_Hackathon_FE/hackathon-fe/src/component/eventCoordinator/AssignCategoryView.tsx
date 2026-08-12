import { useEffect, useState } from 'react';
import { ArrowLeft, Target, Users, Search, CheckCircle2, ChevronDown, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Hackathon } from '../../types/hackathonEvent/Hackathon';
import type { TeamApprove } from '../../types/registration/Registration';
import { assignTeamCategory, getAllTeamApproved, getDrawResults, updateTeamCategory } from '../../services/event/assignedTeamService';
import { useNotification } from '../../hook/useNotification';

interface AssignCategoryViewProps {
    event: Hackathon;
    onBack: () => void;
}

export default function AssignCategoryView({ event, onBack }: AssignCategoryViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [responseDeadline, setResponseDeadline] = useState<number>(3);
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const { addNotification } = useNotification();

    const [registrations, setRegistrations] = useState<TeamApprove[]>([
    ]);
    const [assignedCategories, setAssignedCategories] = useState<Record<number, number>>({});
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = reg.teamName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || assignedCategories[reg.registrationId] === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const teams = await getAllTeamApproved(event.eventId);
                setRegistrations(teams.data);
                const drawRes = await getDrawResults(event.eventId);
                if (drawRes && drawRes.data) {
                    const mappedCategories: Record<number, number> = {};
                    drawRes.data.forEach((draw: any) => {
                        if (draw.registrationId && Array.isArray(draw.registrationId)) {
                            draw.registrationId.forEach((regId: number) => {
                                mappedCategories[regId] = draw.categoryId;
                            });
                        }
                    });
                    setAssignedCategories(mappedCategories);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
                addNotification("Error", "Không thể lấy dữ liệu phân nhóm.");
            }
        }
        fetchData();
    }, [event.eventId]);

    const handleAssign = (registrationId: number, categoryId: number) => {
        setAssignedCategories(prev => ({
            ...prev,
            [registrationId]: categoryId
        }));
        setOpenDropdownId(null);
    };

    const handleSaveChanged = async () => {
        setIsSaving(true);
        try {
            const groupedByCat = Object.entries(assignedCategories).reduce((acc, [regId, catId]) => {
                if (!acc[catId]) acc[catId] = [];
                acc[catId].push(Number(regId));
                return acc;
            }, {} as Record<number, number[]>);

            const drawResults = Object.entries(groupedByCat).map(([categoryId, registrationIds]) => ({
                categoryId: Number(categoryId),
                registrationId: registrationIds,
            }));
            await assignTeamCategory(event.eventId, responseDeadline, drawResults);
            addNotification("Success", "Lưu thay đổi thành công!");
        } catch (error: any) {
            addNotification("Error", error.response?.data?.message || "Có lỗi xảy ra khi lưu thay đổi");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const groupedByCat = Object.entries(assignedCategories).reduce((acc, [regId, catId]) => {
                if (!acc[catId]) acc[catId] = [];
                acc[catId].push(Number(regId));
                return acc;
            }, {} as Record<number, number[]>);

            const drawResults = Object.entries(groupedByCat).map(([categoryId, registrationIds]) => ({
                categoryId: Number(categoryId),
                registrationId: registrationIds,
            }));
            await updateTeamCategory(event.eventId, drawResults);
            addNotification("Success", "Cập nhật thành công!");
        } catch (error: any) {
            addNotification("Error", error.response?.data?.message || "Có lỗi xảy ra khi cập nhật");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-6 pb-24"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors w-fit px-4 py-2 rounded-xl hover:bg-white bg-transparent border border-transparent hover:border-slate-200/60 shadow-none hover:shadow-sm cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Trở về
                </button>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/60 shadow-sm">
                        <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Thời hạn phản hồi (phút):</label>
                        <input
                            type="number"
                            min="1"
                            value={responseDeadline}
                            onChange={(e) => setResponseDeadline(Number(e.target.value))}
                            className="w-12 text-sm font-bold text-slate-800 focus:outline-none focus:text-blue-600 bg-transparent text-center"
                        />
                    </div>
                    <span className="text-sm font-semibold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm">
                        Đã gán: <span className="text-blue-600">{Object.keys(assignedCategories).length}/{registrations.length}</span>
                    </span>
                    <button
                        onClick={handleSaveChanged}
                        disabled={isSaving || isUpdating}
                        className="flex items-center gap-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold text-sm transition-colors w-fit px-5 py-2 rounded-xl shadow-sm cursor-pointer disabled:opacity-70 border border-slate-200"
                        title="Dùng khi tạo/lưu"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={isSaving || isUpdating}
                        className="flex items-center gap-2 text-white bg-[#F26F21] hover:brightness-110 font-semibold text-sm transition-colors w-fit px-5 py-2 rounded-xl shadow-md cursor-pointer disabled:opacity-70"
                        title="Dùng để cập nhật lại các gán ghép"
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                        Gán hạng mục dự thi
                    </h1>
                    <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                        Phân bổ các đội đã được duyệt vào các hạng mục thi đấu tương ứng. Việc phân loại sẽ giúp hệ thống quản lý danh sách dự thi tốt hơn.
                    </p>
                </div>

                {/* Categories Summary */}
                <div className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div
                        onClick={() => setSelectedCategory('all')}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${selectedCategory === 'all' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                    >
                        <div className="text-3xl font-black text-slate-900 mb-1">{registrations.length}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tất cả đội</div>
                    </div>
                    {event.categories?.map(cat => {
                        const count = Object.values(assignedCategories).filter(id => id === cat.categoryId).length;
                        const isSelected = selectedCategory === cat.categoryId;
                        return (
                            <div
                                key={cat.categoryId}
                                onClick={() => setSelectedCategory(cat.categoryId)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${isSelected ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                            >
                                <div className="text-3xl font-black text-[#F26F21] mb-1">{count}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider line-clamp-2" title={cat.categoryName}>
                                    {cat.categoryName}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên đội hoặc trưởng nhóm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Registrations List */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
                    <table className="w-full text-left border-collapse min-w-200">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/60">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Thông tin đội</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Trưởng nhóm</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/12 text-center">Thành viên</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Hạng mục</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredRegistrations.length > 0 ? (
                                filteredRegistrations.map((reg) => (
                                    <tr key={reg.registrationId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-100 to-orange-100 flex items-center justify-center shrink-0 border border-blue-200/50 shadow-sm">
                                                    <Users className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm mb-0.5">{reg.teamName}</div>
                                                    <div className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md inline-block">ID: #{reg.teamName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* <div className="text-sm font-bold text-slate-700 mb-0.5">{reg.leader.studentName}</div>
                                            <div className="text-xs font-medium text-slate-500">{reg.leader.studentId}</div> */}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1 rounded-lg border border-slate-200/60">
                                                {/* {reg.teamSize} */}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 relative">
                                            <div className="relative w-full">
                                                <button
                                                    onClick={() => setOpenDropdownId(openDropdownId === reg.registrationId ? null : reg.registrationId)}
                                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all shadow-sm ${assignedCategories[reg.registrationId]
                                                        ? 'bg-orange-50 border-orange-200 text-[#F26F21] hover:bg-orange-100/50'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <span className="truncate pr-2">
                                                        {assignedCategories[reg.registrationId]
                                                            ? event.categories?.find(c => c.categoryId === assignedCategories[reg.registrationId])?.categoryName
                                                            : 'Chọn hạng mục...'}
                                                    </span>
                                                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openDropdownId === reg.registrationId ? 'rotate-180' : ''}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {openDropdownId === reg.registrationId && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 5 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                                                        >
                                                            <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar">
                                                                {event.categories?.map((cat) => (
                                                                    <button
                                                                        key={cat.categoryId}
                                                                        onClick={() => handleAssign(reg.registrationId, cat.categoryId)}
                                                                        className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left rounded-lg transition-colors group mb-1 last:mb-0 ${assignedCategories[reg.registrationId] === cat.categoryId ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                                                                    >
                                                                        <span className={`truncate ${assignedCategories[reg.registrationId] === cat.categoryId ? 'font-bold text-[#F26F21]' : 'font-semibold text-slate-600 group-hover:text-blue-600'}`}>
                                                                            {cat.categoryName}
                                                                        </span>
                                                                        {assignedCategories[reg.registrationId] === cat.categoryId && (
                                                                            <Check className="w-4 h-4 text-[#F26F21] shrink-0" />
                                                                        )}
                                                                    </button>
                                                                ))}
                                                                {(!event.categories || event.categories.length === 0) && (
                                                                    <div className="p-4 text-sm font-medium text-slate-500 text-center">
                                                                        Chưa có hạng mục nào.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                                <Target className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-base font-bold text-slate-700 mb-1">Không tìm thấy đội nào</p>
                                            <p className="text-sm font-medium text-slate-400">Thử thay đổi từ khóa hoặc bộ lọc</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
