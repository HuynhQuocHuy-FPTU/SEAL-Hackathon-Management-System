import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type ToastProps = {
    toastMessage: string | null;
    setToastMessage: (message: string | null) => void;
};

export default function Toast({
    toastMessage,
    setToastMessage,
}: ToastProps) {
    return (
        <AnimatePresence>
            {toastMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    className="fixed bottom-6 left-6 z-50 max-w-sm bg-slate-900 text-white text-xs px-5 py-4 rounded-2xl shadow-xl flex items-start gap-3 border border-slate-800"
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1 shadow shadow-emerald-500"></div>
                    <div className="flex-1 leading-relaxed">{toastMessage}</div>
                    <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}