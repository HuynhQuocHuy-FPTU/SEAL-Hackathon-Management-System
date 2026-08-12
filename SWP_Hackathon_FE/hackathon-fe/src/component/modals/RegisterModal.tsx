import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { FormEvent, Dispatch, SetStateAction } from "react";

type RegForm = {
    fullName: string;
    email: string;
    role: string;
    teamName: string;
    description: string;
};

type RegisterModalProps = {
    isRegisterOpen: boolean;
    setIsRegisterOpen: (value: boolean) => void;

    registerTargetHackathonId: string;
    setRegisterTargetHackathonId: (id: string) => void;

    hackathons: any[];

    regForm: RegForm;
    setRegForm: Dispatch<SetStateAction<RegForm>>;

    handleRegisterSubmit: (e: FormEvent) => void;
};

export default function RegisterModal({
    isRegisterOpen,
    setIsRegisterOpen,
    registerTargetHackathonId,
    setRegisterTargetHackathonId,
    hackathons,
    regForm,
    setRegForm,
    handleRegisterSubmit,
}: RegisterModalProps) {
    return (
        <AnimatePresence>
            {isRegisterOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
                    {/* Backdrop click closer */}
                    <div className="absolute inset-0" onClick={() => setIsRegisterOpen(false)}></div>

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="bg-white w-full max-w-md h-full relative z-10 shadow-2xl border-l border-slate-100 p-8 overflow-y-auto flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-sans text-xl font-bold text-slate-900">Ghi Danh Hackathon</h3>
                                <p className="text-xs text-slate-400 mt-1">Đăng ký tham gia giải mã SEAL Hackathon</p>
                            </div>
                            <button
                                onClick={() => setIsRegisterOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRegisterSubmit} className="space-y-5 flex-1">
                            {/* Auto Chosen Target Hackathon */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Chọn cuộc thi đăng cử</label>
                                <select
                                    value={registerTargetHackathonId}
                                    onChange={(e) => setRegisterTargetHackathonId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                >
                                    {hackathons.map(h => (
                                        <option key={h.id} value={h.id}>{h.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Team Name */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Tên Đội Thi *</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: TechWave Developers, Coding Tigers..."
                                    required
                                    value={regForm.teamName}
                                    onChange={(e) => setRegForm(prev => ({ ...prev, teamName: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                />
                            </div>

                            {/* Full name */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Họ & Tên Đại Diện *</label>
                                <input
                                    type="text"
                                    placeholder="Nhập họ và tên đầy đủ của bạn..."
                                    required
                                    value={regForm.fullName}
                                    onChange={(e) => setRegForm(prev => ({ ...prev, fullName: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Địa chỉ Email Liên Hệ *</label>
                                <input
                                    type="email"
                                    placeholder="TenCuaBan@Gmail.com..."
                                    required
                                    value={regForm.email}
                                    onChange={(e) => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                />
                            </div>

                            {/* Primary role */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Vai trò Kỹ Năng Chính</label>
                                <select
                                    value={regForm.role}
                                    onChange={(e) => setRegForm(prev => ({ ...prev, role: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                >
                                    <option value="Fullstack Developer">Fullstack Developer (Frontend/Backend)</option>
                                    <option value="AI / Data Specialist">AI / Data Specialist</option>
                                    <option value="UI UX Product Designer">UI UX Product Designer</option>
                                    <option value="DevOps Cloud Architect">DevOps Cloud Architect</option>
                                    <option value="Pitcher / Product Manager">Pitcher / Product Manager</option>
                                </select>
                            </div>

                            {/* Project Brief */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Mô tả ý tưởng ban đầu (Nếu có)</label>
                                <textarea
                                    rows={4}
                                    placeholder="Hãy phác thảo sơ bộ về mục tiêu và ý tưởng dự án đội bạn định triển khai..."
                                    value={regForm.description}
                                    onChange={(e) => setRegForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2.5 px-3.5 text-xs focus:border-blue-500"
                                ></textarea>
                            </div>

                            <div className="pt-4 space-y-3">
                                <button
                                    type="submit"
                                    className="w-full bg-[#F26F21] text-white font-bold py-3 rounded-xl hover:bg-blue-750 transition-colors shadow shadow-blue-500/10 text-xs"
                                >
                                    Hoàn Tất Đăng ký Ghép Cặp
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterOpen(false)}
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