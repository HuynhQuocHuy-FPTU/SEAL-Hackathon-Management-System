import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotification } from '../../hook/useNotification';
import { CheckCircle, XCircle } from 'lucide-react';
import { acceptInvitation, rejectInvitation } from '../../services/team/teamsService';

export default function RespondInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const notifyId = searchParams.get("id") || searchParams.get("notificationId");
  const type = searchParams.get("type") || 'invite';

  let title = '';
  let description = '';

  switch (type) {
    case 'transfer_leader':
      title = 'Chuyển quyền Trưởng nhóm';
      description = 'Bạn đã nhận được yêu cầu tiếp nhận quyền trưởng nhóm. Bạn có đồng ý trở thành trưởng nhóm mới không?';
      break;
    case 'invite':
    default:
      title = 'Lời mời tham gia nhóm';
      description = 'Bạn đã nhận được một lời mời tham gia nhóm. Bạn có muốn chấp nhận lời mời này không?';
      break;
  }

  const handleRespond = async (accept: boolean) => {
    setIsLoading(true);
    try {
      if (accept) {
        const res = await acceptInvitation(Number(notifyId));
        addNotification('Success', res?.message || 'Thao tác thành công!');
        navigate('/team', { replace: true });
      } else {
        const res = await rejectInvitation(Number(notifyId));
        addNotification('Info', res?.message || 'Bạn đã từ chối yêu cầu.');
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      addNotification('Info', error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !notifyId || isNaN(Number(notifyId))) {
    return (
      <div className="w-full max-w-md relative z-10 px-4 md:px-0 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)] p-8 md:p-10"
        >
          <div className="flex justify-center mb-6 text-red-500">
            <XCircle size={64} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Đường dẫn không hợp lệ
          </h2>
          <p className="text-slate-500 mb-8">
            Lời mời này không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại đường dẫn của bạn.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-[#F26F21] text-white py-3 px-4 rounded-xl font-semibold hover:brightness-110 transition-colors"
          >
            Về trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md relative z-10 px-4 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)] p-8 md:p-10 text-center"
      >
        <div className="flex justify-center mb-6 text-[#F26F21]">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <CheckCircle size={40} />
          </div>
        </div>

        <h2 className="text-2xl font-bold font-sans text-slate-900 mb-2 tracking-tight">
          {title}
        </h2>

        <p className="text-slate-500 mb-8">
          {description}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleRespond(true)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#F26F21] text-white py-3 px-4 rounded-xl font-semibold hover:brightness-110 transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Đang xử lý...' : 'Chấp nhận'}
          </button>

          <button
            onClick={() => handleRespond(false)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:bg-slate-200 transition-colors disabled:opacity-70"
          >
            Từ chối
          </button>
        </div>
      </motion.div>
    </div>
  );
}
