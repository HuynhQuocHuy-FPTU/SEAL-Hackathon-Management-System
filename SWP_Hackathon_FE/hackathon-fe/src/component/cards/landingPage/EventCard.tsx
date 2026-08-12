import { motion } from "motion/react";
import { Calendar, ArrowRight, Clock, Radio, CheckCircle2, MapPin, Users, Target, Upload } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import type { Hackathon } from "../../../types/hackathonEvent/Hackathon";

type EventCardProps = {
    hackathon: Hackathon;
    handleViewDetails: (h: Hackathon) => void;
    handleRegisterEvent: (id: number) => void;
    tabStatus?: "ONGOING" | "COMPLETED";
};

/* Maps per-tab badge style */
const tabBadge = {
    ONGOING: {
        dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        light: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: Radio,
        label: "Đang diễn ra",
    },
    COMPLETED: {
        dark: "bg-slate-500/12 text-slate-500 border-slate-600/20",
        light: "bg-slate-100 text-slate-500 border-slate-200",
        icon: CheckCircle2,
        label: "Đã kết thúc",
    },
};

export default function EventCard({ hackathon, handleViewDetails, handleRegisterEvent, tabStatus = "ONGOING" }: EventCardProps) {
    const { isDark } = useTheme();
    const badge = tabBadge[tabStatus];
    const BadgeIcon = badge.icon;
    const isCompleted = tabStatus === "COMPLETED";

    // Safety check for category array which might be missing from backend sometimes
    const categories = Array.isArray(hackathon.categories) ? hackathon.categories : [];

    return (
        <motion.div
            whileHover={isCompleted ? {} : { y: -4 }}
            className={`group relative rounded-3xl overflow-hidden flex flex-col transition-all duration-300 shadow-xl ${isDark
                ? `bg-[#0e1420] border hover:border-blue-500/30 shadow-black/40 ${isCompleted ? "border-white/5 opacity-80 hover:opacity-100" : "border-white/8"}`
                : `bg-white border hover:shadow-2xl hover:shadow-blue-500/10 ${isCompleted ? "border-slate-100 opacity-90 hover:opacity-100" : "border-slate-200 hover:border-blue-200 shadow-slate-100"}`
                }`}
        >
            {/* Banner image */}
            <div className={`relative h-52 overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
                <img
                    alt={hackathon.eventName}
                    src={hackathon.bannerUrl}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-700 ${isCompleted
                        ? "grayscale opacity-60"
                        : isDark
                            ? "opacity-80 group-hover:opacity-100 group-hover:scale-[1.05]"
                            : "opacity-90 group-hover:opacity-100 group-hover:scale-[1.05]"
                        }`}
                />
                <div className={`absolute inset-0 ${isDark ? "bg-linear-to-t from-[#0e1420] via-[#0e1420]/40 to-transparent" : "bg-linear-to-t from-white via-white/20 to-transparent"}`} />

                {/* Status badge */}
                <div className={`absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm transition-transform group-hover:scale-105 ${isDark ? badge.dark : badge.light}`}>
                    <BadgeIcon className="w-3.5 h-3.5" />
                    {badge.label}
                </div>

                {/* Ongoing pulse dot */}
                {tabStatus === "ONGOING" && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-6 pt-2 gap-4 relative z-10">
                <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                        {hackathon.title}
                    </p>
                    <h3 className={`text-xl font-extrabold leading-tight transition-colors line-clamp-2 ${isCompleted
                        ? isDark ? "text-slate-400" : "text-slate-500"
                        : isDark ? "text-white group-hover:text-blue-300" : "text-slate-900 group-hover:text-blue-600"
                        }`}>
                        {hackathon.eventName}
                    </h3>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 3).map(cat => (
                        <span
                            key={cat.categoryName}
                            className={`text-[10px] px-2.5 py-1 rounded-md font-semibold backdrop-blur-xs border transition-colors ${isDark
                                ? "bg-white/5 border-white/10 text-slate-300 group-hover:bg-white/10"
                                : "bg-slate-50 border-slate-200 text-slate-600 group-hover:bg-slate-100"
                                }`}
                        >
                            {cat.categoryName}
                        </span>
                    ))}
                    {categories.length > 3 && (
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-semibold backdrop-blur-xs border ${isDark ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                            +{categories.length - 3}
                        </span>
                    )}
                </div>
                <div className={`grid grid-cols-2 gap-3 mt-2 text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <span className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 shrink-0 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
                        <span className="truncate">{tabStatus === "COMPLETED" ? new Date(hackathon.endDate).toLocaleDateString() : new Date(hackathon.registrationDeadline).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 shrink-0 ${isDark ? "text-rose-400" : "text-rose-500"}`} />
                        <span className="truncate">{hackathon.address || "Online"}</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <Users className={`w-4 h-4 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-500"}`} />
                        <span>{hackathon.minTeamSize} - {hackathon.maxTeamSize} thành viên</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 shrink-0 ${isDark ? "text-amber-400" : "text-amber-500"}`} />
                        <span className="truncate">{hackathon.season}</span>
                    </span>
                </div>
                <div className={`h-px w-full mt-2 ${isDark ? "bg-linear-to-r from-transparent via-white/10 to-transparent" : "bg-linear-to-r from-transparent via-slate-200 to-transparent"}`} />
                {/* Rounds */}
                {hackathon.rounds && hackathon.rounds.length > 0 && (
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        <p className={`text-[10px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>Các vòng thi</p>
                        {hackathon.rounds.sort((a, b) => a.orderIndex - b.orderIndex).map((round, idx) => (
                            <div key={idx} className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-colors ${isDark ? "bg-white/5 border-white/10 hover:border-blue-500/30" : "bg-slate-50 border-slate-200 hover:border-blue-200"}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`text-[11px] font-bold ${isDark ? "text-blue-400" : "text-blue-700"}`}>{round.roundName}</span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>{round.status}</span>
                                </div>
                                <div className={`flex flex-wrap items-center gap-2 text-[10px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    <div className="flex items-center gap-1">
                                        <Calendar className={`w-3 h-3 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
                                        <span>{new Date(round.startDate).toLocaleDateString()} - {new Date(round.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <span className="flex items-center gap-1">
                                        <Target className={`w-3 h-3 ${isDark ? "text-purple-400" : "text-purple-500"}`} />
                                        Top {round.topN}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Upload className={`w-3 h-3 ${isDark ? "text-amber-400" : "text-amber-500"}`} />
                                        {round.submissionType}
                                    </span>
                                </div>
                                {round.advancementRule && (
                                     <div className={`text-[10px] italic mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                        <span className="font-semibold not-italic">Điều kiện:</span> {round.advancementRule}
                                     </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-3 mt-auto pt-2">
                    <button
                        onClick={() => handleViewDetails(hackathon)}
                        className={`flex-1 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer ${isDark
                            ? "bg-white/5 hover:bg-white/15 border border-white/10 text-white"
                            : "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
                            }`}
                    >
                        Chi tiết
                    </button>
                    {isCompleted ? (
                        <button
                            onClick={() => handleViewDetails(hackathon)}
                            className={`flex-1 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer ${isDark
                                ? "bg-white/3 border border-white/5 text-slate-500 hover:text-slate-300"
                                : "bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            Xem kết quả
                        </button>
                    ) : (
                        <button
                            onClick={() => handleRegisterEvent(hackathon.eventId)}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#F26F21] text-white font-bold text-xs py-3 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                            Đăng Ký
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}