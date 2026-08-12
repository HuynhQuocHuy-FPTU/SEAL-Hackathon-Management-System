import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, Mail, KeyRound } from 'lucide-react';
import AuthHeader from '../../component/auth/login/AuthHeader';
import { useNotification } from '../../hook/useNotification';
import { handleResetPassword } from '../../services/auth/authService'
export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !otp || !newPassword) {
            addNotification('Error', 'Vui lòng điền đầy đủ thông tin.');
            return;
        }

        if (!email.includes('@')) {
            addNotification('Error', 'Địa chỉ email không hợp lệ.');
            return;
        }

        try {
            setIsLoading(true);
            await handleResetPassword(email, otp, newPassword);
            addNotification('Success', 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
            navigate('/login');
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)] p-8 md:p-10"
            >
                <div className="mb-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-7 h-7 text-[#0058be]" />
                    </div>
                    <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
                        Tạo mật khẩu mới
                    </h2>
                    <p className="text-sm text-slate-500 mt-2 font-sans leading-relaxed">
                        Nhập mã OTP đã được gửi đến email của bạn và thiết lập mật khẩu mới.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="reset-email"
                            className="block text-xs font-semibold text-slate-500 mb-2 font-sans uppercase tracking-wider"
                        >
                            Địa chỉ Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                id="reset-email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="abc@gmail.com"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white placeholder-slate-400 pl-11 pr-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="reset-otp"
                            className="block text-xs font-semibold text-slate-500 mb-2 font-sans uppercase tracking-wider"
                        >
                            Mã OTP
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <KeyRound className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                id="reset-otp"
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="Nhập mã OTP gồm 6 chữ số"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white placeholder-slate-400 pl-11 pr-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="reset-password"
                            className="block text-xs font-semibold text-slate-500 mb-2 font-sans uppercase tracking-wider"
                        >
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                id="reset-password"
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới của bạn"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white placeholder-slate-400 pl-11 pr-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-linear-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-semibold rounded-full py-3 px-6 hover:opacity-95 transition-all shadow-md shadow-blue-500/10 active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 mt-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                            <>
                                <span>Xác nhận đổi mật khẩu</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

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
