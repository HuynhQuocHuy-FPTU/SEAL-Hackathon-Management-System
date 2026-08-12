import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';
import AuthHeader from '../../component/auth/login/AuthHeader';
import { useNotification } from '../../hook/useNotification';
import { handleForgotPassword } from '../../services/auth/authService'
type ForgotStep = 'input' | 'sent';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<ForgotStep>('input');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            addNotification('Error', 'Vui lòng nhập địa chỉ email của bạn.');
            return;
        }
        if (!email.includes('@')) {
            addNotification('Error', 'Địa chỉ email không hợp lệ.');
            return;
        }

        try {
            setIsLoading(true);
            const res = await handleForgotPassword(email);
            // addNotification("Success", res);
            navigate("/reset-password");
            setStep('sent');
        } catch (error: any) {
            addNotification('Error', error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md relative z-10 px-4 md:px-0">
            <AuthHeader />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)] p-8 md:p-10"
            >
                <AnimatePresence mode="wait">
                    {step === 'input' ? (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            <div className="mb-8 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-7 h-7 text-[#0058be]" />
                                </div>
                                <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
                                    Quên mật khẩu?
                                </h2>
                                <p className="text-sm text-slate-500 mt-2 font-sans leading-relaxed">
                                    Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu đến hộp thư của bạn.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="forgot-email"
                                        className="block text-xs font-semibold text-slate-500 mb-2 font-sans uppercase tracking-wider"
                                    >
                                        Địa chỉ Email
                                    </label>
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="abc@gmail.com"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white placeholder-slate-400 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-linear-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-semibold rounded-full py-3 px-6 hover:opacity-95 transition-all shadow-md shadow-blue-500/10 active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    ) : (
                                        <>
                                            <span>Gửi liên kết đặt lại</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sent"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="text-center py-4"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
                                className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5"
                            >
                                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                            </motion.div>
                            <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight">
                                Email đã được gửi!
                            </h2>
                            <p className="text-sm text-slate-500 mt-2 mb-6 font-sans leading-relaxed">
                                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{' '}
                                <span className="font-semibold text-slate-700">{email}</span>.
                                Kiểm tra hộp thư của bạn (kể cả mục Spam).
                            </p>
                            <button
                                type="button"
                                onClick={() => { setStep('input'); setEmail(''); }}
                                className="text-sm text-[#0058be] hover:text-blue-700 font-semibold transition-colors font-sans"
                            >
                                Dùng email khác
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-semibold font-sans transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại trang đăng nhập
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
