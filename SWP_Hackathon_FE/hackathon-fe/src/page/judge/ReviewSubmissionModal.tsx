/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Scale, Loader2, AlertCircle } from 'lucide-react';
import type { EventDTO, RoundDTO } from '../../types/judge/Submission';
import type { CriteriaDTO } from '../../types/judge/Criteria';
import { getAssignedEvents, getAssignedRounds, getCriteriaByRoundId } from '../../services/judge/judgeService';

export default function CriteriaView() {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const [rounds, setRounds] = useState<RoundDTO[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

  const [criteria, setCriteria] = useState<CriteriaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const eventRes = await getAssignedEvents();
        if ((eventRes.status || eventRes.success) && eventRes.data && eventRes.data.length > 0) {
          setEvents(eventRes.data);
          const firstEventId = eventRes.data[0].id ?? eventRes.data[0].eventId ?? eventRes.data[0].eventID;
          if (firstEventId === undefined) throw new Error('Event ID is missing');
          setSelectedEventId(firstEventId);
          
          const roundRes = await getAssignedRounds(firstEventId);
          if ((roundRes.status || roundRes.success) && roundRes.data && roundRes.data.length > 0) {
            setRounds(roundRes.data);
            const firstRoundId = roundRes.data[0].id ?? roundRes.data[0].roundId ?? roundRes.data[0].roundID;
            if (firstRoundId === undefined) throw new Error('Round ID is missing');
            setSelectedRoundId(firstRoundId);
            
            const critRes = await getCriteriaByRoundId(firstRoundId);
            if (critRes.success && critRes.data) {
              setCriteria(critRes.data);
            }
          }
        } else {
          setError('No assigned events found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load criteria.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleEventChange = async (eventId: number) => {
    setSelectedEventId(eventId);
    setRounds([]); setSelectedRoundId(null);
    setCriteria([]);
    try {
      setIsLoading(true);
      const roundRes = await getAssignedRounds(eventId);
      if ((roundRes.status || roundRes.success) && roundRes.data && roundRes.data.length > 0) {
        setRounds(roundRes.data);
        const firstRoundId = roundRes.data[0].id ?? roundRes.data[0].roundId ?? roundRes.data[0].roundID;
        if (firstRoundId !== undefined) {
          setSelectedRoundId(firstRoundId);
          
          const critRes = await getCriteriaByRoundId(firstRoundId);
          if (critRes.success && critRes.data) {
            setCriteria(critRes.data);
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rounds.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoundChange = async (roundId: number) => {
    setSelectedRoundId(roundId);
    setCriteria([]);
    try {
      setIsLoading(true);
      const critRes = await getCriteriaByRoundId(roundId);
      if (critRes.success && critRes.data) {
        setCriteria(critRes.data);
      } else {
        setError(critRes.message || 'Failed to load criteria.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load criteria.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#0058be] animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500">Đang tải tiêu chí chấm điểm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-red-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white text-red-600 text-xs font-bold rounded-lg border border-red-100 hover:bg-red-50 transition-colors">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Tiêu đề phần Giới thiệu - Sử dụng hiệu ứng Gradient nổi bật */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0058be] via-blue-700 to-orange-900 p-8 shadow-xl text-white">
        {/* Các phần tử trang trí nền (Ánh sáng mờ) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-2">
              <Scale className="w-4 h-4 text-blue-200" />
              <span className="text-xs font-bold tracking-widest text-blue-100 uppercase">Hướng dẫn chính thức</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tiêu chuẩn đánh giá & Thang điểm
            </h3>
            <p className="text-sm text-blue-100/90 leading-relaxed max-w-xl">
              Để đảm bảo tính khách quan và thống nhất giữa các lĩnh vực thi, vui lòng chấm điểm theo đúng các tiêu chuẩn chính thức dưới đây. Mọi đánh giá phải được kèm theo nhận xét định tính bằng văn bản.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex-shrink-0 text-center shadow-inner min-w-[160px]">
            <p className="text-[10px] font-mono font-bold text-blue-200 uppercase tracking-widest mb-2">Hệ thống chấm điểm</p>
            <p className="text-3xl font-black text-white drop-shadow-sm">
              {criteria.length > 0 && criteria[0].maxScore ? criteria[0].maxScore : 10}
              <span className="text-lg text-blue-200 font-bold ml-1">pts</span>
            </p>
          </div>
        </div>
      </div>

      {/* Khu vực Chọn Bộ Lọc (Sự kiện & Vòng thi) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sự kiện</label>
          <select
            value={selectedEventId || ''}
            onChange={(e) => handleEventChange(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs font-bold rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] outline-none cursor-pointer"
          >
            <option disabled value="">Chọn sự kiện</option>
            {events.map(ev => (
              <option key={ev.id ?? ev.eventId ?? ev.eventID} value={ev.id ?? ev.eventId ?? ev.eventID}>{ev.name ?? ev.eventName}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-1/2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Vòng thi</label>
          <select
            value={selectedRoundId || ''}
            onChange={(e) => handleRoundChange(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs font-bold rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] outline-none cursor-pointer"
          >
            <option disabled value="">Chọn vòng thi</option>
            {rounds.map(r => (
              <option key={r.id ?? r.roundId ?? r.roundID} value={r.id ?? r.roundId ?? r.roundID}>{r.name ?? r.roundName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lưới hiển thị các Tiêu chí chấm điểm (Criteria) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {criteria.length === 0 && !isLoading && !error && (
          <div className="col-span-1 xl:col-span-2 py-12 text-center text-slate-500">
            Không tìm thấy tiêu chí cho vòng thi này.
          </div>
        )}
        {criteria.map((criterion, index) => (
          <div 
            key={criterion.evaluationCriteriaId} 
            className="group relative bg-white rounded-3xl border border-slate-100 p-7 shadow-sm hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden"
          >
            {/* Đường viền Gradient trang trí ở mép trên cùng của thẻ */}
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r 
              ${index % 2 === 0 ? 'from-[#0058be] to-blue-400' : 'from-orange-600 to-purple-400'} 
              opacity-80 group-hover:opacity-100 transition-opacity`} 
            />

            {/* Phần Đầu thẻ (Tên tiêu chí & Trọng số) */}
            <div className="flex justify-between items-start border-b border-slate-100/60 pb-4 mb-4">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#0058be] transition-colors">{criterion.criteriaName}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Loại: {criterion.type}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${
                  index % 2 === 0 ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-[#F26F21]'
                }`}>
                  Trọng số: {criterion.weight}
                </span>
              </div>
            </div>

            {/* Mô tả chi tiết tiêu chí */}
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{criterion.description}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
