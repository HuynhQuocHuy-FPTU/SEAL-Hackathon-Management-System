import type React from "react";
import { motion } from "motion/react";

interface NavigateButtonProps {
    Icon: React.ElementType;
    label: string;
    activeTab: string;
    tabValue: string;
    onClick: () => void;
}

export default function NavigateButton({
    Icon,
    label,
    activeTab,
    tabValue,
    onClick,
}: NavigateButtonProps) {
    const isActive = activeTab === tabValue;

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, y: -1, boxShadow: "0 10px 25px -5px rgba(242,111,33,0.1)" }}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-bold tracking-wide transition-all duration-300 ${
                isActive
                    ? "text-[#F26F21] drop-shadow-[0_0_8px_rgba(242,111,33,0.4)]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/30"
            }`}
        >
            {isActive && (
                <motion.div
                    layoutId="activeSidebarTabBackground"
                    className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(242,111,33,0.15)] border border-white/50"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
            )}
            <Icon className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{label}</span>
        </motion.button>
    );
}