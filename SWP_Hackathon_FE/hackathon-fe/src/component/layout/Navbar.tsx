import { useState } from "react";
import { Sun, Moon, ChevronDown, Plus, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from 'react-router-dom'
import type { UserProfile } from "../../types/account/Account"
import AvatarButton from "../button/AvatarButton";
import { useTopNavbar } from "../../hook/useTopNavbar";
import UserProfileMenu from "../ui/UserProfileMenu";
import { useTheme } from "../../context/ThemeContext";
import NotificationBell from '../navbar/NotificationBell';

type NavbarProps = {
    user: UserProfile | null;
    handleOpenRegister: (id: string) => void;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsViewTeamsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    onLogout: () => void;
};

const navLinks = [
    { label: "Sự kiện", href: "#events" },
    { label: "Lịch trình", href: "#timeline" },
    { label: "Bảng xếp hạng", href: "#ranking" },
];

export default function Navbar({
    user,
    setIsOpen,
    setIsViewTeamsOpen,
    onLogout,
}: NavbarProps) {
    const navigate = useNavigate();
    const { showProfileMenu, toggleProfileMenu, closeAllMenus } = useTopNavbar();
    const { isDark, toggleTheme } = useTheme();
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

    return (
        <nav className={`sticky top-0 w-full z-40 border-b transition-all duration-300 backdrop-blur-lg ${isDark
            ? 'border-white/10 bg-[#080c14]/70'
            : 'border-brand-outline-variant/30 bg-brand-background/70'
            }`}>
            <div className="flex justify-between items-center px-6 md:px-10 h-16 max-w-350 mx-auto">

                {/* Logo */}
                <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    <div className="w-8 h-8 rounded-xl bg-linear-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-600/20 overflow-hidden">
                        {/* <img src={isDark ? logoWhite : logoBlack} alt="SEAL Logo" className="w-6 h-6 object-contain" /> */}<span className="text-white font-bold">S</span>
                    </div>
                    <span className={`font-sans text-xl font-bold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        SEAL
                    </span>
                </div>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${isDark
                                ? 'text-slate-500 hover:text-white hover:bg-white/5'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                                }`}
                        >
                            {link.label}
                        </a>
                    ))}
                    {user?.role !== 'EVENTCOORDINATOR' && user?.role !== 'EXPERT' && (
                        <div className="relative">
                            <button
                                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${isDark
                                    ? 'text-slate-500 hover:text-white hover:bg-white/5'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                                    }`}
                                onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                            >
                                Nhóm
                                <ChevronDown className={`w-4 h-4 transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isTeamDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className={`absolute top-full left-0 mt-2 w-48 rounded-2xl shadow-lg border overflow-hidden ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <button
                                            onClick={() => {
                                                setIsOpen(true);
                                                setIsTeamDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors text-left ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Tạo nhóm
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsViewTeamsOpen?.(true);
                                                setIsTeamDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors text-left border-t ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-100 text-slate-700 hover:bg-slate-50'
                                                }`}
                                        >
                                            <Users className="w-4 h-4" />
                                            Xem các nhóm hiện có
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
                {/* Right actions */}
                <div className="flex items-center gap-2.5">
                    {/* ===== THEME TOGGLE BUTTON ===== */}
                    <motion.button
                        onClick={toggleTheme}
                        whileTap={{ scale: 0.88 }}
                        title={isDark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}
                        className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${isDark
                            ? 'bg-white/6 hover:bg-white/12 border border-white/10 text-yellow-300'
                            : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600'
                            }`}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {isDark ? (
                                <motion.span
                                    key="sun"
                                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute"
                                >
                                    <Sun className="w-4 h-4" />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="moon"
                                    initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                    exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute"
                                >
                                    <Moon className="w-4 h-4" />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* Auth */}
                    {user != null && <NotificationBell />}
                    {user == null ? (
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-linear-to-br from-orange-500 to-pink-500 text-white font-semibold text-xs px-5 py-2 rounded-full hover:brightness-110 transition-all shadow-sm cursor-pointer"
                        >
                            Đăng nhập
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <AvatarButton
                                    avatarUrl={user.avatar}
                                    userName={user.fullName}
                                    isActive={showProfileMenu}
                                    onClick={toggleProfileMenu}
                                />
                                <UserProfileMenu
                                    avt={user.avatar}
                                    isOpen={showProfileMenu}
                                    user={user}
                                    onClose={closeAllMenus}
                                    onLogout={onLogout}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}