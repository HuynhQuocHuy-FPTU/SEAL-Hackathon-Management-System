import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as authService from '../../services/auth/authService'
import { useNotification } from '../../hook/useNotification'
type VerifyStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<VerifyStatus>("loading");
    const { addNotification } = useNotification();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const token = searchParams.get("token");
                if (!token) {
                    setStatus("error");
                    addNotification("Error", "Token xác thực không hợp lệ.");
                    return;
                }
                const res = await authService.verifyEmail(token);
                if (res.success) {
                    setStatus("success");
                    addNotification("Success", "Email đã được xác thực thành công.");
                    setTimeout(() => {
                        navigate("/login");
                    }, 3000);
                }
            } catch (error: any) {
                setStatus("error");

                addNotification("Error", error.response?.data?.message || error.message);
            }
        };
        verifyEmail();
    }, [navigate, searchParams]);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
                {status === "loading" && (
                    <>
                        <div className="text-5xl mb-4">⏳</div>
                        <h1 className="text-2xl font-bold mb-2">
                            Đang xác thực
                        </h1>
                    </>
                )}
                {status === "success" && (
                    <>
                        <div className="text-5xl mb-4">✅</div>
                        <h1 className="text-2xl font-bold text-green-600 mb-2">
                            Thành công
                        </h1>
                        <p className="text-sm text-gray-500">
                            Đang chuyển đến trang đăng nhập...
                        </p>
                    </>
                )}
                {status === "error" && (
                    <>
                        <div className="text-5xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold text-red-600 mb-2">
                            Thất bại
                        </h1>
                    </>
                )}
            </div>
        </div>
    );
}