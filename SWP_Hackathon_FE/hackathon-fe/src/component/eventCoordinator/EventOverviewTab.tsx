import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, Trophy, TrendingUp, Activity, Search, ChevronDown, Check, UserX2Icon, UserCheck2, MailQuestionMark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Hackathon } from '../../types/hackathonEvent/Hackathon';
import { getEventReliabilityMetrics, getRoundCriteriaStats, getEventCriteriaStats, countStudentFPTOrOther } from '../../services/event/statisticsDataService';
import type { MetricResultDTO, ReliabilityResultDTO, StudentCount } from '../../types/metric/MetricResult';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useNotification } from '../../hook/useNotification';
import { getAllAprrovedRegister, getAllRegistration, getRegistrationCount } from '../../services/event/registerService';
import type { RegistrationCount } from '../../types/registration/Registration';

interface eventsOverviewTabProps {
  events: Hackathon[];
  selectedEventId: number | null;
  onSelectEventId: (id: number) => void;
}

export default function eventsOverviewTab({
  events,
  selectedEventId,
  onSelectEventId
}: eventsOverviewTabProps) {
  const selectedEvent = events.find(e => e.eventId === selectedEventId);
  const { addNotification } = useNotification();
  const [reliabiltyMetric, setReliabiltyMetric] = useState<ReliabilityResultDTO>();
  const [criteriaMetric, setCriteriaMetric] = useState<MetricResultDTO[]>([]);
  const [registrationCount, setRegistrationCount] = useState<RegistrationCount>();
  const [registration, setRegistration] = useState(0);
  const [approveRegistration, setApproveRegistration] = useState(0);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [isLoadingRound, setIsLoadingRound] = useState(false);
  const [studentCount, setStudentCount] = useState<StudentCount>();
  // Event Dropdown State
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEventDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const res = await countStudentFPTOrOther();
        setStudentCount(res);
      } catch (error) {
        console.error("Lỗi lấy thông kê sinh viên:", error);
      }
    };
    fetchStudentCount();
  }, []);

  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [roundCriteriaMetric, setRoundCriteriaMetric] = useState<MetricResultDTO[]>([]);

  // Reset/set selected round when event changes
  useEffect(() => {
    if (selectedEvent?.rounds && selectedEvent.rounds.length > 0) {
      setSelectedRoundId(selectedEvent.rounds[0].roundId);
    } else {
      setSelectedRoundId(null);
      setRoundCriteriaMetric([]);
    }
  }, [selectedEventId, selectedEvent]);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!selectedEventId) return;
      setIsLoadingEvent(true);
      try {
        const [reliabilityRes, registrationCounts, eventCriteriaStats] = await Promise.all([
          getEventReliabilityMetrics(selectedEventId).catch(() => null),
          getRegistrationCount(selectedEventId).catch(() => ({})),
          getEventCriteriaStats(selectedEventId).catch(() => [])
        ]);
        setReliabiltyMetric(reliabilityRes || undefined);
        setRegistrationCount(registrationCounts.data);
        setCriteriaMetric(eventCriteriaStats || []);
      } catch (error: any) {
        addNotification("Error", error.response?.data?.message || "Lỗi tải thống kê sự kiện");
      } finally {
        setIsLoadingEvent(false);
      }
    };
    fetchEventData();
  }, [selectedEventId]);

  // Fetch Round Criteria Stats
  useEffect(() => {
    const fetchRoundData = async () => {
      if (!selectedRoundId) return;
      setIsLoadingRound(true);
      try {
        const roundStats = await getRoundCriteriaStats(selectedRoundId);
        setRoundCriteriaMetric(roundStats);
      } catch (error: any) {
        addNotification("Error", error.response?.data?.message || "Lỗi tải thống kê vòng thi");
      } finally {
        setIsLoadingRound(false);
      }
    };
    fetchRoundData();
  }, [selectedRoundId]);

  // Memoize filtered events
  const filteredEvents = useMemo(() => {
    if (!eventSearchQuery) return events;
    const lowerQuery = eventSearchQuery.toLowerCase();
    return events.filter(e => (e.eventName || e.title || '').toLowerCase().includes(lowerQuery));
  }, [events, eventSearchQuery]);

  const SkeletonCard = () => (
    <div className="bg-white/40 border border-white/60 rounded-3xl p-6 h-32 animate-pulse flex flex-col justify-center shadow-sm">
      <div className="h-3 w-1/2 bg-slate-300/50 rounded mb-4"></div>
      <div className="h-10 w-1/3 bg-slate-300/50 rounded"></div>
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="relative z-50" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
          className="flex items-center justify-between w-full md:w-100 bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all hover:bg-white/60"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-100 to-purple-100 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Evaluation Dashboard</p>
              <p className="text-base font-extrabold text-slate-800 line-clamp-1">
                {selectedEvent ? (selectedEvent.eventName || selectedEvent.title) : "Chọn sự kiện..."}
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isEventDropdownOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-400 shrink-0"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.button>
        <AnimatePresence>
          {isEventDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, filter: 'blur(10px)', y: -10 }}
              animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, height: 0, filter: 'blur(10px)', y: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
              style={{ transformOrigin: 'top center' }}
              className="absolute top-full left-0 mt-3 w-full md:w-115 bg-white/10 backdrop-blur-[28px] border border-white/20 rounded-[28px] shadow-[0_24px_64px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sự kiện..."
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="max-h-90 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => {
                    const isSelected = event.eventId === selectedEventId;
                    return (
                      <button
                        key={event.eventId}
                        onClick={() => {
                          onSelectEventId(event.eventId);
                          setIsEventDropdownOpen(false);
                          setEventSearchQuery('');
                        }}
                        className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 flex items-center justify-between group ${isSelected
                          ? 'bg-blue-500/10 border border-blue-500/20'
                          : 'hover:bg-white/20 border border-transparent'
                          }`}
                      >
                        <div>
                          <p className={`font-bold text-sm mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-700 group-hover:text-slate-900'}`}>
                            {event.eventName || event.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${event.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                              {event.status}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(event.startDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <p className="text-sm">Không tìm thấy sự kiện nào</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        {selectedEvent ? (
          <motion.div
            key={selectedEvent.eventId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-4xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.06)]"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
                  {selectedEvent.eventName || selectedEvent.title}
                </h2>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${selectedEvent.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                {selectedEvent.status}
              </span>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                Độ tin cậy của Sự kiện (Reliability Metrics)
              </h3>

              {isLoadingEvent ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : reliabiltyMetric ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* KPI 1: Tổng lượt chấm */}
                  <div className="bg-white/50 border border-white/60 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden transition-all hover:bg-white/80">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-slate-900 pointer-events-none">
                      <Activity className="w-20 h-20" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Tổng lượt đánh giá</p>
                    <p className="text-4xl font-black text-slate-800 relative z-10 tracking-tight">{reliabiltyMetric.totalEvaluations}</p>
                  </div>

                  {/* KPI 2: Cronbach's Alpha */}
                  <div className="bg-white/50 border border-white/60 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden transition-all hover:bg-white/80">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.04] text-blue-600 pointer-events-none">
                      <TrendingUp className="w-20 h-20" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Cronbach's Alpha</p>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 relative z-10">
                      <p className="text-4xl font-black text-blue-600 tracking-tight leading-none">{Number(reliabiltyMetric.cronbachAlpha?.value || 0).toFixed(3)}</p>
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg mb-0.5 w-fit">
                        {reliabiltyMetric.cronbachAlpha?.interpretation || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* KPI 3: ICC */}
                  <div className="bg-white/50 border border-white/60 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden transition-all hover:bg-white/80">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.04] text-emerald-600 pointer-events-none">
                      <Users className="w-20 h-20" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Độ đồng thuận (ICC)</p>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 relative z-10">
                      <p className="text-4xl font-black text-emerald-600 tracking-tight leading-none">{Number(reliabiltyMetric.icc?.value || 0).toFixed(3)}</p>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg mb-0.5 w-fit">
                        {reliabiltyMetric.icc?.interpretation || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 border border-white/60 rounded-3xl p-12 text-center text-slate-500">
                  <p className="font-medium">Chưa có dữ liệu thống kê độ tin cậy cho sự kiện này.</p>
                </div>
              )}
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                Số lượng đơn đăng kí tham gia
              </h3>

              {isLoadingEvent ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : registrationCount ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/*1: Tổng lượt chấm */}
                  <div className="bg-white/50 border border-white/60 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden transition-all hover:bg-white/80">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-slate-900 pointer-events-none">
                      <MailQuestionMark className="w-20 h-20" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Tổng lượt đăng kí</p>
                    <p className="text-4xl font-black text-slate-800 relative z-10 tracking-tight">{registrationCount.countApproved + registrationCount.countReject + registrationCount.countPending}</p>
                  </div>

                  {/*2: Số lượng đơn chấp nhận */}
                  <div className="bg-white/50 border border-white/60 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden transition-all hover:bg-white/80">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.04] text-emerald-600 pointer-events-none">
                      <UserCheck2 className="w-20 h-20" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Số lượng đơn chờ duyệt</p>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 relative z-10">
                      <p className="text-4xl font-black text-emerald-600 tracking-tight leading-none">{registrationCount.countPending}</p>
                    </div>
                  </div>
                  {/*2: Số lượng đơn chấp nhận */}
                  <div className="bg-white/50 border border-white/60 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden transition-all hover:bg-white/80">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.04] text-emerald-600 pointer-events-none">
                      <UserCheck2 className="w-20 h-20" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Số lượng đơn chấp nhận</p>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 relative z-10">
                      <p className="text-4xl font-black text-emerald-600 tracking-tight leading-none">{registrationCount.countApproved}</p>
                    </div>
                  </div>

                  {/*3: Cronbach's Alpha */}
                  <div className="bg-white/50 border border-white/60 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden transition-all hover:bg-white/80">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.04] text-blue-600 pointer-events-none">
                      <UserX2Icon className="w-20 h-20" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Số lượng đơn từ chối</p>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 relative z-10">
                      <p className="text-4xl font-black text-red-600 tracking-tight leading-none">{registrationCount.countReject}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 border border-white/60 rounded-3xl p-12 text-center text-slate-500">
                  <p className="font-medium">Chưa có dữ liệu về đơn đăng kí cho sự kiện này.</p>
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                Cơ cấu sinh viên tham gia (Toàn hệ thống)
              </h3>
              {studentCount ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FPT Students */}
                  <div className="bg-white/50 border border-white/60 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden transition-all hover:bg-white/80">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.04] text-orange-600 pointer-events-none">
                      <Users className="w-20 h-20" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Sinh viên FPT</p>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 relative z-10">
                      <p className="text-4xl font-black text-orange-500 tracking-tight leading-none">{studentCount.fptStudentCount}</p>
                    </div>
                  </div>

                  {/* External Students */}
                  <div className="bg-white/50 border border-white/60 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden transition-all hover:bg-white/80">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.04] text-blue-600 pointer-events-none">
                      <Users className="w-20 h-20" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Sinh viên trường khác</p>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 relative z-10">
                      <p className="text-4xl font-black text-blue-500 tracking-tight leading-none">{studentCount.externalStudentCount}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                Thống kê điểm của sự kiện
              </h3>
              {isLoadingEvent ? (
                <div className="bg-white/40 border border-white/60 rounded-3xl p-6 h-100 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-4 border-slate-300 border-t-purple-500 animate-spin"></div>
                </div>
              ) : criteriaMetric && criteriaMetric.length > 0 ? (
                <div className="bg-white/50 border border-white/60 rounded-3xl p-6 h-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={criteriaMetric} margin={{ top: 20, right: 30, left: -20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="groupByTarget"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={true}
                        axisLine={true}
                        tickMargin={12}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '16px',
                          border: '1px solid rgba(255,255,255,0.8)',
                          background: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar
                        dataKey="mean"
                        name="Điểm TB (Mean)"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey="min"
                        name="Thấp nhất (Min)"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey="max"
                        name="Cao nhất (Max)"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey="standardDeviation"
                        name="Độ lệch chuẩn (SD)"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey="countEvaluations"
                        name="Lượt chấm (Count)"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-white/50 border border-white/60 rounded-3xl p-12 text-center text-slate-500">
                  <p className="font-medium">Chưa có dữ liệu thống kê tiêu chí cho sự kiện này.</p>
                </div>
              )}
            </div>

            {/* Round Selection and Stats */}
            {selectedEvent.rounds && selectedEvent.rounds.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200/50">
                <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                  Thống kê điểm theo các vòng thi
                </h3>

                {/* Round Selector */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedEvent.rounds.map((round) => {
                    const isRoundSelected = round.roundId === selectedRoundId;
                    return (
                      <button
                        key={round.roundId}
                        onClick={() => setSelectedRoundId(round.roundId)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isRoundSelected
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white/50 text-slate-600 hover:bg-purple-50 hover:text-purple-700 border border-slate-200/60'
                          }`}
                      >
                        {round.roundName}
                      </button>
                    );
                  })}
                </div>

                {/* Round Bar Chart */}
                {isLoadingRound ? (
                  <div className="bg-white/40 border border-white/60 rounded-3xl p-6 h-100 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-300 border-t-purple-500 animate-spin"></div>
                  </div>
                ) : roundCriteriaMetric && roundCriteriaMetric.length > 0 ? (
                  <div className="bg-white/50 border border-white/60 rounded-3xl p-6 h-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roundCriteriaMetric} margin={{ top: 20, right: 30, left: -20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="groupByTarget"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={true}
                          axisLine={true}
                          tickMargin={12}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickMargin={12}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.8)',
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                          }}
                          cursor={{ fill: 'rgba(147, 51, 234, 0.05)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar
                          dataKey="mean"
                          name="Điểm TB (Mean)"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                          animationDuration={1500}
                        />
                        <Bar
                          dataKey="min"
                          name="Thấp nhất (Min)"
                          fill="#ef4444"
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                          animationDuration={1500}
                        />
                        <Bar
                          dataKey="max"
                          name="Cao nhất (Max)"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                          animationDuration={1500}
                        />
                        <Bar
                          dataKey="standardDeviation"
                          name="Độ lệch chuẩn (SD)"
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                          animationDuration={1500}
                        />
                        <Bar
                          dataKey="countEvaluations"
                          name="Lượt chấm (Count)"
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="bg-white/50 border border-white/60 rounded-3xl p-12 text-center text-slate-500">
                    <p className="font-medium">Chưa có dữ liệu thống kê tiêu chí cho vòng thi này.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-4xl p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-75">
            <Calendar className="w-12 h-12 mb-4 text-slate-300" />
            <p className="font-medium">Vui lòng chọn một sự kiện để xem chi tiết</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
