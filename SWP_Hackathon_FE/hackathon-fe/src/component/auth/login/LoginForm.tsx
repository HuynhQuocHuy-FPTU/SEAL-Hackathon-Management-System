import { ArrowRight } from 'lucide-react'
import type React from 'react';

interface LoginFormProps {
    email: string,
    pasword: string,
    isLoading: boolean,
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onForgotPassword: () => void;
}

export default function LoginForm({
    email,
    pasword,
    isLoading,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    onForgotPassword,
}: LoginFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 font-sans uppercase tracking-wider" htmlFor="email">
                    Địa chỉ Email
                </label>
                <input
                    className="w-full rounded-xl border border-slate-200 bg-white placeholder-slate-400 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    value={email} onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="abc@gmail.com"
                    required />
            </div>
            {/* Password field */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-500 font-sans uppercase tracking-wider" htmlFor="password">
                        Mật khẩu
                    </label>
                    <button
                        className="text-xs font-semibold text-[#0058be] hover:text-blue-700 transition-colors font-sans"
                        type="button"
                        onClick={onForgotPassword}>Quên mật khẩu?</button>
                </div>
                <input
                    className="w-full rounded-xl border border-slate-200 bg-white placeholder-slate-400 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    value={pasword} onChange={(e) => onPasswordChange(e.target.value)}
                    placeholder="••••••••"
                    id="password"
                    type="password"
                    required
                />
            </div>
            {/* login */}
            <div className="pt-2">
                <button
                    disabled={isLoading}
                    type="submit"
                    className="w-full bg-linear-to-br from-orange-500 to-pink-500 text-white font-semibold rounded-full py-3 px-6 hover:opacity-95 transition-all shadow-md shadow-blue-500/10 active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50">
                    {isLoading ? (<div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>) :
                        (<>
                            <span>Đăng nhập</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>)}
                </button>
            </div>
        </form>
    )
}