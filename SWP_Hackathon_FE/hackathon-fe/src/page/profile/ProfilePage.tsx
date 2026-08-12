import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Save, X, Mail, Eye, EyeOff, ShieldCheck, Building2, GraduationCap, KeyRound, ArrowLeft, BookOpen, Link2, CheckCircle2, ArrowRight, History, Star, Trophy } from 'lucide-react';
import { FaGithub } from "react-icons/fa";
import { getMyProfile, updateMyProfile, changePassword as changePasswordApi } from '../../services/auth/userService';
import { linkGithub } from '../../services/auth/authService';
import { useNotification } from '../../hook/useNotification';
import { useAuthContext } from '../../hook/useAuthContext';
import type { UserProfile } from '../../types/account/Account';
import { getHistoryStudent } from '../../services/team/teamsService';
import type { HistoryProfile } from '../../types/account/HistoryProfile';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    const { user, updateUser } = useAuthContext();
    const [fullProfile, setFullProfile] = useState<any>(null);

    //github
    const [github, setGithub] = useState<UserProfile>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [history, setHistory] = useState<HistoryProfile | null>(null);

    // Temporary form states mapped to Profile type fields
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
    const [university, setUniversity] = useState(user?.university || '');
    const [department, setDepartment] = useState((user as any)?.department || '');
    const [organization, setOrganization] = useState((user as any)?.organization || '');
    const [accountId, setAccountId] = useState(user?.accountId || '');
    const [accountStatus, setAccountStatus] = useState('ACTIVE');

    // Security password modal state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    const { addNotification } = useNotification();

    const showToast = (message: string, type: 'success' | 'info' | 'error') => {
        const notifType = type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info';
        addNotification(notifType as 'Success' | 'Info' | 'Warning' | 'Error', message);
    };
    useEffect(() => {
        const error = searchParams.get("error");
        const githubLinked = searchParams.get("githubLinked");

        if (error) {
            showToast(`Liên kết Github thất bại: ${error}`, "error");
            setSearchParams({}, { replace: true });
        } else if (githubLinked === 'true') {
            showToast("Liên kết Github thành công!", "success");
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getMyProfile();
                const data = response.data || response;
                setFullProfile(data);
                setFullName(data.fullName || data.userName || user?.fullName || '');
                setEmail(data.email || user?.email || '');
                setAvatarUrl(data.avatarUrl || data.avatar || user?.avatar || '');
                setUniversity(data.university || user?.university || '');
                setDepartment(data.department || (user as any)?.department || '');
                setOrganization(data.organization || '');
                setAccountId(data.accountId || user?.accountId || '');
                setAccountStatus(data.accountStatus || 'ACTIVE');
                setGithub(response.data);

                const accountIdToUse = data.accountId || user?.accountId;
                if (accountIdToUse) {
                    try {
                        const historyRes = await getHistoryStudent();
                        setHistory(historyRes?.data || historyRes);
                    } catch (historyErr) {
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                showToast('Không thể tải dữ liệu hồ sơ', 'error');
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    const handleEditToggle = () => {
        if (isEditing) {
            if (fullProfile) {
                setFullName(fullProfile.fullName || fullProfile.userName || user?.fullName || '');
                setEmail(fullProfile.email || user?.email || '');
                setAvatarUrl(fullProfile.avatarUrl || fullProfile.avatar || user?.avatar || '');
                setUniversity(fullProfile.university || user?.university || '');
                setDepartment(fullProfile.department || (user as any)?.department || '');
                setOrganization(fullProfile.organization || '');
            }
            setIsEditing(false);
            showToast("Đã hủy bỏ thay đổi", "info");
        } else {
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        if (currentPassword || newPassword || confirmPassword) {
            if (!currentPassword || !newPassword || !confirmPassword) {
                showToast("Vui lòng nhập đầy đủ các trường nếu bạn muốn cập nhật mật khẩu.", "info");
                return;
            }
            if (newPassword !== confirmPassword) {
                showToast("Mật khẩu mới không khớp.", "info");
                return;
            }
        }

        try {
            const profileData = {
                userName: fullName,
                email,
                avatarUrl,
                university,
                department,
                organization
            };
            await updateMyProfile(profileData);

            if (currentPassword && newPassword && confirmPassword) {
                await changePasswordApi({
                    oldPassword: currentPassword,
                    newPassword: newPassword
                });
            }
            const response = await getMyProfile();
            const data = response.data || response;
            setFullProfile(data);

            setFullName(data.fullName || data.userName || '');
            setEmail(data.email || '');
            setAvatarUrl(data.avatarUrl || data.avatar || '');
            setUniversity(data.university || '');
            setDepartment(data.department || '');
            setOrganization(data.organization || '');

            updateUser({
                fullName: data.fullName || data.userName,
                email: data.email,
                avatar: data.avatarUrl || data.avatar,
                university: data.university
            });

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsEditing(false);
            showToast("Cập nhật cài đặt thành công!", "success");
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.title || "Cập nhật cài đặt thất bại";
            showToast(`Lỗi: ${errorMsg}`, "error");
        }
    };

    const handleLinkGithub = async () => {
        try {
            const url = await linkGithub();
            if (url) {
                window.location.href = url;
            }
        } catch (error: any) {
            showToast(error.response.data.message, "error");
        }
    };

    const avatarPresets = [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB_3yjuyjnv_TcoO8nQB_PrHMbgq_YX69t8lfmFG3EKiEmaVPfPrLooUgH7BVknIFaLbAQrIOZ7X0CwZQJtz3MKQ1Zj2yzONVTTGqOBghQZvidRsQugTN723G60G3B-I4w9hrPXXmWbVFuLSHfSynOPgQVmvFzW6hSrTa9bAneTl4Y_rV8ZB6wn4Q0yQuyQg70MyKnUqPggLlREl0x0VUVDQ0ZNxZVfFu1_-p-G9R9up4Op11uXMaFOt6SFqL75cCpLckF4CfP3enuU',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    ];

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)] p-8 md:p-10"
            >
                <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-3xl border-b border-slate-200 h-16 flex items-center px-4 md:px-8 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Quay lại
                    </button>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Cài đặt tài khoản</h2>
                            <p className="text-[11px] text-slate-500 mt-1">Quản lý hồ sơ công khai và các tùy chọn bảo mật của bạn.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsHistoryOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                            >
                                <History className="w-4 h-4" />
                                Lịch sử tham gia
                            </button>
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={handleEditToggle}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                                >
                                    <Edit2 className="w-4 h-4 text-slate-500" />
                                    Chỉnh sửa hồ sơ
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleEditToggle}
                                        className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        Lưu thay đổi
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Layout Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                        {/* Left Column: Public Profile & Details */}
                        <div className="xl:col-span-2 space-y-8">
                            {/* Public Profile Card */}
                            <section className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-linear-to-b from-blue-500 to-orange-500" />
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    Hồ sơ công khai
                                </h3>

                                <div className="flex flex-col sm:flex-row gap-8 items-start">
                                    {/* Avatar Section */}
                                    <div className="flex flex-col items-center gap-4 shrink-0 mx-auto sm:mx-0">
                                        <div
                                            className={`w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden relative group/avatar ${isEditing ? 'cursor-pointer ring-4 ring-blue-50' : ''}`}
                                            onClick={() => { if (isEditing) setShowPhotoModal(true); }}
                                        >
                                            <img
                                                alt="Profile picture"
                                                referrerPolicy="no-referrer"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                                                src={avatarUrl || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200'}
                                            />
                                            {isEditing && (
                                                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300">
                                                    <Edit2 className="w-6 h-6 text-white mb-1" />
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Thay đổi</span>
                                                </div>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => setShowPhotoModal(true)}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                            >
                                                Đổi ảnh
                                            </button>
                                        )}
                                    </div>

                                    {/* Form Fields */}
                                    <div className="flex-1 w-full space-y-5">
                                        <div>
                                            <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên</label>
                                            {!isEditing ? (
                                                <div className="text-sm font-semibold text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                                                    {fullName || 'Chưa cập nhật'}
                                                </div>
                                            ) : (
                                                <input
                                                    required
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="Nhập họ và tên của bạn"
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm transition-all"
                                                />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {(user.role === 'STUDENT' || user.role === 'ADMIN' || user.role === 'EVENTCOORDINATOR') && (
                                                <div className={user.role !== 'STUDENT' ? 'sm:col-span-2' : ''}>
                                                    <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Trường đại học / Tổ chức</label>
                                                    {!isEditing ? (
                                                        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                                                            <GraduationCap className="w-4 h-4 text-slate-400" />
                                                            <span className="truncate">{university || 'Chưa cập nhật'}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <GraduationCap className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                                            <input
                                                                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm transition-all placeholder:text-slate-400"
                                                                type="text"
                                                                value={university}
                                                                onChange={(e) => setUniversity(e.target.value)}
                                                                placeholder="VD: Đại học FPT"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {user.role === 'EXPERT' && (
                                                <>
                                                    <div>
                                                        <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Phòng ban / Khoa</label>
                                                        {!isEditing ? (
                                                            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                                                                <BookOpen className="w-4 h-4 text-slate-400" />
                                                                <span className="truncate">{department || 'Chưa cập nhật'}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="relative">
                                                                <BookOpen className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                                                <input
                                                                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm transition-all placeholder:text-slate-400"
                                                                    type="text"
                                                                    value={department}
                                                                    onChange={(e) => setDepartment(e.target.value)}
                                                                    placeholder="Tên phòng ban / khoa"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tổ chức / Công ty</label>
                                                        {!isEditing ? (
                                                            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                                                                <Building2 className="w-4 h-4 text-slate-400" />
                                                                <span className="truncate">{organization || 'Chưa cập nhật'}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="relative">
                                                                <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                                                <input
                                                                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm transition-all placeholder:text-slate-400"
                                                                    type="text"
                                                                    value={organization}
                                                                    onChange={(e) => setOrganization(e.target.value)}
                                                                    placeholder="Tên công ty hoặc tổ chức"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Account Stats & Contact Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Account Details */}
                                <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                    <h3 className="text-base font-bold text-slate-900 mb-5">Chi tiết tài khoản</h3>
                                    <div className="space-y-4">
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500 uppercase">ID Tài khoản</span>
                                            <span className="text-sm font-bold text-slate-900 font-mono bg-white px-2 py-1 rounded-md shadow-xs border border-slate-200">
                                                #{accountId || 'Trống'}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Vai trò</span>
                                            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                                {user.role || 'Người dùng'}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Trạng thái</span>
                                            <span className={`text-sm font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${accountStatus?.toLowerCase() === 'active' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${accountStatus?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                {accountStatus || 'Không xác định'}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {/* Contact Methods */}
                                <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                    <h3 className="text-base font-bold text-slate-900 mb-5">Thông tin liên hệ</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ Email</label>
                                            {!isEditing ? (
                                                <div className="flex items-center gap-3 text-sm font-medium text-slate-900 bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-100">
                                                    <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center">
                                                        <Mail className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <span className="truncate">{email || 'Trống'}</span>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm transition-all"
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 leading-relaxed bg-blue-50 p-3 rounded-xl border border-blue-100">
                                            <strong className="block mb-1 text-blue-900">Thông báo hệ thống</strong>
                                            Mọi cập nhật và thông báo hệ thống sẽ được gửi đến địa chỉ email này.
                                        </div>
                                    </div>
                                </section>
                                <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm md:col-span-2">
                                    <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                                        <Link2 className="w-5 h-5 text-slate-400" />
                                        Liên kết tài khoản
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-xs shrink-0">
                                                    <FaGithub className="w-5 h-5 text-slate-700" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">GitHub</p>
                                                    <p className="text-[11px] text-slate-500">Liên kết tài khoản GitHub để truy cập kho lưu trữ mã nguồn</p>
                                                </div>
                                            </div>
                                            {github?.githubId != null ? (
                                                <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shrink-0">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Đã liên kết</span>
                                                        <span className="text-sm font-bold text-slate-800">{github.githubUsername}</span>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={handleLinkGithub}
                                                    className="group relative px-5 py-2.5 bg-[#24292e] hover:bg-[#1b1f23] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer overflow-hidden flex items-center gap-2"
                                                >
                                                    <span className="relative z-10">Liên kết</span>
                                                    <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                        {isEditing && (
                            <div className="xl:col-span-1">
                                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-1">
                                            <ShieldCheck className="w-5 h-5 text-[#F26F21]" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">Bảo mật</h3>
                                        <p className="text-xs text-slate-500">Đảm bảo tài khoản của bạn đang sử dụng mật khẩu mạnh và an toàn.</p>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
                                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                                                <KeyRound className="w-4 h-4 text-slate-500" /> Cập nhật mật khẩu
                                            </h4>
                                            <p className="text-xs text-slate-500">Bỏ trống nếu bạn không muốn thay đổi mật khẩu.</p>
                                        </div>

                                        <div>
                                            <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Mật khẩu hiện tại
                                            </label>
                                            <input
                                                id="currentPassword"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Nhập mật khẩu hiện tại"
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Mật khẩu mới
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPass ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Tối thiểu 8 ký tự"
                                                    className="w-full rounded-xl border border-slate-200 pl-4 pr-11 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPass(!showPass)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md hover:bg-slate-100 transition-colors"
                                                >
                                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Xác nhận mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Xác nhận mật khẩu mới"
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
                {/* Avatar Changer Modal */}
                <AnimatePresence>
                    {showPhotoModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                                onClick={() => setShowPhotoModal(false)}
                            />
                            {/* Modal Box */}
                            <motion.div
                                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                                transition={{ type: "spring", duration: 0.2 }}
                                className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-100 relative z-10"
                            >
                                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h4 className="font-bold text-slate-800 text-[13px]">Chọn ảnh đại diện</h4>
                                    <button
                                        onClick={() => setShowPhotoModal(false)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-1.5 transition-colors cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <p className="text-[10px] text-slate-500">Chọn một ảnh đại diện đề xuất hoặc nhập đường dẫn URL ảnh của bạn ở dưới:</p>

                                    {/* Presets Grid */}
                                    <div className="grid grid-cols-5 gap-3 pt-1">
                                        {avatarPresets.map((preset, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setAvatarUrl(preset);
                                                    setShowPhotoModal(false);
                                                    showToast("Đã chọn ảnh đại diện mẫu! Nhấn Lưu thay đổi để hoàn tất.", "info");
                                                }}
                                                className={`w-14 h-14 rounded-full overflow-hidden border-2 relative transition-all active:scale-95 cursor-pointer hover:opacity-90 ${avatarUrl === preset ? 'border-blue-600 scale-105 shadow-md' : 'border-slate-100 hover:border-slate-300'
                                                    }`}
                                            >
                                                <img referrerPolicy="no-referrer" src={preset} alt="preset preview" className="w-full h-full object-cover" />
                                                {avatarUrl === preset && (
                                                    <div className="absolute inset-0 bg-[#F26F21]/10 flex items-center justify-center">
                                                        <span className="w-5 h-5 bg-[#F26F21] rounded-full flex items-center justify-center text-white text-[10px] shadow-sm">✓</span>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="border-t border-slate-100 pt-4">
                                        <label className="block mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                                            Đường dẫn ảnh (URL)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                placeholder="https://images.unsplash.com/photo-..."
                                                value={avatarUrl}
                                                onChange={(e) => setAvatarUrl(e.target.value)}
                                                className="flex-1 rounded-lg border border-slate-200 text-[10px] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPhotoModal(false);
                                                    showToast("Đã tải ảnh từ URL! Nhấn Lưu thay đổi để hoàn tất.", "info");
                                                }}
                                                className="px-3 py-1.5 bg-[#F26F21] text-white font-semibold text-[10px] rounded-lg hover:brightness-110 transition"
                                            >
                                                Áp dụng
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* History Sidebar Drawer */}
                <AnimatePresence>
                    {isHistoryOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-60"
                                onClick={() => setIsHistoryOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                                className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-50 shadow-2xl z-70 flex flex-col border-l border-slate-200"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-white shadow-xs z-10">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <History className="w-5 h-5 text-blue-600" />
                                        Lịch sử tham gia
                                    </h2>
                                    <button
                                        onClick={() => setIsHistoryOpen(false)}
                                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {history ? (
                                        history.list && history.list.length > 0 ? (
                                            history.list.map((item, index) => (
                                                <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all hover:border-blue-200">
                                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-blue-500 to-orange-500" />
                                                    <h3 className="font-bold text-slate-900 text-base mb-3 leading-tight pr-4">
                                                        {item.eventName}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                                            {item.teamName}
                                                        </span>
                                                        {item.leader && (
                                                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                                                                <Star className="w-3 h-3" />Leader
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-500 font-medium text-xs">Trạng thái</span>
                                                            <span className="font-bold text-slate-700">{item.status || 'Đang tham gia'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-500 font-medium text-xs">Ngày đăng ký</span>
                                                            <span className="font-bold text-slate-700">
                                                                {item.registrationDate ? new Date(item.registrationDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                            </span>
                                                        </div>
                                                        {item.ranking > 0 && (
                                                            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                                                                <span className="text-slate-500 font-medium text-xs">Thứ hạng</span>
                                                                <span className="font-bold text-emerald-600 flex items-center gap-1">
                                                                    <Trophy className="w-3.5 h-3.5" /> Top {item.ranking}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {item.reward && (
                                                            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                                                                <span className="text-slate-500 font-medium text-xs">Giải thưởng</span>
                                                                <span className="font-bold text-amber-600">
                                                                    {item.reward}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {item.listRounds && item.listRounds.length > 0 && (
                                                            <div className="flex flex-col justify-between items-center text-sm pt-2 border-t border-slate-200 gap-3">
                                                                <div className="flex  w-full">
                                                                    <span className="text-slate-500 font-medium text-xs">Hạng mục tham gia</span>
                                                                </div>
                                                                <div className="flex border-b border-gray-400 w-full">
                                                                    {item.listRounds.map((round, index) => (
                                                                        <div key={index} className="flex justify-center w-full">
                                                                            <span className="text-slate-500 font-medium text-xs"> {index + 1}.{round.categoryName}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex justify-between w-full">
                                                                    <span className="text-slate-500 font-medium text-xs">Vòng</span>
                                                                    <span className="font-bold text-amber-600">
                                                                        {item.listRounds.map((round, index) => (
                                                                            <div key={index} className="flex gap-5 justify-between">
                                                                                <span> {round.roundName}</span>
                                                                                <span>{round.status}</span>
                                                                            </div>
                                                                        ))}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <History className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium">Chưa có lịch sử tham gia nào.</p>
                                                <p className="text-slate-400 text-xs mt-1">Hãy tham gia các sự kiện để xem lịch sử tại đây.</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                            <p className="text-sm text-slate-500 animate-pulse">Đang tải lịch sử...</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
}
