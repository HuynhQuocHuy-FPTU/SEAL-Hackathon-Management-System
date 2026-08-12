import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'motion/react';

export default function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-brand-surface-low flex items-center justify-center p-6 selection:bg-brand-primary/20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-brand-outline-variant/30 p-10 text-center relative overflow-hidden"
            >
                {/* Background Decoration */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <motion.div 
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                        className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100"
                    >
                        <ShieldAlert className="w-12 h-12 text-brand-error" />
                    </motion.div>
                    
                    <h1 className="text-2xl font-extrabold text-brand-on-surface tracking-tight mb-2">
                        Từ chối truy cập
                    </h1>
                    <p className="text-sm font-medium text-brand-on-surface-variant/80 mb-8 leading-relaxed">
                        Rất tiếc! Có vẻ như bạn không có quyền xem trang này. Nếu bạn cho rằng đây là sự nhầm lẫn, vui lòng liên hệ quản trị viên.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(-1)}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-surface border border-brand-outline-variant/50 text-sm font-bold text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-white shadow-sm transition-all"
                        >
                            <ArrowLeft size={16} />
                            Quay lại
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/')}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary text-white text-sm font-bold shadow-[0_4px_12px_rgba(0,88,190,0.2)] hover:shadow-[0_4px_20px_rgba(0,88,190,0.3)] transition-all"
                        >
                            <Home size={16} />
                            Trang chủ
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
