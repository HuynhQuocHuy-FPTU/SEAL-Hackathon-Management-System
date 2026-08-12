import { motion } from 'motion/react';
import type { NavItem } from './types';
import { useTopNavbar } from '../../hook/useTopNavbar';
import UserProfileMenu from '../ui/UserProfileMenu';
import AvatarButton from '../button/AvatarButton';
import { useAuthContext } from '../../hook/useAuthContext'
import type { UserProfile } from '../../types/account/Account';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

export const MENTOR_NAV_ITEMS: NavItem[] = [
  { label: 'Leaderboard', id: 'leaderboard' },
  { label: 'Projects', id: 'projects' },
  { label: 'Schedule', id: 'schedule' },
  { label: 'Mentors', id: 'mentors' },
];

interface TopNavbarPageProps {
  userProfile?: UserProfile | null;
  onUpdateProfile?: () => void;
  onLogout?: () => void;
  onNavigation?: (tabId: string) => void;
  navItems?: NavItem[];
  actions?: React.ReactNode;
}

export default function TopNavbarPage({
  onNavigation,
  navItems,
  actions,
}: TopNavbarPageProps) {
  const { user, logout } = useAuthContext();
  const {
    showProfileMenu,
    toggleProfileMenu,
    activeTab,
    setActiveTab,
    closeAllMenus,
  } = useTopNavbar();

  const navigate = useNavigate();
  const handleNavigation = (tabId: string) => {
    setActiveTab(tabId);
    closeAllMenus();
    onNavigation?.(tabId);
  };

  return (
    <header className="sticky top-4 z-10 mx-4 md:mx-8 mb-4 transition-all duration-300">
      <div className="bg-white/15 backdrop-blur-[50px] border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-3xl px-5 py-3 flex items-center justify-between gap-4">
        <div
          className="shrink-0 flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <span className="font-extrabold text-transparent bg-clip-text bg-linear-to-br from-orange-500 to-pink-500 tracking-tight hidden lg:block text-lg">
            SEAL
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-2 text-[13px] select-none flex-1 justify-center bg-white/15 backdrop-blur-2xl p-1.5 rounded-full border border-white/20 max-w-fit mx-auto shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
          {(navItems || []).map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`relative px-5 py-2 rounded-full transition-all duration-300 ${activeTab === item.id
                ? 'text-[#3B82F6] font-bold drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-white/30 backdrop-blur-xl rounded-full shadow-[0_4px_12px_rgba(59,130,246,0.1)] border border-white/40"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 relative shrink-0">
          {actions}
          <NotificationBell />
          <div className="relative">
            <AvatarButton
              avatarUrl={user?.avatar}
              userName={user?.fullName}
              onClick={toggleProfileMenu}
              isActive={showProfileMenu}
            />
            {/* Added a subtle ring on active state to match the new UI */}
            {showProfileMenu && (
              <motion.div
                layoutId="avatarRing"
                className="absolute inset-0 rounded-full border-2 border-brand-primary pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}
          </div>
          <UserProfileMenu
            isOpen={showProfileMenu}
            user={user}
            onClose={() => {
              closeAllMenus();
            }}
            avt={user?.avatar}
            onLogout={logout}
          />
        </div>
      </div>
    </header>
  );
}
