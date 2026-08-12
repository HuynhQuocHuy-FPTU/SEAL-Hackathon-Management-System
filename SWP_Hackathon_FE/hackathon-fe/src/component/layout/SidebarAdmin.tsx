import {
    Activity,
    Users,
    ClipboardList,
    Settings,
} from "lucide-react";
import SharedSidebar from "./SharedSidebar";
import type { SidebarMenuItem } from "./SharedSidebar";

const menuItems: SidebarMenuItem[] = [
    {
        name: "Tổng quan",
        path: "/admin",
        icon: Activity,
        tabValue: "overview",
    },
    {
        name: "Người dùng",
        path: "/admin/users",
        icon: Users,
        tabValue: "users",
    },
    {
        name: "Nhật ký hệ thống",
        path: "/admin/logs",
        icon: ClipboardList,
        tabValue: "logs",
    },
    {
        name: "Cấu hình hệ thống",
        path: "/admin/config",
        icon: Settings,
        tabValue: "config",
    },
];

export default function SidebarAdmin() {
    return (
        <SharedSidebar
            roleTitle="BẢNG ĐIỀU KHIỂN"
            menuItems={menuItems}
        />
    );
}