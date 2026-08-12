import { useState, useEffect } from 'react';
import {
  FileSpreadsheet, Trophy, Scale, ArrowRight, Sparkles, Clock,
  Quote, Zap, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hook/useAuthContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';
import { getAssignedEvents, getExpertOverview } from '../../services/judge/judgeService';
import { getAllPublicEvents } from '../../services/event/eventService';

interface DashboardViewProps {
  onViewChange?: (view: string) => void;
}

const TIPS = [
  "Hãy để lại nhận xét mang tính xây dựng: các đội rất coi trọng góp ý từ bạn, không kém gì điểm số.",
  "Tìm kiếm yếu tố 'Wow': đôi khi dự án hay nhất lại là dự án bất ngờ nhất.",
  "Kiểm tra các tiêu chí chấm điểm trước khi cho điểm để đảm bảo phù hợp với mục tiêu sự kiện.",
  "Khuyến khích sự đổi mới: những ý tưởng táo bạo thường mở đường cho tương lai.",
];

const scoreDistributionData = [
  { range: '0-20', count: 1 },
  { range: '21-40', count: 3 },
  { range: '41-60', count: 5 },
  { range: '61-80', count: 10 },
  { range: '81-100', count: 5 },
];

export default function DashboardView({ onViewChange }: DashboardViewProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [randomTip, setRandomTip] = useState(TIPS[0]);
  const [currentEventName, setCurrentEventName] = useState<string>('');

  const userName = user?.fullName ? user.fullName.split(' ').pop() : '';
  const [overviewStats, setOverviewStats] = useState({
    totalAssigned: 0,
    completedReviews: 0,
    pendingReviews: 0,
    reEvaluationReviews: 0
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
    setRandomTip(TIPS[Math.floor(Math.random() * TIPS.length)]);

    const fetchOverview = async () => {
      try {
        const eventsRes = await getAssignedEvents();
        let activeEventId: number | null = null;
        if ((eventsRes.status || eventsRes.success) && eventsRes.data && eventsRes.data.length > 0) {
          activeEventId = eventsRes.data[0].id ?? eventsRes.data[0].eventId ?? eventsRes.data[0].eventID;
          if (activeEventId) {
            const statsRes = await getExpertOverview(activeEventId);
            if (statsRes) {
              if (statsRes.status || statsRes.success) {
                setOverviewStats(statsRes.data);
              } else if (statsRes.totalAssigned !== undefined) {
                setOverviewStats(statsRes);
              } else if (statsRes.data) {
                setOverviewStats(statsRes.data);
              }
            }
          }
        }
        
        // Lấy tên của sự kiện để hiển thị
        const publicEvents = await getAllPublicEvents();
        if (publicEvents && publicEvents.length > 0) {
          const matchedEvent = activeEventId 
            ? publicEvents.find((e: any) => e.eventId === activeEventId)
            : publicEvents[0];
          
          if (matchedEvent && matchedEvent.eventName) {
            setCurrentEventName(matchedEvent.eventName);
          } else if (publicEvents[0].eventName) {
            setCurrentEventName(publicEvents[0].eventName);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch expert overview', err);
      }
    };
    fetchOverview();
  }, []);

  const gradingProgressData = [
    { name: 'Đã chấm xong', value: overviewStats.completedReviews || 0, color: '#10B981' },
    { name: 'Chờ chấm điểm', value: overviewStats.pendingReviews || 0, color: '#F59E0B' },
    { name: 'Cần chấm lại', value: overviewStats.reEvaluationReviews || 0, color: '#F43F5E' }
  ];

  const totalGrading = overviewStats.completedReviews + overviewStats.pendingReviews;
  const percentComplete = totalGrading > 0 ? Math.round((overviewStats.completedReviews / totalGrading) * 100) : 0;

  const handleViewChange = (view: string) => {
    if (onViewChange) {
      onViewChange(view);
    } else {
      navigate(`/judge/${view}`);
    }
  };


  return (
    <div className="space-y-10 animate-fade-in max-w-[1200px] mx-auto py-8">

      {/* 🌟 KHU VỰC HERO (Tiêu đề nổi bật) 🌟 */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-2xl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#F26F21]/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[0%] -right-[10%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
        </div>

        <div className="relative z-10 px-8 py-10 sm:px-12 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            {currentEventName && (
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-wide uppercase text-slate-200">
                  Sự kiện: {currentEventName}
                </span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.2] mb-3">
              {greeting} {userName ? `${userName}` : ''}, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 animate-gradient-x">
                Sẵn sàng đánh giá?
              </span>
            </h1>

            <button
              onClick={() => handleViewChange('submissions')}
              className="group relative inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-black text-sm overflow-hidden transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">Bắt đầu chấm điểm</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="hidden md:block relative w-[200px] h-[200px] perspective-1000">
            <div className="absolute inset-0 flex items-center justify-center animate-bounce-slow" style={{ animationDuration: '6s' }}>
              <div className="w-32 h-44 bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-3xl transform rotate-12 flex flex-col items-center justify-center shadow-2xl">
                <FileSpreadsheet className="w-10 h-10 text-white/80 mb-3" />
                <div className="w-16 h-1.5 bg-white/20 rounded-full mb-2" />
                <div className="w-10 h-1.5 bg-white/20 rounded-full" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center animate-bounce-slow" style={{ animationDuration: '5s', animationDelay: '1s' }}>
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-xl border border-white/20 rounded-2xl transform -rotate-12 -translate-x-10 translate-y-10 flex items-center justify-center shadow-2xl">
                <Trophy className="w-10 h-10 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧩 NỘI DUNG CHÍNH CỦA DASHBOARD 🧩 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">

        {/* 📊 CỘT TRÁI: THỐNG KÊ & BIỂU ĐỒ 📊 */}
        <div className="lg:col-span-2 space-y-6">

          {/* 📈 TỔNG QUAN TIẾN ĐỘ 📈 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-8">

            {/* Biểu đồ Pie Chart nằm bên trái */}
            <div className="w-full lg:w-[45%] flex flex-col h-[320px]">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                Tiến độ chấm thi
              </h3>
              <div className="flex-1 relative w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradingProgressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {gradingProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} đội`, 'Số lượng']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
                {/* Chữ hiển thị ở giữa Biểu đồ tròn */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                  <span className="text-4xl font-black text-slate-800">
                    {overviewStats.totalAssigned}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng bài giao</span>
                </div>
              </div>
            </div>

            {/* 4 Thẻ Thống kê nằm bên phải */}
            <div className="w-full lg:w-[55%] grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-center relative overflow-hidden transition-all hover:bg-slate-50">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-slate-200/50 rounded-full opacity-50" />
                <div className="text-slate-500 text-xs font-bold mb-1 relative z-10 uppercase tracking-wider">TỔNG BÀI ĐƯỢC GIAO</div>
                <div className="text-4xl font-black text-slate-800 relative z-10">{overviewStats.totalAssigned}</div>
              </div>
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 flex flex-col justify-center relative overflow-hidden transition-all hover:bg-emerald-50">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-200/50 rounded-full opacity-50" />
                <div className="text-emerald-600 text-xs font-bold mb-1 relative z-10 uppercase tracking-wider">ĐÃ CHẤM XONG</div>
                <div className="text-4xl font-black text-emerald-600 relative z-10">{overviewStats.completedReviews}</div>
              </div>
              <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100 flex flex-col justify-center relative overflow-hidden transition-all hover:bg-amber-50">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-200/50 rounded-full opacity-50" />
                <div className="text-amber-600 text-xs font-bold mb-1 relative z-10 uppercase tracking-wider">CHỜ CHẤM ĐIỂM</div>
                <div className="text-4xl font-black text-amber-600 relative z-10">{overviewStats.pendingReviews}</div>
              </div>
              <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 flex flex-col justify-center relative overflow-hidden transition-all hover:bg-rose-50">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose-200/50 rounded-full opacity-50" />
                <div className="text-rose-600 text-xs font-bold mb-1 relative z-10 uppercase tracking-wider">CẦN CHẤM LẠI</div>
                <div className="text-4xl font-black text-rose-600 relative z-10">{overviewStats.reEvaluationReviews}</div>
              </div>
            </div>
          </div>

        </div>

        {/* 🚀 CỘT PHẢI: LỐI TẮT NHANH CHÓNG 🚀 */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Lối tắt nhanh
          </h2>
          <div onClick={() => handleViewChange('submissions')} className="group cursor-pointer bg-white rounded-2xl p-5 border-2 border-transparent hover:border-blue-500/20 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex items-center gap-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="w-12 h-12 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-[#F26F21] group-hover:text-white group-hover:rotate-6 transition-all duration-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Xem bài chấm</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Truy cập và nộp điểm.</p>
            </div>
          </div>

          <div onClick={() => handleViewChange('criteria')} className="group cursor-pointer bg-white rounded-2xl p-5 border-2 border-transparent hover:border-purple-500/20 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex items-center gap-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="w-12 h-12 shrink-0 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white group-hover:-rotate-6 transition-all duration-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Tiêu chí</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Xem hướng dẫn chấm điểm.</p>
            </div>
          </div>

          <div onClick={() => handleViewChange('rankings')} className="group cursor-pointer bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100/50 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex items-center gap-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="w-12 h-12 shrink-0 bg-white text-emerald-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Bảng xếp hạng</h3>
              <p className="text-emerald-800/80 text-xs leading-relaxed">Xem thứ hạng tổng hợp.</p>
            </div>
          </div>

          {/* 💡 MẸO TRONG NGÀY (TIP OF THE DAY) */}
          <div className="mt-8 bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <Quote className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm tracking-wider uppercase text-slate-300">Mẹo cho bạn</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-100 font-medium">
              "{randomTip}"
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
