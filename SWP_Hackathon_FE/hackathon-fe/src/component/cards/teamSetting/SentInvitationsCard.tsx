import { AnimatePresence, motion } from 'motion/react';
import { Send, Mail } from 'lucide-react';
import type { TeamDetail } from '../../../types/team/TeamDetail';

interface SentInvitationsCardProps {
  invitations: TeamDetail['invitations'];
}

export default function SentInvitationsCard({
  invitations = [],
}: SentInvitationsCardProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md uppercase tracking-wider">Đang chờ</span>;
      case 'ACCEPTED':
        return <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md uppercase tracking-wider">Chấp nhận</span>;
      case 'REJECTED':
        return <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md uppercase tracking-wider">Từ chối</span>;
      case 'EXPIRED':
        return <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md uppercase tracking-wider">Quá hạn</span>;
      default:
        return <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-outline-variant/60 p-6 md:p-8 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-brand-on-surface flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-500" />
          Lời mời đã gửi
        </h2>
        <div className="flex items-center gap-3 z-10">
          <span className="bg-brand-surface-high text-brand-on-surface-variant font-medium text-xs px-2.5 py-1 rounded-md whitespace-nowrap">
            Đã gửi: {invitations?.length || 0}
          </span>
        </div>
      </div>

      <div className="relative min-h-30">
        <AnimatePresence mode="wait">
          {!invitations || invitations.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-brand-on-surface-variant/60 border border-dashed border-brand-outline-variant/40 rounded-2xl flex flex-col items-center justify-center gap-2 relative z-10 bg-white"
            >
              <Mail className="w-8 h-8 text-brand-outline-variant/50" />
              <p className="text-sm">Chưa gửi lời mời nào.</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 relative z-10 max-h-[350px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              <AnimatePresence initial={false}>
                {invitations.map((inv, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 border border-brand-outline-variant/40 rounded-2xl bg-brand-surface hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border border-dashed border-brand-outline-variant/70 flex items-center justify-center text-brand-on-surface-variant/70 bg-white shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="truncate pr-2">
                          <p className="text-sm font-medium text-brand-on-surface truncate">
                            {inv.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {getStatusBadge(inv.status)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
