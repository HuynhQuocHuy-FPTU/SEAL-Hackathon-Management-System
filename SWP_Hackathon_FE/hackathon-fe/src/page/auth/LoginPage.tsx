import React, { useState } from 'react';
import { motion } from 'motion/react';
import * as authService from '../../services/auth/authService'
import AuthHeader from '../../component/auth/login/AuthHeader';
import LoginForm from '../../component/auth/login/LoginForm'
import SocialLogin from '../../component/auth/login/SocialLogin'
import { useNotification } from '../../hook/useNotification';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from '../../hook/useAuthContext';
import axiosClient from '../../api/axiosClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotification();
  const { login } = useAuthContext();
  const navigate = useNavigate();


  const location = useLocation();
  const fromState = location.state?.from;
  const from = fromState ? `${fromState.pathname}${fromState.search || ''}` : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addNotification('Error', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    try {
      setIsLoading(true);
      const user = await authService.handleLogin(email, password);
      login(user.data, user.data.accessToken, user.data.refreshToken);
      addNotification('Success', `Đăng nhập thành công`);
      if (from && from !== "/") {
        navigate(from, { replace: true });
        return;
      }
      const role = user.data.role ? user.data.role.toUpperCase() : '';

      if (role === 'ADMIN') {
        navigate("/admin", { replace: true });
      } else if (role === 'STUDENT') {
        const savedRegistrations = localStorage.getItem("seal_registrations");
        const registrations = savedRegistrations ? JSON.parse(savedRegistrations) : [];
        if (registrations.length > 0) {
          navigate("/team", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else if (role === 'EXPERT' || role === 'JUDGE' || role === 'CORE_JUDGE' || role === 'GUEST_JUDGE') {
        // Clear previous flags
        localStorage.removeItem('hasMentorRole');
        localStorage.removeItem('hasJudgeRole');
        localStorage.removeItem('isDualRole');
        try {
          const eventRes = await axiosClient.get('/expert/assigments/events');

          if (eventRes.data.data.length > 0) {
            const firstEventId = eventRes.data.data[0].id ?? eventRes.data.data[0].eventId ?? eventRes.data.data[0].eventID;
            if (firstEventId) {
              const catRoundRes = await axiosClient.get(`/expert/assigments/assigments/all-roles/${firstEventId}`);
              console.log(catRoundRes.data.data);
              if (catRoundRes.data.data.length > 0) {
                let hasMentor = false;
                let hasJudge = false;

                catRoundRes.data.data.forEach((catRound: any) => {
                  console.log(catRound.role);
                  if (catRound.role === 'MENTOR') hasMentor = true;
                  if (catRound.role === 'CORE_JUDGE' || catRound.role === 'GUEST_JUDGE') hasJudge = true;
                });

                // Save flags for sidebar to show switch buttons
                if (hasMentor) localStorage.setItem('hasMentorRole', 'true');
                if (hasJudge) localStorage.setItem('hasJudgeRole', 'true');
                if (hasMentor && hasJudge) localStorage.setItem('isDualRole', 'true');

                // Save first category just in case
                const firstCatRound = catRoundRes.data.data[0];
                localStorage.setItem('assignedCategoryRoundId', firstCatRound.categoryRoundId);
                localStorage.setItem('assignedCategoryId', firstCatRound.categoryId);

                if (hasMentor) {
                  navigate("/mentor", { replace: true });
                  return;
                }
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch expert assignments during login:", err);
        }
        // Fallback for Judge or if API fails
        navigate("/judge", { replace: true });
      } else if (role === 'EVENTCOORDINATOR') {
        navigate("/coordinator", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      addNotification('Error', error.response?.data?.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    let redirectUrl = apiUrl ? apiUrl.replace(/\/$/, '') : 'http://localhost:8080';
    redirectUrl += '/oauth2/authorization/google';
    window.location.href = redirectUrl;
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
        <h2 className="text-2xl font-bold font-sans text-slate-900 mb-8 text-center tracking-tight">
          Chào mừng trở lại
        </h2>
        <LoginForm
          email={email}
          pasword={password}
          isLoading={isLoading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          onForgotPassword={() => navigate("/forgot-password")}
        />
        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-4 text-slate-400 font-semibold uppercase tracking-wider select-none font-sans">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>
        <SocialLogin
          onGoogle={handleGoogleLogin}
        />
        <div className="mt-8 text-center pt-2 border-t border-slate-50">
          <p className="text-sm text-slate-500 font-sans font-medium">
            Chưa có tài khoản?
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-[#0058be] hover:text-blue-700 font-bold ml-1.5 transition-colors focus:outline-none"
            >
              Đăng ký tài khoản mới
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
