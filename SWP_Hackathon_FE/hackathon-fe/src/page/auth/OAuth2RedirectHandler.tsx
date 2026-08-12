import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../../hook/useAuthContext';
import { useNotification } from '../../hook/useNotification';
import { jwtDecode } from 'jwt-decode';
import type { UserProfile } from '../../types/account/Account';

export default function OAuth2RedirectHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuthContext();
    const { addNotification } = useNotification();
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;

        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const avt = searchParams.get('picture');

        if (accessToken && refreshToken) {
            hasProcessed.current = true;
            try {
                const decoded: any = jwtDecode(accessToken);
                const user: UserProfile = {
                    accountId: decoded.accountId,
                    email: decoded.sub,
                    role: decoded.role,
                    fullName: decoded.fullName || "",
                    avatar: avt || "",
                    university: "",
                    accountStatus: decoded.accountStatus,
                    githubId: decoded.githubId,
                    githubUsername: decoded.githubUsername,
                    passwordChanged: decoded.passwordChanged,
                    organization: decoded.organization,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    expiresIn: decoded.exp
                };
                login(user, accessToken, refreshToken);
                const role = user.role ? user.role.toUpperCase() : '';
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
                } else if (role === 'EXPERT') {
                    navigate("/mentor", { replace: true });
                } else if (role === 'EVENTCOORDINATOR') {
                    navigate("/coordinator", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }

            } catch (error) {
                console.error("Invalid token from OAuth2 redirect:", error);
                addNotification('Error', 'Token không hợp lệ. Vui lòng thử lại.');
                navigate('/login', { replace: true });
            }
        } else {
            addNotification('Error', 'Đăng nhập Google thất bại (Thiếu token)');
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate, login, addNotification]);

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="text-sm text-slate-500">Đang xử lý đăng nhập...</p>
            </div>
        </div>
    );
}
