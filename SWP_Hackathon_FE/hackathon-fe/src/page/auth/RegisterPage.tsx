import { useState } from 'react';

import * as authService from '../../services/auth/authService'
import type RegisterFormData from '../../types/account/RegisterFormData'
import RegisterForm from '../../component/auth/register/RegisterForm'
import { useNotification } from '../../hook/useNotification';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom'
import { applyServerErrors } from '../../hook/useApplyServerErrors';
import { useForm } from 'react-hook-form';

export default function RegistrationFlow() {
    const navigate = useNavigate();
    const { register, handleSubmit, setError, formState: { errors }, watch, setValue } = useForm<RegisterFormData>({
        defaultValues: {
            studentName: "",
            email: "",
            studentCode: "",
            password: "",
            university: 'FPT University',
            address: "",
            major: "",
            phone: ""
        }
    });

    const [agreedTerms, setAgreedTerms] = useState(true);
    const { addNotification } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinalSubmit = async (data: RegisterFormData) => {
        try {
            if (!agreedTerms) {
                addNotification("Error", "Vui lòng đồng ý với các điều khoản.");
                return;
            }
            if (!data.university) {
                addNotification("Error", "Vui lòng nhập tên trường đại học của bạn.");
                return;
            }
            setIsSubmitting(true);
            console.log(data);
            const res = await authService.register(data);
            if (res.success) {
                addNotification("Success", "tạo tài khoản thành công, vui lòng xác thực tài khoản");
                setIsSubmitting(false);
            }
        } catch (error: any) {
            if (error.response?.status === 400) {
                applyServerErrors<RegisterFormData>(
                    error.response.data.data,
                    setError
                );
            } else {
                addNotification(
                    "Error",
                    error.response?.data?.message || "Có lỗi xảy ra"
                );
            }
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-140 mx-auto pt-4" id="registration-container">
            <div className="glass-panel border border-outline-variant rounded-4xl p-6 sm:p-10 shadow-card animate-scale-in relative">
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                >
                    <div>
                        <div className="mb-8 text-center">
                            <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface mb-2 tracking-tight">
                                Đăng ký tài khoản
                            </h1>
                            <p className="font-body-sm text-sm text-on-surface-variant">
                                Hoàn thiện hồ sơ của bạn để tham gia hệ thống và nhận hỗ trợ.
                            </p>
                        </div>
                        <RegisterForm
                            register={register}
                            errors={errors}
                            onSubmit={handleSubmit(handleFinalSubmit)}
                            isSubmitting={isSubmitting}
                            watch={watch}
                            setValue={setValue}
                        />
                        <div className="pt-2">
                            <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={agreedTerms}
                                    onChange={(e) => setAgreedTerms(e.target.checked)}
                                    className="w-4.5 h-4.5 text-primary border-outline focus:ring-primary rounded mt-0.5 cursor-pointer"
                                />
                                <span className="text-xs text-on-surface-variant/90 leading-normal">
                                    Tôi cam kết tuân thủ các quy định của hệ thống.
                                </span>
                            </label>
                        </div>
                    </div>

                    <p className="text-center text-xs text-on-surface-variant mt-6">
                        Đã có tài khoản?{' '}
                        <button
                            onClick={() => navigate("/login")}
                            className="text-primary font-bold hover:underline cursor-pointer focus:outline-none"
                        >
                            Đăng nhập tại đây
                        </button>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
