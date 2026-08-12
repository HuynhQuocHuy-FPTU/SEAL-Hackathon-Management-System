import axiosClient from '../../api/axiosClient'
import type RegisterFormData from '../../types/account/RegisterFormData';
import type { StudentProfileForm } from '../../types/account/Account'

export const handleLogin = async (
    email: string,
    password: string
) => {
    const response = await axiosClient.post('/account/login', { email, password });
    return response.data;
};
export const handleLogout = async () => {
    await axiosClient.post('/account/logout', localStorage.getItem("refreshToken"));
};
export const register = async (formData: RegisterFormData) => {
    const res = await axiosClient.post('/account/register', formData);
    console.log(res.data);
    return res.data;
};
export const verifyEmail = async (token: string) => {
    const res = await axiosClient.get("/account/verify-email", {
        params: {
            token: token
        }
    });
    return res.data;
};
export const handleForgotPassword = async (email: string) => {
    const res = await axiosClient.post("/account/forgot-password", { email });
    return res.data;
};

export const handleResetPassword = async (email: string, otp: string, newPassword: string) => {
    const res = await axiosClient.post("/account/reset-password", { email, otp, newPassword });
    return res.data;
}

export const completeRegisterWithGoogle = async (StudentProfile: StudentProfileForm) => {
    const res = await axiosClient.post("/account/complete-register", StudentProfile);
    return res.data;
}

export const handleGoogleLogin = async (token: string) => {
    const res = await axiosClient.post("/account/google-login", { token });
    return res.data;
}

export const linkGithub = async () => {
    const res = await axiosClient.get("/github/oauth/authorize");
    return res.data;
}