import { useTheme } from "../../context/ThemeContext";

export default function Footer() {
    const { isDark } = useTheme();

    return (
        <footer className={`relative overflow-hidden border-t transition-colors duration-500 ${isDark ? 'bg-[#060a10] border-white/6' : 'bg-white border-slate-200'
            }`}>
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent" />

            <div className="max-w-300 mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
                            S
                        </div>
                        <span className={`font-sans text-xl font-bold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            SEAL
                        </span>
                        <span className={`text-[10px] font-semibold uppercase tracking-widest ml-1 hidden sm:block transition-colors ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                            Hackathon Platform
                        </span>
                    </div>

                    {/* Links */}
                    <div className={`flex gap-6 text-xs font-semibold transition-colors ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        {["Bảo mật", "Điều khoản", "Hỗ trợ", "Tài liệu"].map(link => (
                            <a
                                key={link}
                                href="#"
                                className={`transition-colors ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-700'}`}
                            >
                                {link}
                            </a>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p className={`text-xs font-light text-center md:text-right transition-colors ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>
                        © Group Seven from Ms.Quynh.{" "}
                        <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>Dành cho những người kiến tạo.</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}