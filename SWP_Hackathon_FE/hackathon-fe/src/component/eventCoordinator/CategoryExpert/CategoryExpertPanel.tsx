import { useState, useRef, useEffect } from "react";
import { Tag, ChevronDown, ChevronUp, UserCheck, Shield, Briefcase, UserPlus, Trash2 } from "lucide-react";
import type { Category, CategoryExpertAssignment, ExpertAssginment } from "../../../types/hackathonEvent/Hackathon";
import type { ExpertPropfile } from "../../../types/account/Account";
import CustomSelect from "../../ui/CustomSelect";

interface CategoryExpertPanelProps {
    experts: ExpertPropfile[];
    roundId: number;
    availableCategories: Category[];
    categoryExperts: CategoryExpertAssignment[];
    onChange: (roundId: number, updated: CategoryExpertAssignment[]) => void;
}

function AddExpertDropdown({
    availableExperts,
    selectedIds,
    onSelect,
    onClose
}: {
    availableExperts: ExpertPropfile[];
    selectedIds: number[];
    onSelect: (expert: ExpertPropfile) => void;
    onClose: () => void;
}) {
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [onClose]);

    const filtered = availableExperts.filter(e =>
        e.expertName?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={ref} className="absolute z-50 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden left-0">
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    autoFocus
                />
            </div>
            <ul className="max-h-56 overflow-y-auto py-1 divide-y divide-slate-50">
                {filtered.length === 0 && (
                    <li className="px-4 py-3 text-xs text-slate-400 text-center">No experts found</li>
                )}
                {filtered.map(expert => {
                    const isSelected = selectedIds.includes(expert.expertId);
                    return (
                        <li
                            key={expert.expertId}
                            onClick={() => { if (!isSelected) onSelect(expert); }}
                            className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${isSelected ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-orange-50/50'
                                }`}
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(expert.expertName)}&background=f97316&color=fff&size=32`}
                                alt=""
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{expert.expertName}</p>
                                <p className="text-[10px] text-slate-500 truncate">{expert.department || 'Independent'}</p>
                            </div>
                            {isSelected && <UserCheck className="w-4 h-4 text-orange-500" />}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default function CategoryExpertPanel({ experts, roundId, availableCategories, categoryExperts, onChange }: CategoryExpertPanelProps) {
    const [expandedCats, setExpandedCats] = useState<number[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    const toggleExpand = (catId: number) => {
        setExpandedCats(prev => prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]);
    };

    const updateExperts = (catId: number, newExperts: ExpertAssginment[]) => {
        onChange(
            roundId,
            categoryExperts.map(c => (c.categoryId === catId ? { ...c, experts: newExperts } : c))
        );
    };

    const handleAddExpert = (catId: number, currentExperts: ExpertAssginment[], expert: ExpertPropfile) => {
        updateExperts(catId, [...currentExperts, { expertId: expert.expertId, role: 'CORE_JUDGE', expertName: expert.expertName }]);
        setActiveDropdown(null);
    };

    const handleRemoveExpert = (catId: number, currentExperts: ExpertAssginment[], expertId: number) => {
        updateExperts(catId, currentExperts.filter(e => e.expertId !== expertId));
    };

    const handleUpdateRole = (catId: number, currentExperts: ExpertAssginment[], expertId: number, role: ExpertAssginment['role']) => {
        updateExperts(catId, currentExperts.map(e => e.expertId === expertId ? { ...e, role } : e));
    };

    return (
        <div className="space-y-4">
            {categoryExperts.map(cea => {
                const catName = availableCategories[cea.categoryId]?.categoryName ?? `Category ${cea.categoryId}`;
                const isExpanded = expandedCats.includes(cea.categoryId);
                const assignedCount = cea.experts.length;

                return (
                    <div key={cea.categoryId} className="bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300">
                        <div
                            onClick={() => toggleExpand(cea.categoryId)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 text-orange-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">{catName}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {assignedCount === 0 ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                Needs Experts
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                {assignedCount} Assigned
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </div>
                        </div>

                        {/* Accordion Body */}
                        {isExpanded && (
                            <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Expert Cards */}
                                    {cea.experts.map(assignment => {
                                        const profile = experts.find(e => e.expertId === assignment.expertId);
                                        if (!profile) return null;

                                        const tags = profile.department ? [profile.department.split(' ')[0], 'Tech'] : ['General', 'Judge'];

                                        return (
                                            <div key={assignment.expertId} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3 hover:border-orange-200 hover:shadow-md transition-all group relative">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.expertName)}&background=f97316&color=fff&size=48`}
                                                    alt={profile.expertName}
                                                    className="w-12 h-12 rounded-full border-2 border-orange-100"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <h5 className="text-xs font-bold text-slate-900 truncate">{profile.expertName}</h5>
                                                            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                                                <Briefcase className="w-3 h-3 shrink-0" />
                                                                {profile.department || 'Independent Professional'}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveExpert(cea.categoryId, cea.experts, assignment.expertId)}
                                                            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                                            title="Remove Expert"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {tags.map((t, i) => (
                                                            <span key={i} className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <Shield className="w-3.5 h-3.5 text-orange-500" />
                                                            <CustomSelect
                                                                options={[
                                                                    { value: 'CORE_JUDGE', label: 'Core Judge' },
                                                                    { value: 'GUEST_JUDGE', label: 'Guest Judge' },
                                                                    { value: 'MENTOR', label: 'Mentor' },
                                                                ]}
                                                                value={assignment.role}
                                                                onChange={val => handleUpdateRole(cea.categoryId, cea.experts, assignment.expertId, val as ExpertAssginment['role'])}
                                                                variant="inline"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="relative flex">
                                        <button
                                            type="button"
                                            onClick={() => setActiveDropdown(activeDropdown === cea.categoryId ? null : cea.categoryId)}
                                            className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-4 text-slate-400 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/50 transition-all min-h-35"
                                        >
                                            <div className="bg-white p-2 rounded-full shadow-sm">
                                                <UserPlus className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold">Assign Expert</span>
                                        </button>

                                        {activeDropdown === cea.categoryId && (
                                            <AddExpertDropdown
                                                availableExperts={experts}
                                                selectedIds={cea.experts.map(e => e.expertId)}
                                                onSelect={expert => handleAddExpert(cea.categoryId, cea.experts, expert)}
                                                onClose={() => setActiveDropdown(null)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
