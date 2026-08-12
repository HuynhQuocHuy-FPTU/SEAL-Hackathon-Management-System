import { motion } from 'motion/react';
import type { Member } from '../../../types/team/TeamDetail';
import type { TeamRequest } from '../../../types/team/TeamRequest';
interface MemberActionMenuProps {
  member: Member;
  onClose: () => void;
  onUpdateRole: (teamRequest: TeamRequest) => void;
}

export default function MemberActionMenu({
  member,
  onClose,
  onUpdateRole,
}: MemberActionMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 5 }}
        className="absolute right-0 mt-1 w-44 bg-white border border-brand-outline-variant/60 rounded-xl shadow-lg py-1 z-25 text-left"
      >
        <button
          onClick={() => {
            onUpdateRole({ studentCode: String(member.studentCode) });
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-xs text-brand-on-surface hover:bg-brand-surface-low transition-colors"
        >
          Chuyển quyền trưởng nhóm
        </button>
      </motion.div>
    </>
  );
}
