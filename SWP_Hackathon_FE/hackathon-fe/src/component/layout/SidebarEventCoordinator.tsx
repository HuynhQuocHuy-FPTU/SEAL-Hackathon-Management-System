import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  HelpCircle,
  Plus,
  Calendar,
  Trash2,
  ClipboardList,
} from 'lucide-react';
import { motion } from 'motion/react';
import SharedSidebar from './SharedSidebar';
import type { SidebarMenuItem } from "./SharedSidebar";


const menuItems: SidebarMenuItem[] = [
  {
    name: 'Tổng quan sự kiện',
    path: '/coordinator',
    icon: LayoutDashboard,
    tabValue: 'overview',
  },
  {
    name: 'Sự kiện',
    path: '/coordinator/my-events',
    icon: Calendar,
    tabValue: 'my-events',
  },
  {
    name: 'Nhóm & Đăng ký',
    path: '/coordinator/teams',
    icon: Users,
    tabValue: 'teams',
  },
  {
    name: 'Xử lý yêu cầu',
    path: '/coordinator/process-requests',
    icon: Megaphone,
    tabValue: 'process-requests',
  },
  {
    name: 'Tiêu chí',
    path: '/coordinator/criteria',
    icon: ClipboardList,
    tabValue: 'criteria',
  },
  {
    name: 'Thùng rác',
    path: '/coordinator/trash',
    icon: Trash2,
    tabValue: 'trash',
  },
];

const bottomItems: SidebarMenuItem[] = [
  {
    name: 'Hỗ trợ & Trợ giúp',
    path: '/coordinator/support',
    icon: HelpCircle,
    tabValue: 'support',
  },
];

interface SidebarEventCoordinatorProps {
  eventName?: string;
}

export default function SidebarEventCoordinator({
  eventName = 'Event Coordinator',
}: SidebarEventCoordinatorProps) {
  const navigate = useNavigate();

  const createEventBtn = (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/coordinator/create-event')}
      className="w-full bg-[#F26F21] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-[0_4px_12px_rgba(242,111,33,0.2)] hover:shadow-[0_4px_20px_rgba(242,111,33,0.3)] transition-shadow flex items-center justify-center gap-2 cursor-pointer"
      id="btn-create-event-sidebar"
    >
      <Plus size={18} />
      Tạo sự kiện
    </motion.button>
  );

  return (
    <SharedSidebar
      roleTitle={eventName}
      menuItems={menuItems}
      bottomItems={bottomItems}
      primaryCta={createEventBtn}
    />
  );
}
