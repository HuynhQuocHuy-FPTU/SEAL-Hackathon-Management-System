import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { FormEvent, Dispatch, SetStateAction } from "react";


type ProjForm = {
    title: string;
    team: string;
    category: string;
    tagsStr: string;
    imageUrl: string;
    description: string;
    githubUrl: string;
    demoUrl: string;
    membersStr: string;
};

type SubmitProjectModalProps = {
    isSubmitProjectOpen: boolean;
    setIsSubmitProjectOpen: (value: boolean) => void;

    projForm: ProjForm;
    setProjForm: Dispatch<SetStateAction<ProjForm>>;

    handleProjectSubmit: (e: FormEvent) => void;
};

export default function SubmitProjectModal({
    isSubmitProjectOpen,
    setIsSubmitProjectOpen,
    projForm,
    setProjForm,
    handleProjectSubmit,
}: SubmitProjectModalProps) {
    return (
        <AnimatePresence>
            {isSubmitProjectOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
                    {/* Closer overlay */}
                    <div className="absolute inset-0" onClick={() => setIsSubmitProjectOpen(false)}></div>

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="bg-white w-full max-w-md h-full relative z-10 shadow-2xl border-l border-slate-150 p-8 overflow-y-auto flex flex-col text-slate-700 text-sm"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-sans text-xl font-bold text-slate-900">Nộp Dự Án Nhóm Showcase</h3>
                                <p className="text-xs text-slate-400 mt-1">Đưa dự án hoàn thiện lên bảng tin danh dự của SEAL</p>
                            </div>
                            <button
                                onClick={() => setIsSubmitProjectOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleProjectSubmit} className="space-y-4 flex-1">
                            {/* Project Title */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tên Dự Án *</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: EcoTrack Smart Meter, Blockchain Wallet..."
                                    required
                                    value={projForm.title}
                                    onChange={(e) => setProjForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-250 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                />
                            </div>

                            {/* Team Name */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Tên Nhóm Làm Việc *</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: DevsAlpha, CryptoDevs..."
                                    required
                                    value={projForm.team}
                                    onChange={(e) => setProjForm(prev => ({ ...prev, team: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-250 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                />
                            </div>

                            {/* Category selector */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lĩnh Vực Công Nghệ Chính</label>
                                <select
                                    value={projForm.category}
                                    onChange={(e) => setProjForm(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-250 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                >
                                    <option value="Software Engineering">Software Engineering</option>
                                    <option value="AI">AI</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Cyber Security">Cyber Security</option>
                                    <option value="Cloud Computing">Cloud Computing</option>
                                    <option value="Mobile Dev">Mobile Dev</option>
                                    <option value="Web Dev">Web Dev</option>
                                    <option value="IoT">IoT</option>
                                </select>
                            </div>

                            {/* Members list string */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Danh sách Thành Viên (Phân tách bằng dấu phẩy)</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Nguyễn Văn A, Lê Thị B, Trần C"
                                    value={projForm.membersStr}
                                    onChange={(e) => setProjForm(prev => ({ ...prev, membersStr: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-250 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mô tả tóm tắt dự án *</label>
                                <textarea
                                    rows={4}
                                    maxLength={300}
                                    placeholder="Phác họa tính năng cốt lõi và các giải pháp kỹ thuật nhóm bạn đã xây dựng thành công trong vòng 200 từ..."
                                    required
                                    value={projForm.description}
                                    onChange={(e) => setProjForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-250 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                ></textarea>
                            </div>

                            {/* Image URL of the project */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Liên Kết Hình Ảnh Dự Án (Nguồn ảnh / Mockup URL)</label>
                                <input
                                    type="url"
                                    placeholder="Hệ thống tự động điền ảnh chất lượng cao mặc định nếu bỏ trống..."
                                    value={projForm.imageUrl}
                                    onChange={(e) => setProjForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-250 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                />
                            </div>

                            {/* Github Link */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đường Dẫn GitHub</label>
                                    <input
                                        type="url"
                                        placeholder="https://github.com..."
                                        value={projForm.githubUrl}
                                        onChange={(e) => setProjForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-250 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Demo Website Live</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={projForm.demoUrl}
                                        onChange={(e) => setProjForm(prev => ({ ...prev, demoUrl: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-255 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Extra custom Tags */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phân loại thẻ bổ sung (Phân tách bằng dấu phẩy)</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: AI Model, Solidity, AWS, React, NodeJS..."
                                    value={projForm.tagsStr}
                                    onChange={(e) => setProjForm(prev => ({ ...prev, tagsStr: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-250 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                />
                            </div>

                            <div className="pt-4 space-y-3">
                                <button
                                    type="submit"
                                    className="w-full bg-[#F26F21] text-white font-bold py-3 rounded-xl hover:bg-blue-750 transition-colors shadow text-xs"
                                >
                                    Hoàn Tất Gửi Dự Án
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsSubmitProjectOpen(false)}
                                    className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl hover:bg-slate-200 transition-colors text-xs"
                                >
                                    Hủy bỏ
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}