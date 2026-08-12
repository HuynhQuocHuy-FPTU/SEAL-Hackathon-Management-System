import {
    CircleAlertIcon,
    LayoutDashboard,
    Settings,
    Trophy
} from 'lucide-react'
import SharedSidebar from '../layout/SharedSidebar'

import type { SidebarMenuItem } from '../layout/SharedSidebar'


const menuItems: SidebarMenuItem[] = [
    {
        name: "Tổng quan",
        path: "/team",
        icon: LayoutDashboard,
        tabValue: "dashboard",
    },
    {
        name: "Bảng xếp hạng",
        path: "/team/ranking",
        icon: Trophy,
        tabValue: "ranking",
    },
    {
        name: "Xem đơn",
        path: "/team/appeal",
        icon: CircleAlertIcon,
        tabValue: "appeal",
    },
    {
        name: "Thành viên",
        path: "/team/setting",
        icon: Settings,
        tabValue: "settings",
    },
];

export default function Sidebar() {
    return (
        <SharedSidebar
            roleTitle="Không gian nhóm"
            menuItems={menuItems}
        />
    );
}