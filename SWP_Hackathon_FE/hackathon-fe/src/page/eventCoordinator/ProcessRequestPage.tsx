import { useEffect, useState } from 'react';
import { useEventCoordinator } from '../../context/EventCoordinatorContext';
import { processRequest } from '../../services/team/teamsService';
import { RequestAction } from '../../types/team/TeamRequest';
import type { ProcessRequest } from '../../types/team/TeamRequest';
import { MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { useNotification } from '../../hook/useNotification';
import { getAllRequestsForEvent } from '../../services/event/requestService';
import { getAllEvent } from '../../services/event/eventService';
import type { Hackathon } from '../../types/hackathonEvent/Hackathon';

export default function ProcessRequestPage() {
  const { event } = useEventCoordinator();
  const { addNotification } = useNotification();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<RequestAction | ''>('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<Hackathon[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');

  const fetchRequests = async (eventId?: number) => {
    const id = eventId || selectedEventId;
    if (!id) return;
    
    setIsLoading(true);
    try {
      setRequests([]);
      const res = await getAllRequestsForEvent(Number(id));
      setRequests(res.data);
    } catch (error) {
      addNotification("Info", "Không thể lấy danh sách yêu cầu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getAllEvent();
        const data = res?.data || res || [];
        setEvents(data);
        if (data.length > 0) {
          setSelectedEventId(data[0].eventId);
        }
      } catch (error: any) {
        addNotification("Info", error.response?.data?.message || "Không thể lấy dữ liệu sự kiện");
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchRequests(selectedEventId as number);
    }
  }, [selectedEventId]);

  const handleProcess = async (requestId: number) => {
    if (!actionType) {
      addNotification("Info", "Vui lòng chọn hành động xử lý.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ProcessRequest = {
        action: actionType as RequestAction,
        responseMessage: responseMessage,
        eventId: Number(selectedEventId) || event?.eventId || 0,
        drawResults: []
      };

      await processRequest(requestId, payload);
      addNotification("Success", "Xử lý yêu cầu thành công!");
      setProcessingId(null);
      setActionType('');
      setResponseMessage('');
      setRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (error: any) {
      console.error(error);
      addNotification("Info", error?.response?.data?.message || "Có lỗi xảy ra khi xử lý.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[80vh]">
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-[#F26F21]" />
            Xử lý yêu cầu từ các nhóm
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Xem và phản hồi các yêu cầu được gửi lên từ các nhóm tham gia.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm font-medium bg-white"
          >
            <option value="" disabled>-- Chọn sự kiện --</option>
            {events.map((evt) => (
              <option key={evt.eventId} value={evt.eventId}>
                {evt.eventName}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchRequests()}
            disabled={isLoading || !selectedEventId}
            className="p-2.5 bg-slate-50 text-slate-600 hover:text-[#F26F21] hover:bg-orange-50 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Chưa có yêu cầu nào</h3>
            <p className="text-sm text-slate-500">Hiện không có yêu cầu nào cần được xử lý.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.requestId} className="p-5 rounded-2xl border border-slate-100 hover:border-orange-100 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                        #{req.requestId}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26F21] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100/50">
                        {req.requestType}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
                        {req.status}
                      </span>
                    </div>
                    {req.teamName && (
                      <div className="text-sm font-semibold text-slate-700">Nhóm: {req.teamName}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(req.createDate).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">Nội dung yêu cầu:</h4>
                  <div className="text-sm text-slate-700 bg-white p-4 rounded-xl border border-slate-200 mb-4 whitespace-pre-line leading-relaxed">
                    {req.requestMessage}
                  </div>
                </div>

                {processingId === req.requestId ? (
                  <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm space-y-4 animate-fade-in mt-4">
                    <h4 className="text-sm font-bold text-orange-900 border-b border-orange-50 pb-2">Thực hiện xử lý</h4>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn hành động</label>
                      <select
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value as RequestAction)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      >
                        <option value="" disabled>-- Chọn hành động --</option>
                        <option value={RequestAction.RESOLVE}>Giải quyết (RESOLVE)</option>
                        <option value={RequestAction.REJECT}>Từ chối (REJECT)</option>
                        <option value={RequestAction.REQUEST_RE_EVALUATION}>Yêu cầu chấm lại (REQUEST_RE_EVALUATION)</option>
                        <option value={RequestAction.UPDATE_DRAW_RESULT}>Cập nhật kết quả bốc thăm (UPDATE_DRAW_RESULT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú phản hồi (Tùy chọn)</label>
                      <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Nhập thông tin phản hồi cho nhóm..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none min-h-25"
                      />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        onClick={() => {
                          setProcessingId(null);
                          setActionType('');
                          setResponseMessage('');
                        }}
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleProcess(req.requestId)}
                        disabled={isSubmitting || !actionType}
                        className="px-5 py-2 bg-[#F26F21] text-white hover:brightness-110 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Xác nhận xử lý
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end mt-4 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => {
                        setProcessingId(req.requestId);
                        setActionType('');
                        setResponseMessage('');
                      }}
                      className="px-5 py-2 bg-orange-50 text-[#F26F21] rounded-xl text-sm font-bold hover:bg-orange-100 transition-colors shadow-sm"
                    >
                      Xử lý yêu cầu
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
