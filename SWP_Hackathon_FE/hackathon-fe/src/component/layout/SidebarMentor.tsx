import {
    LayoutDashboard,
    Users,
    MessageSquare,
    UsersRound,
    FileSpreadsheet,
    Trophy,
    Scale,
    Repeat,
    RotateCcw
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import NavigateButton from "../button/NavigateButton";
import logoWhite from '../../assets/logo_white.png';
import { useAuthContext } from "../../hook/useAuthContext";

export default function SidebarMentor() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuthContext();

    const role = (user?.role || '').toUpperCase();
    const hasMentorRole = localStorage.getItem('hasMentorRole') === 'true';
    const hasJudgeRole = localStorage.getItem('hasJudgeRole') === 'true';
    const isDualRole = localStorage.getItem('isDualRole') === 'true';

    const menuItems: any[] = [];

    const isMentorContext = pathname.startsWith('/mentor');
    const isJudgeContext = pathname.startsWith('/judge');

    if ((role === 'EXPERT' && isMentorContext) || role === 'MENTOR') {
        menuItems.push(
            { name: "Tổng quan", path: "/mentor", icon: LayoutDashboard, tabValue: "mentor" },
            { name: "Yêu cầu", path: "/mentor/requests", icon: MessageSquare, tabValue: "requests" },
            { name: "Nhóm của tôi", path: "/mentor/my-teams", icon: UsersRound, tabValue: "my-teams" }
        );
    }

    if ((role === 'EXPERT' && isJudgeContext) || role === 'JUDGE' || role === 'INTERNAL_JUDGE' || role === 'GUEST_JUDGE') {
        menuItems.push(
            { name: "Tổng quan", path: "/judge", icon: LayoutDashboard, tabValue: "judge" },
            { name: "Bài thi được giao", path: "/judge/submissions", icon: FileSpreadsheet, tabValue: "submissions" },
            { name: "Bảng xếp hạng", path: "/judge/rankings", icon: Trophy, tabValue: "rankings" },
            { name: "Tiêu chí chấm thi", path: "/judge/criteria", icon: Scale, tabValue: "criteria" },
            { name: "Yêu cầu chấm lại", path: "/judge/review-requests", icon: RotateCcw, tabValue: "review-requests" }
        );
    }
    
    // We will handle isDualRole as a separate footer element below


    const currentTab = menuItems.slice().reverse().find(item => pathname === item.path || (item.path !== '/mentor' && item.path !== '/judge' && pathname.startsWith(item.path)))?.tabValue || menuItems[0]?.tabValue;

    return (
        <aside className="w-64 fixed left-0 top-0 h-screen bg-white/70 backdrop-blur-3xl border-r border-white/60 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300">

            <div className="p-6 pb-6 cursor-pointer group" onClick={() => navigate('/')}>
                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-lg shadow-[0_4px_12px_rgba(0,88,190,0.2)] group-hover:shadow-[0_4px_20px_rgba(0,88,190,0.3)] transition-shadow overflow-hidden">
                        S
                    </div>

                    <div>
                        <h2 className="font-extrabold text-lg text-brand-on-surface tracking-tight leading-none group-hover:text-brand-primary transition-colors">
                            SEAL
                        </h2>

                        <p className="text-[10px] font-bold text-brand-on-surface-variant/70 uppercase tracking-wider mt-1">
                            {isJudgeContext ? 'Judge Panel' : 'Mentor Panel'}
                        </p>
                    </div>

                </div>
            </div>
            
            {/* Removed Debug Panel */}

            {/* Menu */}
            <nav className="flex-1 px-3 space-y-1 pb-4 overflow-y-auto scrollbar-hide">
                {menuItems.map((item, index) => {
                    if (item.isHeader) {
                        return (
                            <div key={`header-${index}`} className="px-4 pt-5 pb-1 text-[10px] font-extrabold text-brand-on-surface-variant/50 uppercase tracking-widest">
                                {item.name}
                            </div>
                        );
                    }

                    const Icon = item.icon;

                    return (
                        <NavigateButton
                            key={item.tabValue}
                            Icon={Icon}
                            label={item.name}
                            activeTab={currentTab}
                            tabValue={item.tabValue}
                            onClick={() => {
                                navigate(item.path);
                            }}
                        />
                    );
                })}
            </nav>

            {/* Switch Role Footer */}
            {isDualRole && (
                <div className="p-4 border-t border-slate-100/80 mt-auto bg-slate-50/50">
                    <div className="text-[10px] font-extrabold text-brand-on-surface-variant/60 uppercase tracking-widest mb-3 pl-2 flex items-center gap-2">
                        <span>Chuyển đổi chức vụ</span>
                    </div>
                    <button
                        onClick={() => navigate(isMentorContext ? '/judge' : '/mentor')}
                        className="w-full relative overflow-hidden group flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 hover:from-brand-primary hover:to-brand-secondary border border-slate-200/50 hover:border-transparent transition-all duration-300 hover:shadow-[0_8px_16px_rgba(0,88,190,0.25)]"
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-white/80 shadow-sm group-hover:bg-white/20 flex items-center justify-center transition-colors">
                                <Repeat className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-sm text-slate-800 group-hover:text-white transition-colors leading-tight">
                                    {isMentorContext ? 'Góc nhìn Judge' : 'Góc nhìn Mentor'}
                                </span>
                                <span className="text-[10px] text-slate-500 group-hover:text-white/80 transition-colors">
                                    Click để đổi
                                </span>
                            </div>
                        </div>
                        <div className="relative z-10 w-2 h-2 rounded-full bg-slate-400 group-hover:bg-white transition-colors animate-pulse"></div>
                    </button>
                </div>
            )}
        </aside>
    );
}