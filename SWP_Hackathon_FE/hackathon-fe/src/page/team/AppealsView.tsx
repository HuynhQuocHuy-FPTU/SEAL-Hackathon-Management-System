import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTeamContext } from '../../context/TeamContext';
import { getTeamAppeals, getCurrentRound, createDirectRequest, viewAppeals, trackingRegistration } from '../../services/team/teamsService';
import type { CurrentTeamStatus } from '../../types/team/TeamStatus';
import type { TeamAppeal } from '../../types/team/TeamAppeal';
import { AlertCircle, Clock, CheckCircle2, MessageSquare, XCircle, Search, RefreshCw, Plus } from 'lucide-react';
import { RequestType } from '../../types/team/TeamRequest';
import type { CreateDirectTeamRequest } from '../../types/team/TeamRequest';
import { useNotification } from '../../hook/useNotification';

export default function AppealsView() {
  const { addNotification } = useNotification();
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] = useState<CurrentTeamStatus>(null);
  const currentRound = currentEvent?.rounds[currentEvent.rounds.length - 1];
  const [appeals, setAppeals] = useState<TeamAppeal[]>([]);
  const [isLoadingAppeals, setIsLoadingAppeals] = useState(true);
  const { teamDetail, isLoading } = useTeamContext();

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequestType, setNewRequestType] = useState<RequestType | ''>('');
  const [newRequestMessage, setNewRequestMessage] = useState('');
  const [teamEvents, setTeamEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');

  useEffect(() => {
    trackingRegistration().then(res => setTeamEvents(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentEvent?.eventID) {
      setSelectedEventId(currentEvent.eventID);
    }
  }, [currentEvent]);

  const handleCreateRequest = async () => {
    if (!newRequestType || !newRequestMessage.trim() || !selectedEventId) return;

    setIsSubmitting(true);
    try {
      const payload: CreateDirectTeamRequest = {
        requestType: newRequestType as RequestType,
        requestMessage: newRequestMessage,
        roundId: currentRound?.roundId || 0,
        eventId: Number(selectedEventId)
      };
      await createDirectRequest(payload);
      setIsCreateFormOpen(false);
      setNewRequestType('');
      setNewRequestMessage('');
      fetchAppeals(currentEvent?.eventID || 0);
      addNotification("Success", "Tạo yêu cầu thành công!");
    } catch (error: any) {
      addNotification("Error", error.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAppeals = async (eventId: number) => {
    setIsLoadingAppeals(true);
    try {
      const res = await viewAppeals(eventId);
      setAppeals(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      console.log(error?.response?.data?.message);
    } finally {
      setIsLoadingAppeals(false);
    }
  };

  useEffect(() => {
    const fetchCurrentRound = async () => {
      try {
        const res = await getCurrentRound();
        if (res.data !== null && res.data.rounds?.length > 0) {
          setHasJoined(true);
          setCurrentEvent(res.data);
        } else {
          setHasJoined(false);
          setCurrentEvent(null);
          fetchAppeals(0);
        }
      } catch (error: any) {
        setHasJoined(false);
        setCurrentEvent(null);
        fetchAppeals(0);
      }
    };

    fetchCurrentRound();
  }, []);

  useEffect(() => {
    if (currentEvent?.eventID) {
      fetchAppeals(currentEvent.eventID);
    }
  }, [currentEvent]);

  if (isLoading) {
    return <div className="animate-pulse space-y-6">Đang tải trang khiếu nại...</div>;
  }

  if (!teamDetail) {
    return <div>Không có dữ liệu nhóm.</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-3.5 h-3.5" /> Chờ xử lý
          </span>
        );
      case 'APPROVED':
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã giải quyết
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">
            <XCircle className="w-3.5 h-3.5" /> Bị từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
            {status || 'UNKNOWN'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[80vh]">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-[#F26F21]" />
            Lịch sử đơn đã gửi
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Theo dõi và quản lý các yêu cầu khiếu nại của nhóm
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateFormOpen(!isCreateFormOpen)}
            className="px-4 py-2.5 bg-[#F26F21] text-white hover:brightness-110 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm shadow-orange-200"
          >
            <Plus className="w-4 h-4" />
            Tạo yêu cầu
          </button>
          <button
            onClick={() => fetchAppeals(currentEvent?.eventID || 0)}
            disabled={isLoadingAppeals}
            className="p-2.5 bg-slate-50 text-slate-600 hover:text-[#F26F21] hover:bg-orange-50 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw className={`w-5 h-5 ${isLoadingAppeals ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isCreateFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#F26F21]" />
                  Tạo đơn mới
                </h3>
                <button
                  onClick={() => setIsCreateFormOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sự kiện</label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    >
                      <option value="" disabled>-- Chọn sự kiện --</option>
                      {teamEvents.map((evt: any) => (
                        <option key={evt.eventId} value={evt.eventId}>{evt.eventName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Loại đơn</label>
                    <select
                      value={newRequestType}
                      onChange={(e) => setNewRequestType(e.target.value as RequestType)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    >
                      <option value="" disabled>-- Chọn loại đơn --</option>
                      <option value={RequestType.APPEAL}>Khiếu nại kết quả</option>
                      <option value={RequestType.DRAW_RESULT_VERIFICATION}>Xác minh kết quả bốc thăm</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nội dung chi tiết</label>
                  <textarea
                    value={newRequestMessage}
                    onChange={(e) => setNewRequestMessage(e.target.value)}
                    placeholder="Nhập nội dung đơn của bạn..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none min-h-30"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  onClick={() => setIsCreateFormOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateRequest}
                  disabled={isSubmitting || !newRequestType || !newRequestMessage.trim() || !selectedEventId}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#F26F21] hover:brightness-110 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm overflow-hidden">
        {isLoadingAppeals ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full" />
          </div>
        ) : appeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Chưa có khiếu nại nào</h3>
            <p className="text-sm text-slate-500">
              Nhóm của bạn chưa tạo đơn khiếu nại nào cho vòng thi này.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {appeals.map((appeal, index) => (
                <motion.div
                  key={appeal.requestId || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 rounded-2xl border border-slate-100 hover:border-orange-100 bg-slate-50/50 hover:bg-white transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          #{appeal.requestId}
                        </span>
                        {appeal.requestType && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26F21] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100/50">
                            {appeal.requestType === 'APPEAL' ? 'Khiếu nại kết quả' : appeal.requestType === 'MENTOR_SUPPORT' ? 'Hỗ trợ Mentor' : appeal.requestType}
                          </span>
                        )}
                        {getStatusBadge(appeal.status)}
                        {appeal.responseStatus && (
                          <span className="text-[10px] font-semibold text-slate-500 italic">
                            Trạng thái phản hồi: {appeal.responseStatus}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 mb-1">Nội dung yêu cầu:</h4>
                        <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                          {appeal.requestMessage}
                        </p>
                      </div>

                      {appeal.responseMessage && (
                        <div>
                          <h4 className="text-sm font-semibold text-emerald-700 mb-1 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            Phản hồi từ Ban Tổ Chức:
                          </h4>
                          <p className="text-sm text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 leading-relaxed whitespace-pre-line">
                            {appeal.responseMessage}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {appeal.createDate ? new Date(appeal.createDate).toLocaleString() : 'N/A'}
                        </span>
                        {(appeal.round || appeal.categoryName) && (
                          <span>
                            &bull; {appeal.categoryName} - {appeal.round}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
