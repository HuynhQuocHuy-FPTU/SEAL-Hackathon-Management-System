import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Clock, UserPlus, Check, X } from 'lucide-react';
import type { InvitationStatus, TeamJoinResponse } from '../../../types/team/TeamActive';
import CustomSelect from '../../ui/CustomSelect';
import { getTeamRequest } from '../../../services/team/teamActiveListService';

interface PendingInvitationsCardProps {
  onAcceptRequest: (requestId: number) => void;
  onRejectRequest: (requestId: number) => void;
}

export default function PendingInvitationsCard({
  onAcceptRequest,
  onRejectRequest,
}: PendingInvitationsCardProps) {
  const [joinRequests, setJoinRequestStatus] = useState<TeamJoinResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<InvitationStatus>('PENDING');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJoinRequests = async() => {
      try {
        setIsLoading(true);
        const data = await getTeamRequest(statusFilter);
        setJoinRequestStatus(data);
      } catch (error: any) {
        
      } finally {
        setIsLoading(false);
      }
    }
    fetchJoinRequests();
  }, [statusFilter])



  const filteredRequests = joinRequests.filter(req => req.status === statusFilter);
  return (
    <div className="bg-white rounded-3xl border border-brand-outline-variant/60 p-6 md:p-8 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-brand-on-surface flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-on-surface-variant/80" />
          Đơn yêu cầu tham gia
        </h2>
        <div className="flex items-center gap-3 z-10">
          <span className="bg-brand-surface-high text-brand-on-surface-variant font-medium text-xs px-2.5 py-1 rounded-md whitespace-nowrap">
          Số đơn  {filteredRequests.length}
          </span>
          <div className="w-32">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as InvitationStatus)}
              options={[
                { value: 'PENDING', label: 'Đang chờ' },
                { value: 'ACCEPTED', label: 'Chấp nhận' },
                { value: 'REJECTED', label: 'Từ chối' },
                { value: 'EXPIRED', label: 'Quá hạn' },
                { value: 'INVALID', label: 'Không hợp lệ' }
              ]}
              variant="inline"
            />
          </div>
        </div>
      </div>

      <div className="relative min-h-30">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex justify-center items-center py-8"
            >
              <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          ) : filteredRequests.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-brand-on-surface-variant/60 border border-dashed border-brand-outline-variant/40 rounded-2xl flex flex-col items-center justify-center gap-2 relative z-10 bg-white"
            >
              <UserPlus className="w-8 h-8 text-brand-outline-variant/50" />
              <p className="text-sm">Không có đơn yêu cầu tham gia nào.</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 relative z-10"
            >
              <AnimatePresence initial={false}>
                {filteredRequests.map((req) => (
                  <motion.div
                    key={req.requestId}
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 border border-brand-outline-variant/40 rounded-2xl bg-brand-surface">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border border-dashed border-brand-outline-variant/70 flex items-center justify-center text-brand-on-surface-variant/70 bg-white">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-on-surface flex items-center gap-2">
                            {req.studentName}
                          </p>
                          <p className="text-xs text-brand-on-surface-variant/80 mt-0.5">Lý do: {req.reason}</p>
                        </div>
                      </div>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onAcceptRequest(req.requestId)}
                            className="text-emerald-600 border border-transparent hover:border-emerald-600/20 hover:bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Đồng ý
                          </button>
                          <button
                            onClick={() => onRejectRequest(req.requestId)}
                            className="text-brand-error border border-transparent hover:border-brand-error/20 hover:bg-rose-50 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <X className="w-3.5 h-3.5" />
                            Từ chối
                          </button>
                        </div>
                      )}
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
