import { useLocation } from 'react-router-dom';
import { Shield, Bell, CircleHelp } from 'lucide-react';
import AvatarButton from '../button/AvatarButton';
import UserProfileMenu from '../ui/UserProfileMenu';
import { useAuthContext } from '../../hook/useAuthContext';
import { useTopNavbar } from '../../hook/useTopNavbar';

const TAB_LABELS: Record<string, string> = {
  overview: 'Tổng quan hệ thống',
  users: 'Quản lý người dùng',
  logs: 'Nhật ký hệ thống',
  config: 'Cấu hình hệ thống',
};

export default function HeaderAdmin() {
  const { user, logout } = useAuthContext();
  const { showProfileMenu, toggleProfileMenu, closeAllMenus } = useTopNavbar();
  const location = useLocation();
  const avt = "https://tse3.mm.bing.net/th/id/OIP.98ZD3uF0UaIbANML4n_OewHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";

  // Derive active tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/admin') return 'overview';
    const segment = path.split('/admin/')[1];
    return segment || 'overview';
  };

  const activeTab = getActiveTab();

  return (
    <header className="sticky top-0 left-0 right-0 z-30 h-16 flex items-center justify-between px-6 bg-brand-background/70 backdrop-blur-lg border-b border-brand-outline-variant/30 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="shrink-0 hidden md:block">
          <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
            <Shield className="w-5 h-5" />
          </div>
        </div>
        <span className="font-bold text-lg text-brand-on-surface leading-none mr-2">
          {TAB_LABELS[activeTab] ?? 'Tổng quan hệ thống'}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <button className="text-brand-on-surface-variant hover:text-brand-primary p-2 rounded-full hover:bg-brand-primary/10 transition-all cursor-pointer">
          <CircleHelp size={20} />
        </button>

        <div className="flex items-center gap-2 border-l border-brand-outline-variant/30 pl-4 ml-1">
          <div className="relative">
            <button className="text-brand-on-surface-variant hover:text-brand-primary p-2 rounded-full hover:bg-brand-primary/10 transition-all cursor-pointer">
              <Bell size={18} />
            </button>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-error rounded-full ring-2 ring-white"></span>
          </div>
          <div className="relative">
            <AvatarButton
              avatarUrl={avt}
              userName={user?.fullName || "Admin User"}
              onClick={toggleProfileMenu}
              isActive={showProfileMenu}
            />
            <UserProfileMenu
              isOpen={showProfileMenu}
              user={user}
              onClose={closeAllMenus}
              avt={avt}
              onLogout={logout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}