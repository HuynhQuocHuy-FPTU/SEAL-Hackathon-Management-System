import { AnimatePresence, motion } from "motion/react";
import { BookOpen, CheckCircle, ChevronRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

type TimelineSectionProps = {
    TIMELINE_STEPS: any[];
    selectedTimelineStep: number | null;
    setSelectedTimelineStep: (step: number) => void;
};

const stepColors = [
    "from-blue-500 to-blue-600",
    "from-violet-500 to-violet-600",
    "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600",
    "from-emerald-500 to-emerald-600",
];

export default function TimelineSection({ TIMELINE_STEPS, selectedTimelineStep, setSelectedTimelineStep }: TimelineSectionProps) {
    const { isDark } = useTheme();
    const selected = selectedTimelineStep !== null
        ? TIMELINE_STEPS.find(s => s.step === selectedTimelineStep)
        : null;

    return (
        <section className={`py-24 relative transition-colors duration-500 ${isDark ? 'bg-[#080c14]' : 'bg-white'}`} id="timeline">
            <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(107,56,212,0.07)_0%,transparent_60%)]' : 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(107,56,212,0.03)_0%,transparent_60%)]'}`} />

            <div className="max-w-300 mx-auto px-6 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-14 text-center"
                >
                    <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-3">Quy Trình</p>
                    <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Lịch trình Tham gia
                    </h2>
                    <p className={`text-sm mt-2 max-w-xl mx-auto transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Nhấp vào các giai đoạn để xem hướng dẫn chi tiết.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    {/* Steps list */}
                    <div className="space-y-3">
                        {TIMELINE_STEPS.map((step, idx) => {
                            const isActive = selectedTimelineStep === step.step;
                            const gradient = stepColors[idx % stepColors.length];
                            return (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.07, duration: 0.4 }}
                                    onClick={() => setSelectedTimelineStep(step.step)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border group ${isActive
                                        ? isDark
                                            ? 'bg-white/6 border-white/12 shadow-lg'
                                            : 'bg-blue-50/60 border-blue-200 shadow-sm'
                                        : isDark
                                            ? 'border-transparent hover:bg-white/4 hover:border-white/8'
                                            : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center font-extrabold text-sm text-white shrink-0 shadow-md transition-all ${isActive ? 'scale-110' : 'opacity-50 group-hover:opacity-75'
                                        }`}>
                                        {isActive ? <CheckCircle className="w-5 h-5" /> : step.step}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className={`font-bold text-sm truncate transition-colors ${isActive
                                                ? isDark ? 'text-white' : 'text-slate-900'
                                                : isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-700'
                                                }`}>
                                                {step.title}
                                            </h3>
                                        </div>
                                        <p className={`text-xs mt-0.5 truncate transition-colors ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {step.sub}
                                        </p>
                                    </div>

                                    <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${isActive
                                        ? isDark ? 'text-white rotate-90' : 'text-blue-600 rotate-90'
                                        : isDark ? 'text-slate-700 group-hover:text-slate-500' : 'text-slate-300 group-hover:text-slate-500'
                                        }`} />
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Detail panel */}
                    <div className="lg:sticky lg:top-24">
                        <AnimatePresence mode="wait">
                            {selected ? (
                                <motion.div
                                    key={selected.step}
                                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className={`relative rounded-3xl p-8 overflow-hidden border transition-colors ${isDark
                                        ? 'bg-[#0e1420] border-white/10'
                                        : 'bg-white border-slate-200 shadow-lg'
                                        }`}
                                >
                                    {/* Glow */}
                                    <div className={`absolute top-0 right-0 w-48 h-48 rounded-full bg-linear-to-br ${stepColors[(selected.step - 1) % stepColors.length]} opacity-10 blur-3xl pointer-events-none`} />

                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-5 text-xs font-semibold text-violet-500">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span>Giai đoạn {selected.step}</span>
                                        </div>
                                        <h4 className={`text-2xl font-extrabold mb-3 leading-snug transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {selected.title}
                                        </h4>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`flex flex-col items-center justify-center h-64 rounded-3xl border border-dashed ${isDark ? 'border-white/8 text-slate-600' : 'border-slate-200 text-slate-400'}`}
                                >
                                    <span className="text-4xl mb-3">👆</span>
                                    <p className="text-sm font-medium">Chọn một giai đoạn để xem chi tiết</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}