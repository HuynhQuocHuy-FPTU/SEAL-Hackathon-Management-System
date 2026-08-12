import { useEventCoordinator } from '../../context/EventCoordinatorContext';
import { RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const { event, setEvent, handleResetStorage } = useEventCoordinator();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
      <div>
        <h3 className="font-bold text-gray-950 text-base">Cấu hình hệ điều hành HackathonOS</h3>
        <p className="text-xs text-gray-500 mt-1">Quản lý các thông số cốt lõi và khôi phục bộ nhớ đệm trạng thái.</p>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Giới hạn số lượng đội tối đa (Team capacity cap)</label>
          <input
            type="number"
            value={event.totalCap}
            onChange={(e) => setEvent(prev => ({ ...prev, totalCap: Number(e.target.value) }))}
            className="bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs w-full max-w-xs focus:bg-white focus:border-blue-500 outline-none"
          />
          <span className="block text-[11px] text-gray-400 mt-1">Giới hạn hiện tại: {event.totalCap} đội.</span>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-red-700 uppercase tracking-wider mb-2">Vùng nguy hiểm (Danger Zone)</h4>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-red-800 text-xs text-left">
            <div>
              <strong className="block">Khởi động lại toàn bộ cơ sở dữ liệu</strong>
              <span className="opacity-90">Hành động này sẽ tải lại seed dữ liệu ban đầu cho các đội thi, giám khảo, cố vấn và vòng đấu.</span>
            </div>
            <button
              onClick={handleResetStorage}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl shadow shrink-0 flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Khôi phục dữ liệu gốc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
