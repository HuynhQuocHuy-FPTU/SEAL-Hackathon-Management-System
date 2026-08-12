import type { ExpertAssginment } from "../../../types/hackathonEvent/Hackathon";
import type { ExpertPropfile } from "../../../types/account/Account";
import { useEffect, useState, useRef } from "react";
import { X, ChevronDown, UserCheck } from "lucide-react";

interface ExpertSelectProps {
    experts: ExpertPropfile[];
    selected: ExpertAssginment[];
    onChange: (v: ExpertAssginment[]) => void;
}

export default function ExpertSelect({ experts = [], selected = [], onChange }: ExpertSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    const validExperts = Array.isArray(experts) ? experts : [];
    const filtered = validExperts.filter(
        j =>
            j.expertName?.toLowerCase().includes(search.toLowerCase()) ||
            j.email?.toLowerCase().includes(search.toLowerCase())
    );
    const validSelected = Array.isArray(selected) ? selected : [];
    const isSelected = (id: number) => validSelected.some(s => s.expertId === id);

    const toggle = (judge: ExpertPropfile) => {
        if (isSelected(judge.expertId)) {
            onChange(validSelected.filter(s => s.expertId !== judge.expertId));
        } else {
            onChange([...validSelected, { expertId: judge.expertId, role: 'CORE_JUDGE' }]);
        }
    };

    const updateRole = (expertId: number, role: ExpertAssginment['role']) =>
        onChange(validSelected.map(s => (s.expertId === expertId ? { ...s, role } : s)));

    const remove = (expertId: number) => onChange(validSelected.filter(s => s.expertId !== expertId));

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <div
                className="w-full min-h-9 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-pointer transition-all"
                onClick={() => setOpen(v => !v)}
            >
                {validSelected.length === 0 && (
                    <span className="text-xs text-slate-400">Select experts...</span>
                )}
                {validSelected.map(s => {
                    const judge = validExperts.find(j => j.expertId === s.expertId);
                    return (
                        <span
                            key={s.expertId}
                            className="inline-flex items-center gap-1 bg-violet-50 border border-violet-100 text-violet-700 rounded-lg px-2 py-0.5 text-xs font-medium"
                            onClick={e => e.stopPropagation()}
                        >
                            <UserCheck className="w-3 h-3 shrink-0" />
                            {judge?.expertName}
                            <span className="text-violet-300 mx-0.5">·</span>
                            <select
                                value={s.role}
                                onChange={e => updateRole(s.expertId, e.target.value as ExpertAssginment['role'])}
                                className="bg-transparent text-violet-600 text-[10px] font-semibold border-none outline-none cursor-pointer"
                            >
                                {(['CORE_JUDGE', 'GUEST_JUDGE', 'MENTOR'] as ExpertAssginment['role'][]).map(r => (
                                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                                ))}
                            </select>
                            <button type="button" onClick={() => remove(s.expertId)} className="ml-0.5 hover:text-violet-900">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    );
                })}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>

            {open && (
                <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                    <ul className="max-h-44 overflow-y-auto divide-y divide-slate-50">
                        {filtered.length === 0 && (
                            <li className="px-4 py-3 text-xs text-slate-400 text-center">No experts found</li>
                        )}
                        {filtered.map(judge => (
                            <li
                                key={judge.expertId}
                                onClick={() => toggle(judge)}
                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${isSelected(judge.expertId) ? 'bg-violet-50/60 hover:bg-violet-50' : 'hover:bg-slate-50'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${isSelected(judge.expertId) ? 'bg-violet-600 border-violet-600' : 'border-slate-300'
                                        }`}
                                >
                                    {isSelected(judge.expertId) && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-800 truncate">{judge.expertName}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{judge.email}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
