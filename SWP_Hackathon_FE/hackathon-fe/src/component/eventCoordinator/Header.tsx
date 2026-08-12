import { useState } from 'react';
import { Search, Bell, Rocket } from 'lucide-react';
import { useEventCoordinator } from '../../context/EventCoordinatorContext';
import AvatarButton from '../button/AvatarButton';
import UserProfileMenu from '../ui/UserProfileMenu';
import { useAuthContext } from '../../hook/useAuthContext';
import { useTopNavbar } from '../../hook/useTopNavbar';

const TAB_LABELS: Record<string, string> = {
  overview: 'Bảng điều khiển',
  rounds: 'Vòng thi & Hạn chót',
  teams: 'Đội thi & Đăng ký',
  'judges-mentors': 'Giám khảo & Cố vấn',
  'scoring-rules': 'Chấm điểm & Thể lệ',
  announcements: 'Phát sóng thông báo',
  settings: 'Cài đặt hệ thống',
  support: 'Tài liệu & Trợ giúp',
  'create-event': 'Tạo sự kiện mới',
};

interface HeaderProps {
  activeTab: string;
}

export default function Header({ activeTab }: HeaderProps) {
  const { user, logout } = useAuthContext();
  const { showProfileMenu, toggleProfileMenu, closeAllMenus } = useTopNavbar();
  return (
    <header className="sticky top-0 left-0 right-0 z-30 h-16 flex items-center justify-between px-6 bg-brand-background/70 backdrop-blur-lg border-b border-brand-outline-variant/30 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="shrink-0 hidden md:block">
          <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
            <Rocket className="w-5 h-5" />
          </div>
        </div>
        <span className="font-bold text-lg text-brand-on-surface leading-none mr-2">
          {TAB_LABELS[activeTab] ?? 'Bảng điều khiển'}
        </span>
      </div>
      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 border-l border-brand-outline-variant/30 pl-4 ml-1">
          <div className="relative">
            <button className="text-brand-on-surface-variant hover:text-brand-primary p-2 rounded-full hover:bg-brand-primary/10 transition-all cursor-pointer">
              <Bell size={18} />
            </button>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-error rounded-full ring-2 ring-white"></span>
          </div>
          <div className="relative">
            <AvatarButton
              avatarUrl={user.avatar}
              userName={user?.fullName || "EC"}
              onClick={toggleProfileMenu}
              isActive={showProfileMenu}
            />
            <UserProfileMenu
              isOpen={showProfileMenu}
              user={user}
              onClose={closeAllMenus}
              avt={user.avatar}
              onLogout={logout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
