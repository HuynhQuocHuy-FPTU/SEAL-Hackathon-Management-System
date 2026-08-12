import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import type { Notification } from '../types/admin/Notification';
import { useNotification } from '../hook/useNotification';


export default function NotificationToast() {
  const { notifications, dismissNotification } = useNotification();
  return (
    <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-3.5 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notif) => (
          <ToastItem key={notif.id} notification={notif} onDismiss={dismissNotification} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  notification,
  onDismiss
}: {
  key?: string;
  notification: Notification;
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

    const config = {
    Success: {
      title: 'Thành công',
      containerBg: 'bg-emerald-500/10 backdrop-blur-[50px] border border-emerald-500/20',
      iconContainer: 'bg-white/40 backdrop-blur-md shadow-sm border border-white/50 text-emerald-600',
      icon: <CheckCircle className="w-5 h-5 shrink-0 drop-shadow-sm" />,
      progressBar: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
    },
    Info: {
      title: 'Thông tin',
      containerBg: 'bg-blue-500/10 backdrop-blur-[50px] border border-blue-500/20',
      iconContainer: 'bg-white/40 backdrop-blur-md shadow-sm border border-white/50 text-blue-600',
      icon: <Info className="w-5 h-5 shrink-0 drop-shadow-sm" />,
      progressBar: 'bg-gradient-to-r from-blue-400 to-blue-600',
    },
    Warning: {
      title: 'Cảnh báo',
      containerBg: 'bg-amber-500/10 backdrop-blur-[50px] border border-amber-500/20',
      iconContainer: 'bg-white/40 backdrop-blur-md shadow-sm border border-white/50 text-amber-600',
      icon: <AlertTriangle className="w-5 h-5 shrink-0 drop-shadow-sm" />,
      progressBar: 'bg-gradient-to-r from-amber-400 to-amber-600',
    },
    Error: {
      title: 'Lỗi',
      containerBg: 'bg-rose-500/10 backdrop-blur-[50px] border border-rose-500/20',
      iconContainer: 'bg-white/40 backdrop-blur-md shadow-sm border border-white/50 text-rose-600',
      icon: <XCircle className="w-5 h-5 shrink-0 drop-shadow-sm" />,
      progressBar: 'bg-gradient-to-r from-rose-400 to-rose-600',
    }
  }[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0, scale: 0.8, filter: 'blur(10px)', originY: 1 }}
      animate={{ opacity: 1, height: "auto", scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, height: 0, scale: 0.8, filter: 'blur(10px)' }}
      transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.8 }}
      className={`relative overflow-hidden flex items-start gap-3 p-4 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.5)] ${config.containerBg}`}
    >
      <div className={`p-2.5 rounded-xl ${config.iconContainer}`}>
        {config.icon}
      </div>

      <div className="flex-1 pt-0.5 pr-2">
        <h3 className="text-sm font-extrabold text-slate-800 mb-1 tracking-tight">{config.title}</h3>
        <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
          {notification.message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(notification.id)}
        className="text-slate-400 hover:text-slate-700 hover:bg-white/40 transition-all p-1.5 rounded-xl shrink-0 mt-0.5"
      >
        <X className="w-4.5 h-4.5" />
      </button>

      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-0.75 rounded-full opacity-80 ${config.progressBar}`}
      />
    </motion.div>
  );
}
