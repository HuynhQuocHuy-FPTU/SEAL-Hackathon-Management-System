import { motion } from 'motion/react';
import Avatar from '../ui/Avatar';

interface AvatarButtonProps {
  avatarUrl: string | undefined;
  userName: string | undefined;
  onClick: () => void;
  isActive: boolean;
}

export default function AvatarButton({
  avatarUrl,
  userName,
  onClick,
  isActive,
}: AvatarButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`rounded-full overflow-hidden transition-all duration-200 flex items-center justify-center ${
        isActive
          ? 'ring-2 ring-brand-primary ring-offset-2'
          : 'hover:ring-2 hover:ring-brand-primary/40 hover:ring-offset-2'
      }`}
    >
      <Avatar
        src={avatarUrl}
        name={userName || "User"}
        className="w-9 h-9 rounded-full object-cover border border-brand-outline-variant/60 text-sm"
      />
    </motion.button>
  );
}
