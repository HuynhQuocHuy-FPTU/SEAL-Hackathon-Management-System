/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { getAdminOverview } from "../../services/auth/userService";
import type { OverviewResponse } from "../../types/admin/User";
import {
    TrendingUp,
    FileText,
    BadgeAlert,
    Sliders,
    Layers,
    UserX,
    Lock,
    ShieldAlert,
    Download,
    UserPlus,
    Activity,
    Shield,
    Users,
    GraduationCap,
    Briefcase
} from "lucide-react";



export default function OverviewView() {
    const {
        showToast
    } = useApp();
    const navigate = useNavigate();

    const [overviewData, setOverviewData] = useState<OverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getAdminOverview();
                if (isMounted) {
                    setOverviewData(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError("Failed to load overview data");
                    console.error("Overview API error:", err);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);


    const getPercent = (count: number) => {
        const totalUsers = overviewData?.roleDistributionResponse?.totalUsers || 1;
        return Math.round((count / totalUsers) * 100);
    };


    return (
        <div className="space-y-6 font-sans">
            {/* Phần Tiêu đề (Header) */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-2">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Tổng quan hệ thống</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Thống kê người dùng và nhật ký hệ thống theo thời gian thực.
                    </p>
                </div>

            </div>

            {/* Lưới 4 Thẻ Thống kê (KPI Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Thẻ 1: Tổng người dùng */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                        <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#F26F21] flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-[#F26F21] bg-orange-50 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 border border-orange-100">
                            TỔNG
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng số người dùng</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? "..." : overviewData?.roleDistributionResponse?.totalUsers || 0}</h3>
                </div>

                {/* Thẻ 2: Sinh viên */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest border border-blue-100 flex items-center gap-1">
                            {overviewData && overviewData.roleDistributionResponse.totalUsers > 0
                                ? Math.round((overviewData.roleDistributionResponse.studentCount / overviewData.roleDistributionResponse.totalUsers) * 100) + '%'
                                : '0%'}
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sinh viên</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? "..." : overviewData?.roleDistributionResponse?.studentCount || 0}</h3>
                </div>

                {/* Thẻ 3: Chuyên gia/Cố vấn */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                        <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <span className="text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest border border-orange-100 flex items-center gap-1">
                            {overviewData && overviewData.roleDistributionResponse.totalUsers > 0
                                ? Math.round((overviewData.roleDistributionResponse.expertCount / overviewData.roleDistributionResponse.totalUsers) * 100) + '%'
                                : '0%'}
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Giám khảo / Cố vấn</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? "..." : overviewData?.roleDistributionResponse?.expertCount || 0}</h3>
                </div>

                {/* Thẻ 4: Quản trị viên/BTC */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Shield className="w-5 h-5" />
                        </div>
                        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest border border-emerald-100 flex items-center gap-1">
                            {overviewData && overviewData.roleDistributionResponse.totalUsers > 0
                                ? Math.round(((overviewData.roleDistributionResponse.adminCount + overviewData.roleDistributionResponse.coordinatorCount) / overviewData.roleDistributionResponse.totalUsers) * 100) + '%'
                                : '0%'}
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quản trị & BTC</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? "..." : (overviewData?.roleDistributionResponse?.adminCount || 0) + (overviewData?.roleDistributionResponse?.coordinatorCount || 0)}</h3>
                </div>
            </div>

            {/* Lưới chứa các Widget chính (Nhật ký & Vai trò) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Nhật ký hoạt động hệ thống - Replaces User Growth Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col h-[400px] overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h4 className="text-base font-bold text-slate-800">Nhật ký hoạt động hệ thống</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Nhật ký thời gian thực về hoạt động trong hệ thống.</p>
                        </div>
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                            {loading && <p className="text-xs text-slate-400 pl-4">Đang tải nhật ký...</p>}
                            {error && <p className="text-xs text-red-500 pl-4">{error}</p>}
                            {!loading && overviewData?.recentAuditLogs.map((log) => {
                                const isAlert = (log.action || '').toLowerCase().includes('fail') || (log.action || '').toLowerCase().includes('error');
                                return (
                                    <div key={log.id} className="relative pl-6 group">
                                        <span className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${isAlert ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                                            {isAlert ? <ShieldAlert className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                                        </span>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 p-3 -mt-2 rounded-lg hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{log.message || log.action}</p>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                    <span className="font-bold text-slate-700">{log.actorName}</span> ({log.role || 'Hệ thống'})
                                                </p>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-md shrink-0">
                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                        <button onClick={() => navigate('/admin/logs')} className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                            Xem toàn bộ nhật ký →
                        </button>
                    </div>
                </div>

                {/* Cột hiển thị Phân bổ vai trò & Thao tác */}
                <div className="space-y-6">
                    {/* Biểu đồ Doughnut SVG Phân bổ vai trò */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                        <h4 className="text-sm font-bold text-slate-800 mb-2">Phân bổ vai trò</h4>
                        <p className="text-[10px] text-slate-400 font-medium mb-3">Thống kê tỷ lệ các vai trò trong hệ thống</p>

                        <div className="flex items-center justify-center py-2">
                            <div className="relative w-28 h-28 flex items-center justify-center">
                                {/* Vòng tròn Doughnut (Biểu đồ tròn) */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    {/* Vòng nền (Màu xám nhạt) */}
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.2" />
                                    {/* Phần Sinh viên */}
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0058be" strokeWidth="3.2" strokeDasharray={`${getPercent(overviewData?.roleDistributionResponse?.studentCount || 0)} ${100 - getPercent(overviewData?.roleDistributionResponse?.studentCount || 0)}`} strokeDashoffset="0" />
                                    {/* Phần Chuyên gia */}
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#6b38d4" strokeWidth="3.2" strokeDasharray={`${getPercent(overviewData?.roleDistributionResponse?.expertCount || 0)} ${100 - getPercent(overviewData?.roleDistributionResponse?.expertCount || 0)}`} strokeDashoffset={`-${getPercent(overviewData?.roleDistributionResponse?.studentCount || 0)}`} />
                                    {/* Phần Ban Tổ Chức */}
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#006577" strokeWidth="3.2" strokeDasharray={`${getPercent(overviewData?.roleDistributionResponse?.coordinatorCount || 0)} ${100 - getPercent(overviewData?.roleDistributionResponse?.coordinatorCount || 0)}`} strokeDashoffset={`-${getPercent(overviewData?.roleDistributionResponse?.studentCount || 0) + getPercent(overviewData?.roleDistributionResponse?.expertCount || 0)}`} />
                                    {/* Phần Quản trị viên */}
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3.2" strokeDasharray={`${getPercent(overviewData?.roleDistributionResponse?.adminCount || 0)} ${100 - getPercent(overviewData?.roleDistributionResponse?.adminCount || 0)}`} strokeDashoffset={`-${getPercent(overviewData?.roleDistributionResponse?.studentCount || 0) + getPercent(overviewData?.roleDistributionResponse?.expertCount || 0) + getPercent(overviewData?.roleDistributionResponse?.coordinatorCount || 0)}`} />
                                </svg>
                                <div className="absolute text-center">
                                    <p className="text-lg font-black text-slate-800 leading-none">{overviewData?.roleDistributionResponse?.totalUsers || 0}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">TỔNG</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2 text-[10px] font-semibold text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#F26F21] shrink-0"></span>
                                <span>Sinh viên ({getPercent(overviewData?.roleDistributionResponse?.studentCount || 0)}%)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#6b38d4] shrink-0"></span>
                                <span className="text-slate-800">Giám khảo / Cố vấn ({getPercent(overviewData?.roleDistributionResponse?.expertCount || 0)}%)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#006577] shrink-0"></span>
                                <span>BTC ({getPercent(overviewData?.roleDistributionResponse?.coordinatorCount || 0)}%)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0"></span>
                                <span>Quản trị viên ({getPercent(overviewData?.roleDistributionResponse?.adminCount || 0)}%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Thao tác nhanh */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                        <h4 className="text-sm font-bold text-slate-800 mb-4">Thao tác nhanh</h4>
                        <div className="space-y-3">
                            <button onClick={() => navigate('/admin/users')} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <UserPlus className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Mời người dùng hệ thống</p>
                                        <p className="text-[10px] text-slate-400">Ban tổ chức, Giám khảo, Mentor</p>
                                    </div>
                                </div>
                            </button>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
