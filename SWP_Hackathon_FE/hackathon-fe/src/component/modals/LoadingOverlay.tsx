import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader } from 'lucide-react';

interface LoadingOverlayProps {
  phase: 'idle' | 'processing' | 'completed';
  setPhase: (phase: 'idle' | 'processing' | 'completed') => void;
}

export default function LoadingOverlay({ phase, setPhase }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => phase === 'completed' && setPhase('idle')}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-brand-surface-variant rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4"
          >
            {phase === 'processing' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader className="w-12 h-12 text-brand-secondary" strokeWidth={1.5} />
                </motion.div>
                <p className="text-base font-semibold text-brand-on-surface">
                  Đang xử lý...
                </p>
                <p className="text-sm text-brand-on-surface-variant">
                  Vui lòng chờ trong giây lát
                </p>
              </>
            )}

            {phase === 'completed' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500" strokeWidth={1.5} />
                </motion.div>
                <p className="text-base font-semibold text-brand-on-surface">
                  Hoàn thành!
                </p>
                <p className="text-sm text-brand-on-surface-variant">
                  Nhấp vào bất kì chỗ nào để đóng
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
