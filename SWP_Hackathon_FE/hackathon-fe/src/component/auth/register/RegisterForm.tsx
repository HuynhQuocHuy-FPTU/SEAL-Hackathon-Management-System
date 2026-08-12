import React, { useState } from "react";
import type RegisterFormData from '../../../types/account/RegisterFormData'
import { InputField, UniversitySelection } from '../../input/InputField'
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface RegisterFormProps {
    register: UseFormRegister<RegisterFormData>;
    errors: FieldErrors<RegisterFormData>;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    watch: UseFormWatch<RegisterFormData>;
    setValue: UseFormSetValue<RegisterFormData>;
}

export default function RegisterForm({
    register,
    errors,
    onSubmit,
    isSubmitting,
    watch,
    setValue
}: RegisterFormProps) {
    const universityValue = watch("university");
    const [universityType, setUniversityType] = useState<"FPT University" | "Other">(
        universityValue === "FPT University" ? "FPT University" : "Other"
    );

    return (
        <form onSubmit={onSubmit} className="space-y-5" id="registrationForm">
            {/* Email */}
            <InputField
                field="email"
                label="Email"
                register={register}
                error={errors.email?.message}
                placeholder="example@gmail.com"
            />
            {/* Password */}
            <InputField
                field="password"
                label="Mật khẩu"
                register={register}
                error={errors.password?.message}
                placeholder="Tối thiểu 8 ký tự"
                type="password"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Name */}
                <InputField
                    field="studentName"
                    label="Họ và tên"
                    register={register}
                    error={errors.studentName?.message}
                    placeholder="Nhập họ và tên"
                />
                {/* Student Code */}
                <InputField
                    field="studentCode"
                    label="Mã sinh viên"
                    register={register}
                    error={errors.studentCode?.message}
                    placeholder="VD: SE123456"
                />
                {/* Phone */}
                <InputField
                    field="phone"
                    label="Số điện thoại"
                    register={register}
                    error={errors.phone?.message}
                    placeholder="0...."
                />
                {/* Major */}
                <InputField
                    field="major"
                    label="Ngành học"
                    register={register}
                    error={errors.major?.message}
                    placeholder="SE, DE,... "
                />
            </div>
            <InputField
                field="address"
                label="Địa chỉ"
                register={register}
                error={errors.address?.message}
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
                            setValue("university", "FPT University");
                        }}
                    />
                    <UniversitySelection
                        value="Trường khác"
                        checked={universityType === "Other"}
                        onSelect={() => {
                            setUniversityType("Other");
                            setValue("university", "");
                        }}
                    />
                </div>
                {errors.university?.message && <p className="text-red-500 text-xs ml-1 mt-1 animate-fade-in">{errors.university.message}</p>}
            </div>
            {universityType === 'Other' && (
                <div className="space-y-1.5 animate-slide-down">
                    <InputField
                        field="university"
                        label="Tên trường đại học"
                        register={register}
                        error={errors.university?.message}
                        placeholder="Bạn học trường nào?"
                    />
                </div>
            )}
            <div className="flex pt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 bg-linear-to-r from-orange-500  to-pink-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                    {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
            </div>
        </form>
    )
}