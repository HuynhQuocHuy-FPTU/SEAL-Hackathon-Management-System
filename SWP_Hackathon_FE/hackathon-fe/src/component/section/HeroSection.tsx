import { motion } from "motion/react";
import { Zap, ArrowRight, Users, Trophy, CalendarDays } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import type { PublicStatis } from "../../types/hackathonEvent/Hackathon";

type HeroSectionProps = {
    handleOpenRegister: (id: string) => void;
    statis?: PublicStatis;
};

const stats = [
    { icon: CalendarDays, label: "Sự kiện", darkColor: "text-blue-400", lightColor: "text-blue-600", darkBg: "bg-blue-500/10", lightBg: "bg-blue-50" },
    { icon: Users, label: "Người tham gia", darkColor: "text-violet-400", lightColor: "text-violet-600", darkBg: "bg-violet-500/10", lightBg: "bg-violet-50" },
    { icon: Trophy, label: "Nhóm", darkColor: "text-pink-400", lightColor: "text-pink-600", darkBg: "bg-pink-500/10", lightBg: "bg-pink-50" },
];

export default function HeroSection({ statis }: HeroSectionProps) {
    const { isDark } = useTheme();
    return (
        <section className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#080c14]' : 'bg-linear-to-b from-slate-50 via-white to-blue-50/30'
            }`}>
            {/* Background orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-[-10%] left-[10%] w-150 h-150 rounded-full blur-[120px] transition-opacity duration-500 ${isDark ? 'bg-[#F26F21]/20 opacity-100' : 'bg-blue-400/15 opacity-60'}`} />
                <div className={`absolute bottom-[-10%] right-[5%] w-125 h-125 rounded-full blur-[120px] transition-opacity duration-500 ${isDark ? 'bg-violet-600/20 opacity-100' : 'bg-violet-400/10 opacity-60'}`} />
                <div className={`absolute top-[40%] left-[50%] w-75 h-75 rounded-full blur-[90px] transition-opacity duration-500 ${isDark ? 'bg-cyan-500/10 opacity-100' : 'bg-cyan-400/8 opacity-40'}`} />
                {/* Grid */}
                <div
                    className={`absolute inset-0 transition-opacity duration-500 ${isDark ? 'opacity-[0.04]' : 'opacity-[0.025]'}`}
                    style={{
                        backgroundImage: `linear-gradient(rgba(100,116,139,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.8) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <div className="relative z-10 max-w-300 mx-auto px-6 py-24 text-center flex flex-col items-center gap-10">

                {/* Live badge */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${isDark
                        ? 'bg-white/5 border border-white/10 text-blue-300'
                        : 'bg-blue-50 border border-blue-200 text-blue-600'
                        }`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Zap className="w-3 h-3 fill-current" />
                    Nền tảng đang hoạt động
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                >
                    <h1 className={`font-sans text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Xây dựng.{" "}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 via-pink-500 to-cyan-500">
                            Cạnh tranh.
                        </span>
                        <br />
                        Đổi mới.
                    </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className={`text-base md:text-lg max-w-2xl leading-relaxed font-light transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                    Nền tảng quản lý Hackathon & Software Engineering toàn diện — dành cho sinh viên FPT
                    muốn bứt phá giới hạn và tạo ra sản phẩm có tác động thực tế.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex flex-wrap gap-3 justify-center"
                >
                    <button
                        onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group relative inline-flex items-center gap-2.5  bg-[#F26F21]  text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:brightness-110 transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98] cursor-pointer"
                    >
                        Tham gia ngay
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a
                        onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                        className={`inline-flex items-center gap-2 font-semibold text-sm px-7 py-3.5 rounded-full transition-all ${isDark
                            ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                            }`}
                    >
                        Khám phá sự kiện
                    </a>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl mt-4"
                >
                    {stats.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.45 + i * 0.08, duration: 0.4 }}
                                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all ${isDark
                                    ? 'bg-white/3 border-white/8 hover:bg-white/6'
                                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? s.darkBg : s.lightBg}`}>
                                    <Icon className={`w-4.5 h-4.5 ${isDark ? s.darkColor : s.lightColor}`} />
                                </div>
                                <span className={`text-3xl md:text-4xl font-extrabold ${isDark ? s.darkColor : s.lightColor}`}>
                                    {i === 0 ? (statis?.eventCount || 0) : i === 1 ? (statis?.participantCount || 0) : (statis?.teamCount || 0)}
                                </span>
                                <span className={`text-[10px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {s.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Bottom fade */}
            <div className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-linear-to-t transition-colors duration-500 ${isDark ? 'from-[#080c14]' : 'from-white/0'
                } to-transparent`} />
        </section>
    );
}