import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Loader2 } from 'lucide-react';

interface LeaveTeamCardProps {
  isLeaving?: boolean;
  onLeaveTeam: () => Promise<void>;
}

export default function LeaveTeamCard({
  isLeaving = false,
  onLeaveTeam,
}: LeaveTeamCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAction = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    await onLeaveTeam();
    setShowConfirm(false); // Reset if it fails and stays on page
  };

  return (
    <div className="bg-white rounded-3xl border border-red-200/60 p-6 md:p-8 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
      <div className="pt-2 border-t border-red-50">
        <AnimatePresence mode="wait">
          {!showConfirm ? (
            <motion.button
              key="btn-leave"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAction}
              className="mt-2 w-full bg-red-50 text-red-600 border border-red-200 font-semibold py-3 px-5 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              Rời khỏi nhóm
              <LogOut className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.div
              key="btn-confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-3"
            >
              <p className="text-sm text-red-600 font-medium text-center">
                Bạn có chắc chắn muốn rời nhóm không?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isLeaving}
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-white border border-slate-200 text-slate-600 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isLeaving}
                  onClick={handleAction}
                  className="flex-1 bg-red-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLeaving ? (
                    <>
                      Đang rời nhóm...
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Xác nhận
                      <LogOut className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
