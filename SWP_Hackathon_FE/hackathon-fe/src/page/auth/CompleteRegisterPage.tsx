import { useState } from 'react';
import type { FormEvent } from 'react';
import * as authService from '../../services/auth/authService';
import type { StudentProfileForm } from '../../types/account/Account';
import { useNotification } from '../../hook/useNotification';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { InputField, UniversitySelection } from '../../component/input/InputField';
import { ImageUpload } from '../../component/input/ImageUpload';
import { useEffect } from 'react';

export default function CompleteRegisterPage() {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const avt = searchParams.get('picture');
        if (accessToken) {
            localStorage.setItem('token', accessToken);
        }
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        if (avt) {
            setFormData(prev => ({ ...prev, avatar: avt }));
        }
    }, [searchParams]);

    const [formData, setFormData] = useState<StudentProfileForm>({
        studentName: "",
        studentCode: "",
        phone: "",
        address: "",
        major: "",
        university: 'FPT University',
        avatar: ""
    });

    const [universityType, setUniversityType] = useState<"FPT University" | "Other">("FPT University");
    const [errorMsg, setErrorMsg] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: keyof StudentProfileForm, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleFinalSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setErrorMsg("");
            setIsSubmitting(true);

            const res = await authService.completeRegisterWithGoogle(formData);

            if (res.success) {
                addNotification("Success", "Hoàn tất hồ sơ thành công!");
                navigate('/login');
            } else {
                addNotification("Info", res.message || "Hoàn tất hồ sơ thất bại");
            }
        } catch (error: any) {
            if (error.response?.status === 400 && error.response.data?.data) {
                setFieldErrors(error.response.data.data);
            } else {
                addNotification("Error", error.response?.data?.message || "Có lỗi xảy ra");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-140 mx-auto pt-4" id="complete-registration-container">
            <div className="glass-panel border border-outline-variant rounded-4xl p-6 sm:p-10 shadow-card animate-scale-in relative">
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                >
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium animate-shake">
                            {errorMsg}
                        </div>
                    )}
                    <div>
                        <div className="mb-8 text-center">
                            <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface mb-2 tracking-tight">
                                Hoàn thiện hồ sơ
                            </h1>
                            <p className="font-body-sm text-sm text-on-surface-variant">
                                Bạn sắp hoàn thành rồi! Hãy hoàn thiện hồ sơ sinh viên để tham gia.
                            </p>
                        </div>
                        <form onSubmit={handleFinalSubmit} className="space-y-5" id="completeRegistrationForm">
                            <div className='flex justify-center'>
                                <ImageUpload
                                    label="Ảnh đại diện"
                                    value={formData.avatar}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField
                                    field="studentName"
                                    label="Họ và tên"
                                    formData={formData}
                                    onChangeField={handleChange}
                                    error={fieldErrors.studentName}
                                    placeholder="Nhập họ và tên"
                                />
                                <InputField
                                    field="studentCode"
                                    label="Mã sinh viên"
                                    formData={formData}
                                    onChangeField={handleChange}
                                    error={fieldErrors.studentCode}
                                    placeholder="VD: SE123456"
                                />
                                <InputField
                                    field="phone"
                                    label="Số điện thoại"
                                    formData={formData}
                                    onChangeField={handleChange}
                                    error={fieldErrors.phone}
                                    placeholder="0...."
                                />
                                <InputField
                                    field="major"
                                    label="Ngành học"
                                    formData={formData}
                                    onChangeField={handleChange}
                                    error={fieldErrors.major}
                                    placeholder="SE, DE,... "
                                />
                            </div>
                            <InputField
                                field="address"
                                label="Địa chỉ"
                                formData={formData}
                                onChangeField={handleChange}
                                error={fieldErrors.address}
                                placeholder="Nhập địa chỉ"
                            />
                            {/* University Selection */}
                            <div className="space-y-2 pt-1">
                                <span className="text-xs font-semibold text-on-surface-variant ml-1">
                                    Chọn trường đại học
                                </span>
                                <div className="flex gap-6">
                                    <UniversitySelection
                                        value="Đại học FPT"
                                        checked={universityType === "FPT University"}
                                        onSelect={() => {
                                            setUniversityType("FPT University");
                                            handleChange("university", "FPT University");
                                        }}
                                    />
                                    <UniversitySelection
                                        value="Trường khác"
                                        checked={universityType === "Other"}
                                        onSelect={() => {
                                            setUniversityType("Other");
                                            handleChange("university", "");
                                        }}
                                    />
                                </div>
                                {fieldErrors.university && <p className="text-red-500 text-xs ml-1 mt-1 animate-fade-in">{fieldErrors.university}</p>}
                            </div>
                            {universityType === 'Other' && (
                                <div className="space-y-1.5 animate-slide-down">
                                    <InputField
                                        field="university"
                                        label="Tên trường đại học"
                                        formData={formData}
                                        onChangeField={handleChange}
                                        error={fieldErrors.university}
                                        placeholder="Bạn học trường nào?"
                                    />
                                </div>
                            )}
                            <div className="flex pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-2 bg-[#F26F21] hover:brightness-110 text-white py-3 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất hồ sơ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
