import React from 'react';
import { X } from 'lucide-react';
import type { Category } from '../../../types/hackathonEvent/Hackathon';

interface CategorySetupProps {
    categories: Category[];
    categoryInput: string;
    setCategoryInput: (val: string) => void;
    onAddCategory: (e?: React.FormEvent) => void;
    onRemoveCategory: (cat: Category) => void;
}

export default function CategorySetup({
    categories,
    categoryInput,
    setCategoryInput,
    onAddCategory,
    onRemoveCategory
}: CategorySetupProps) {
    return (
        <section className="scroll-mt-24 space-y-4" id="section-categories">
            <div>
                <h3 className="text-base font-semibold text-slate-900 leading-tight">Categories</h3>
                <p className="text-xs text-slate-400 mt-1">Create specific domains or technology tracks for teams to compete within.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8 space-y-6">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase font-mono tracking-wider mb-3">Add Category</label>
                    <div className="flex gap-2.5">
                        <input
                            type="text"
                            value={categoryInput}
                            onChange={e => setCategoryInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && onAddCategory(e)}
                            placeholder="Type category track name (e.g. HealthTech)..."
                            className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => onAddCategory()}
                            className="bg-slate-800 hover:bg-slate-950 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                            Add
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase font-mono tracking-wider mb-4">
                        <span>Categories Added</span>
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px]">{categories.length} TRACKS</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="group relative flex items-center justify-between bg-[#f8fafc] border border-slate-200 hover:border-blue-400/60 p-3 rounded-xl transition-all duration-300 hover:shadow-md hover:bg-white overflow-hidden">
                                {/* Decorative left accent */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-blue-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex items-center gap-3 pl-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] group-hover:animate-pulse"></div>
                                    <span className="font-semibold text-sm text-slate-800 tracking-tight">{cat.categoryName}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemoveCategory(cat)}
                                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                    title="Remove Track"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {categories.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <span className="text-xs text-slate-400 font-medium">No tracks added yet. Type a name and click Add.</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
