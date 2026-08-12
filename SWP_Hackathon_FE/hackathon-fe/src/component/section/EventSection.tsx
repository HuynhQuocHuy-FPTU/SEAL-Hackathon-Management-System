import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import EventCard from "../cards/landingPage/EventCard";
import { useTheme } from "../../context/ThemeContext";
import type { Hackathon } from "../../types/hackathonEvent/Hackathon";
import { Radio, CheckCircle2, CalendarX } from "lucide-react";
import { registerEvent } from '../../services/team/teamsService';
import { useNotification } from "../../hook/useNotification";

type EventSectionProps = {
    hackathons?: Hackathon[];
    handleViewDetails: (h: Hackathon) => void;
    handleOpenRegister: (id: string) => void;
};

type TabId = "ONGOING" | "COMPLETED";

const TABS: {
    id: TabId;
    label: string;
    statuses: Hackathon["status"][];
    icon: React.ElementType;
    accentDark: string;
    accentLight: string;
    dotColor: string;
}[] = [
        {
            id: "ONGOING",
            label: "Đang diễn ra",
            statuses: ["ACTIVE", "PUBLISHED", "ONGOING", "REGISTRATION_CLOSED"],
            icon: Radio,

            accentDark: "text-emerald-400 border-emerald-400 bg-emerald-400/10",
            accentLight: "text-emerald-700 border-emerald-500 bg-emerald-50",
            dotColor: "bg-emerald-400",
        },
        {
            id: "COMPLETED",
            label: "Đã kết thúc",
            statuses: ["COMPLETED"],
            icon: CheckCircle2,
            accentDark: "text-slate-400 border-slate-500 bg-slate-400/8",
            accentLight: "text-slate-600 border-slate-400 bg-slate-100",
            dotColor: "bg-slate-400",
        },
    ];

export default function EventSection({ hackathons, handleViewDetails }: EventSectionProps) {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState<TabId>("ONGOING");
    const { addNotification } = useNotification();

    const handleRegisterEvent = async (eventId: number) => {
        try {
            await registerEvent(eventId);
            addNotification("Success", "Đăng kí tham gia sự kiện thành công");
        } catch (error: any) {
            addNotification("Info", error.response?.data?.message);

        }
    }
    const counts = useMemo(() =>
        Object.fromEntries(TABS.map(t => [t.id, hackathons.filter(h => t.statuses.includes(h.status)).length])),
        [hackathons]
    );

    const filtered = useMemo(() => {
        const tab = TABS.find(t => t.id === activeTab)!;
        return hackathons.filter(h => tab.statuses.includes(h.status));
    }, [hackathons, activeTab]);

    const activeTabConfig = TABS.find(t => t.id === activeTab)!;

    return (
        <section className={`py-24 relative transition-colors duration-500 ${isDark ? "bg-[#080c14]" : "bg-slate-50"}`} id="events">
            <div className={`absolute inset-0 pointer-events-none ${isDark
                ? "bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06)_0%,transparent_60%)]"
                : "bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.04)_0%,transparent_60%)]"}`}
            />

            <div className="max-w-300 mx-auto px-6 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div>
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Cuộc thi</p>
                        <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>
                            Sự kiện Hackathon
                        </h2>
                        <p className={`text-sm mt-2 max-w-md transition-colors ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            Khám phá các cuộc thi đang diễn ra, sắp tới và đã kết thúc.
                        </p>
                    </div>
                    <p className={`text-xs font-semibold transition-colors ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                        {hackathons.length} cuộc thi · {counts["ONGOING"] ?? 0} đang diễn ra
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className={`flex gap-2 p-1.5 rounded-2xl mb-10 w-fit transition-colors ${isDark ? "bg-white/4 border border-white/8" : "bg-white border border-slate-200 shadow-sm"}`}
                >
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${isActive
                                    ? isDark ? tab.accentDark + " border" : tab.accentLight + " border"
                                    : isDark
                                        ? "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="tab-bg"
                                        className="absolute inset-0 rounded-xl"
                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                    />
                                )}
                                <span className="relative flex items-center gap-2">
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${isActive
                                        ? isDark ? "bg-white/10 text-current" : "bg-white/60 text-current"
                                        : isDark ? "bg-white/5 text-slate-600" : "bg-slate-100 text-slate-400"
                                        }`}>
                                        {counts[tab.id] ?? 0}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </motion.div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filtered.map((h, i) => (
                                    <motion.div
                                        key={h.eventName + i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06, duration: 0.35 }}
                                    >
                                        <EventCard
                                            hackathon={h}
                                            handleViewDetails={handleViewDetails}
                                            handleRegisterEvent={handleRegisterEvent}
                                            tabStatus={activeTab}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed transition-colors ${isDark ? "border-white/8 text-slate-600" : "border-slate-200 text-slate-400"}`}
                            >
                                <CalendarX className={`w-12 h-12 mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                                <p className="font-semibold text-sm">Chưa có cuộc thi nào</p>
                                <p className={`text-xs mt-1 ${isDark ? "text-slate-700" : "text-slate-300"}`}>
                                    {activeTab === "ONGOING"
                                        ? "Hiện tại không có cuộc thi nào đang diễn ra."
                                        : "Chưa có cuộc thi nào kết thúc."}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
                {activeTab === "ONGOING" && filtered.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 flex items-center justify-center gap-2"
                    >
                        <span className={`w-2 h-2 rounded-full animate-pulse ${activeTabConfig.dotColor}`} />
                        <p className={`text-xs font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {filtered.length} cuộc thi đang được cập nhật theo thời gian thực
                        </p>
                    </motion.div>
                )}
            </div>
        </section>
    );
}