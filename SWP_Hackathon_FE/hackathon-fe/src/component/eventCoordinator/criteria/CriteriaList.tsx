import { useState, useEffect } from 'react';
import { getAllCriteriaDetails } from '../../../services/event/eventService';
import { deleteCriteriaSet } from '../../../services/event/criteriaService';
import { Loader2, List, MoreVertical, Edit, Trash2, ChevronDown, ChevronRight, Filter, ArrowDownUp, RefreshCw } from 'lucide-react';

interface CriteriaListProps {
    onEdit: (criteria: any) => void;
    onDelete: (criteriaId: number) => void;
    onCreateNew: () => void;
}

export default function CriteriaList({ onEdit, onDelete, onCreateNew }: CriteriaListProps) {
    const [criteriaList, setCriteriaList] = useState<any[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    useEffect(() => {
        fetchCriteriaList();
    }, []);

    const fetchCriteriaList = async () => {
        setLoadingList(true);
        try {
            const data = await getAllCriteriaDetails();
            setCriteriaList(data || []);
        } catch (error) {
            console.error('Failed to fetch criteria list', error);
        } finally {
            setLoadingList(false);
        }
    };

    const confirmDelete = (criteriaId: number) => {
        setConfirmDeleteId(criteriaId);
        setOpenDropdownId(null);
    };

    const executeDelete = async () => {
        if (confirmDeleteId === null) return;

        setIsDeleting(true);
        try {
            await deleteCriteriaSet(confirmDeleteId);
            fetchCriteriaList();
            if (onDelete) onDelete(confirmDeleteId);
            setConfirmDeleteId(null);
        } catch (error: any) {
            console.error(error?.response?.data?.message || 'Failed to delete criteria');
            alert(error?.response?.data?.message || 'Failed to delete criteria!');
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#F9FAFB] rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-800">Danh sách tiêu chí</h2>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-md text-sm text-gray-700 transition-colors cursor-pointer">
                        <Filter size={16} /> Lọc
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-md text-sm text-gray-700 transition-colors cursor-pointer">
                        <ArrowDownUp size={16} /> Sắp xếp
                    </button>
                    <button
                        onClick={fetchCriteriaList}
                        className="flex items-center justify-center p-1.5 ml-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                        title="Tải lại"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5 pl-12 text-center">TÊN BỘ TIÊU CHÍ</div>
                <div className="col-span-3 text-center">Hệ Điểm</div>
                <div className="col-span-2 text-center">THAO TÁC</div>
            </div>

            {loadingList ? (
                <div className="flex flex-col items-center justify-center py-20 text-brand-primary">
                    <Loader2 size={32} className="animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Đang tải danh sách...</p>
                </div>
            ) : criteriaList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <List size={32} />
                    </div>
                    <p className="text-gray-500 max-w-md mb-6">
                        Chưa có bộ tiêu chí nào được tạo.
                    </p>
                    <button
                        onClick={onCreateNew}
                        className="px-6 py-2 bg-[#0F3B8C] text-white rounded-lg font-medium hover:bg-[#0F3B8C]/90 transition-colors cursor-pointer"
                    >
                        Tạo bộ tiêu chí mới
                    </button>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {criteriaList.map((criteria, index) => {
                        const id = criteria.criteriaSetId || index;
                        const isExpanded = expandedIds.includes(id);
                        const totalWeight = criteria.criteriaDetails?.reduce((sum: number, detail: any) => sum + (detail.weight || 0), 0) || 0;

                        return (
                            <div key={id} className="flex flex-col">
                                {/* Row */}
                                <div className={`grid grid-cols-12 gap-4 items-center px-6 py-5 hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50/50' : ''}`}>
                                    <div className="col-span-5 flex items-center gap-4">
                                        <button
                                            onClick={() => toggleExpand(id)}
                                            className="p-1 text-gray-500 hover:text-[#0F3B8C] transition-colors cursor-pointer shrink-0"
                                        >
                                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        </button>
                                        <div>
                                            <h3
                                                className="text-[15px] font-bold text-[#0F3B8C] cursor-pointer hover:underline"
                                                onClick={() => toggleExpand(id)}
                                            >
                                                {criteria.criteriaSetName || 'Unnamed Set'}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="col-span-3 text-[14px] text-gray-600 font-medium text-center">
                                        {criteria.maxScore}
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdownId(openDropdownId === id ? null : id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                            {openDropdownId === id && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(criteria);
                                                            setOpenDropdownId(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-primary text-left cursor-pointer"
                                                    >
                                                        <Edit size={16} /> Chỉnh sửa
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDelete(id);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 text-left cursor-pointer"
                                                    >
                                                        <Trash2 size={16} /> Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="pl-14 pr-6 py-6 bg-white border-t border-gray-100">
                                        <div className="border-l-[3px] border-[#0F3B8C] pl-6 py-1">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="text-[15px] font-bold text-gray-800">Cấu trúc tiêu chí & Trọng số</h4>
                                                <div className="text-[13px] font-bold text-[#0F3B8C] bg-[#E8F0FE] px-3 py-1.5 rounded-md">
                                                    Tổng trọng số: {totalWeight}%
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {criteria.criteriaDetails && criteria.criteriaDetails.length > 0 ? (
                                                    criteria.criteriaDetails.map((detail: any, dIndex: number) => (
                                                        <div key={dIndex} className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-white">
                                                            <div className="flex-1 pr-8">
                                                                <h5 className="text-[15px] font-bold text-gray-800">{detail.criteriaName} <span className='text-[#0F3B8C]'>Loại: {detail.type}</span></h5>
                                                                <p className="text-[13px] text-gray-500 mt-1">{detail.description || 'Không có mô tả.'}</p>
                                                            </div>
                                                            <div className="flex items-center gap-5 w-75">
                                                                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-[#0F3B8C] rounded-full"
                                                                        style={{ width: `${detail.weight || 0}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="w-18 text-center py-1.5 border border-gray-200 rounded-md text-[14px] font-bold text-gray-700 bg-white">
                                                                    {detail.weight || 0} %
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic py-4 bg-gray-50 rounded-lg text-center">Không có chi tiết nào cho bộ tiêu chí này.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {confirmDeleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <Trash2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mt-1">Xóa bộ tiêu chí?</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bộ tiêu chí này không?
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                disabled={isDeleting}
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                disabled={isDeleting}
                                onClick={executeDelete}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-70"
                            >
                                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                                {isDeleting ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
