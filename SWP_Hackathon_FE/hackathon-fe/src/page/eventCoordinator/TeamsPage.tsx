import { useEffect, useState } from 'react';
import TeamsTab from '../../component/eventCoordinator/TeamsTab';
import { getAllEvent } from '../../services/event/eventService';
import { getAllPendingRegistration, getAllAprrovedRegister } from '../../services/event/registerService';
import type { Hackathon } from '../../types/hackathonEvent/Hackathon';
import CustomSelect from '../../component/ui/CustomSelect';

export default function TeamsPage() {
  const [events, setEvents] = useState<Hackathon[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED'>('PENDING');
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);

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
        console.error(error.response?.data?.message || "Không thể lấy dữ liệu sự kiện");
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId === '') return;
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const data = statusFilter === 'PENDING'
          ? await getAllPendingRegistration(selectedEventId as number)
          : await getAllAprrovedRegister(selectedEventId as number);

        const mappedTeams = (data || []).map((t: any) => ({
          id: t.teamId,
          registrationId: t.registrationId,
          name: t.teamName || t.name || "Unknown Team",
          teamSize: t.teamSize || 0,
          leader: t.leader
        }));
        setTeams(mappedTeams);
      } catch (error: any) {
        console.error(error.response?.data?.message || "Không thể lấy dữ liệu đăng ký");
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [selectedEventId, statusFilter]);

  // Options for event dropdown
  const eventOptions = events.map(ev => ({
    value: ev.eventId,
    label: ev.eventName
  }));

  // Options for status dropdown
  const statusOptions = [
    { value: 'PENDING', label: 'Đang chờ' },
    { value: 'APPROVED', label: 'Đã duyệt' }
  ];

  return (
    <div className="flex-1 p-6 md:p-10 font-sans text-slate-800 bg-[#f8fafc] min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="relative max-w-7xl mx-auto z-10 pb-24 space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chọn sự kiện</h2>
            <p className="text-xs text-slate-500 mt-0.5">Chọn một sự kiện và trạng thái để xem các nhóm.</p>
          </div>
          {loadingEvents ? (
            <div className="animate-pulse bg-slate-100 h-10 w-64 rounded-xl"></div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <CustomSelect
                value={selectedEventId}
                onChange={(val) => setSelectedEventId(val === '' ? '' : Number(val))}
                options={eventOptions}
                placeholder="Chọn sự kiện"
                className="w-full sm:w-64"
                isSearchable={false}
              />

              <CustomSelect
                value={statusFilter}
                onChange={(val) => setStatusFilter(val as 'PENDING' | 'APPROVED')}
                options={statusOptions}
                className="w-full sm:w-40"
                isSearchable={false}
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-slate-500">Đang tải danh sách đăng ký...</p>
          </div>
        ) : selectedEventId === '' ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Vui lòng chọn một sự kiện để xem các nhóm.</p>
          </div>
        ) : (
          <TeamsTab
            teams={teams}
            setTeams={setTeams}
            statusFilter={statusFilter}
          />
        )}
      </div>
    </div>
  );
}
