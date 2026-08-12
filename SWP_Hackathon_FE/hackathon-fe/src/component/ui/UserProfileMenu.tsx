import { AnimatePresence, motion } from 'motion/react';
import { LogOut, Edit2, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../../types/account/Account';
import Avatar from './Avatar';
import { useTeamContext } from '../../context/TeamContext';

interface UserProfileMenuProps {
  isOpen: boolean;
  user: UserProfile | null;
  avt: string;
  onClose: () => void;
  onLogout: () => void;
}

export default function UserProfileMenu({
  isOpen,
  user,
  avt,
  onClose,
  onLogout,
}: UserProfileMenuProps) {
  const navigate = useNavigate();
  const { teamDetail } = useTeamContext();

  const handleGoToDashboard = () => {
    const role = user?.role ? user.role.toUpperCase() : '';
    if (role === 'ADMIN') navigate("/admin");
    else if (role === 'STUDENT') {
      navigate("/team");
    }
    else if (role === 'EXPERT') navigate("/mentor");
    else if (role === 'EVENTCOORDINATOR') navigate("/coordinator");
    else navigate("/");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            layout
            initial={{ opacity: 0, height: 0, filter: 'blur(10px)', y: -10 }}
            animate={{ opacity: 1, height: "auto", filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, height: 0, filter: 'blur(10px)', y: -10 }}
            transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
            style={{ transformOrigin: 'top right' }}
            className="absolute top-14 right-0 w-75  bg-gray-200  text-slate-400 shrink-0 backdrop-blur-md rounded-[28px] shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] z-50 overflow-hidden"
          >
            {/* User Profile Header */}
            <div className="relative p-5 pb-4 border-b border-white/20 bg-white/5">
              <div className="flex items-center gap-3">
                <Avatar
                  src={avt}
                  name={user?.fullName || "User"}
                  className="w-12 h-12 rounded-full object-cover shadow-[0_4px_12px_rgba(0,88,190,0.15)] ring-2 ring-white text-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-extrabold text-brand-on-surface truncate">{user?.fullName || "User"}</p>
                  <p className="text-[11px] font-medium text-brand-on-surface-variant/80 truncate">{user?.email || "user@example.com"}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-0.5">
              {/* Dashboard */}
              <motion.button
                  whileHover={{
                    scale: 1.02,
                    x: 4,
                    backgroundColor: 'rgba(0,0,0,0.07)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoToDashboard}
                  className="w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold text-orange-600 transition-colors group"
                >
                  <div className="p-1.5 rounded-xl bg-white/30 group-hover:bg-linear-to-br from-orange-500 to-pink-500 transition-colors">
                    <LayoutDashboard className="w-4 h-4 text-brand-on-surface-variant/70 group-hover:text-white transition-colors" />
                  </div>
                  <span>Dashboard</span>
                </motion.button>

              {/* Update Profile */}
              <motion.button
                whileHover={{
                  scale: 1.02,
                  x: 4,
                  backgroundColor: 'rgba(0,0,0,0.07)'
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate("/profile");
                  onClose();
                }}
                className="w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold text-orange-600 transition-colors group"
              >
                <div className="p-1.5 rounded-xl bg-white/30 group-hover:bg-linear-to-br from-orange-500 to-pink-500 transition-colors">
                  <Edit2 className="w-4 h-4 text-brand-on-surface-variant/70 group-hover:text-white transition-colors" />
                </div>
                <span>Update Profile</span>
              </motion.button>

              {/* Divider */}
              <div className="h-px bg-white/30 mx-3 my-1" />

              {/* Logout */}
              <motion.button
                whileHover={{
                  scale: 1.00,
                  x: 4,
                  backgroundColor: 'rgba(255,228,230,0.5)'
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold text-rose-500 transition-colors group"
              >
                <div className="p-1.5 rounded-xl bg-white/30 group-hover:bg-rose-100 transition-colors">
                  <LogOut className="w-4 h-4 text-brand-error/95 group-hover:text-red-900 transition-colors" />
                </div>
                <span>Log Out</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
