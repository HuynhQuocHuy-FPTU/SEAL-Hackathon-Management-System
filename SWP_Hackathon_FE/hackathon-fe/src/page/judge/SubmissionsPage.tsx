import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  FolderMinus,
  ChevronRight,
  Link,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { GradingSubmissionData, CategoryRoundDTO, EventDTO, RoundDTO } from '../../types/judge/Submission';
import { getAssignedCategories, getAssignedSubmissions, getAssignedEvents, getAssignedRounds } from '../../services/judge/judgeService';
import GradingModal from './GradingModal';

interface SubmissionsViewProps {
  onSelectProjectForScoring?: (submissionId: string) => void;
}

export default function SubmissionsView({
  onSelectProjectForScoring
}: SubmissionsViewProps) {
  const [gradingSubmission, setGradingSubmission] = useState<{ id: number, teamName: string, mode: 'PRESENTATION' | 'SUBMISSION', isViewOnly?: boolean } | null>(null);

  // Xử lý sự kiện khi Giám khảo bấm vào các nút (Chấm Code, Chấm Present, Chi tiết, v.v.)
  const handleSelect = (project: GradingSubmissionData, mode: 'PRESENTATION' | 'SUBMISSION', isViewOnly = false) => {
    if (onSelectProjectForScoring && !isViewOnly) {
      onSelectProjectForScoring(project.submissionId.toString());
    } else {
      setGradingSubmission({ id: project.submissionId, teamName: project.teamName, mode, isViewOnly });
    }
  }

  const fetchSubmissions = async (categoryId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setSubmissions([]);
      const subRes = await getAssignedSubmissions(categoryId);
      setSubmissions(subRes.submissions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const [events, setEvents] = useState<EventDTO[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const [rounds, setRounds] = useState<RoundDTO[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

  const [submissions, setSubmissions] = useState<GradingSubmissionData[]>([]);
  const [categories, setCategories] = useState<CategoryRoundDTO[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Luồng dữ liệu (Cascading Data Fetching) khi trang vừa load xong:
  // Vì trang này cần chọn [Sự kiện] -> [Vòng thi] -> [Hạng mục] nên ta phải gọi API tuần tự
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const eventRes = await getAssignedEvents();
        if ((eventRes.status || eventRes.success) && eventRes.data && eventRes.data.length > 0) {
          setEvents(eventRes.data);
          const firstEventId = eventRes.data[0].id ?? eventRes.data[0].eventId ?? eventRes.data[0].eventID;
          setSelectedEventId(firstEventId);

          const roundRes = await getAssignedRounds(firstEventId);
          if ((roundRes.status || roundRes.success) && roundRes.data && roundRes.data.length > 0) {
            setRounds(roundRes.data);
            const firstRoundId = roundRes.data[0].id ?? roundRes.data[0].roundId ?? roundRes.data[0].roundID;
            setSelectedRoundId(firstRoundId);
            const catRes = await getAssignedCategories(firstRoundId);
            if ((catRes.status || catRes.success) && catRes.data && catRes.data.length > 0) {
              setCategories(catRes.data);
              const firstCatId = catRes.data[0].id;
              setSelectedCategoryId(firstCatId);
              const subRes = await getAssignedSubmissions(firstCatId);
              setSubmissions(subRes.submissions);
            }
          }
        } else {
          setError('No assigned events found.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Xử lý khi người dùng đổi Sự kiện (Dropdown)
  const handleEventChange = async (eventId: number) => {
    setSelectedEventId(eventId);
    setRounds([]); setSelectedRoundId(null);
    setCategories([]); setSelectedCategoryId(null);
    setSubmissions([]);
    setError(null);
    try {
      setIsLoading(true);
      const roundRes = await getAssignedRounds(eventId);
      if ((roundRes.status || roundRes.success) && roundRes.data && roundRes.data.length > 0) {
        setRounds(roundRes.data);
        const firstRoundId = roundRes.data[0].id ?? roundRes.data[0].roundId ?? roundRes.data[0].roundID;
        setSelectedRoundId(firstRoundId);

        const catRes = await getAssignedCategories(firstRoundId);
        if ((catRes.status || catRes.success) && catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
          const firstCatId = catRes.data[0].id;
          setSelectedCategoryId(firstCatId);

          const subRes = await getAssignedSubmissions(firstCatId);
          setSubmissions(subRes.submissions);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rounds.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi người dùng đổi Vòng thi (Dropdown)
  const handleRoundChange = async (roundId: number) => {
    setSelectedRoundId(roundId);
    setCategories([]); setSelectedCategoryId(null);
    setSubmissions([]);
    setError(null);
    try {
      setIsLoading(true);
      const catRes = await getAssignedCategories(roundId);
      if ((catRes.status || catRes.success) && catRes.data && catRes.data.length > 0) {
        setCategories(catRes.data);
        const firstCatId = catRes.data[0].id;
        setSelectedCategoryId(firstCatId);
        const subRes = await getAssignedSubmissions(firstCatId);
        setSubmissions(subRes.submissions);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = async (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSubmissions([]);
    setError(null);
    try {
      setIsLoading(true);
      const subRes = await getAssignedSubmissions(categoryId);
      setSubmissions(subRes.submissions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const statuses = ['All', 'PENDING', 'GRADED'];

  // Logic lọc dữ liệu (Filtering): 
  // Chạy mỗi khi người dùng gõ tìm kiếm hoặc đổi trạng thái (Chờ chấm / Đã chấm)
  const filtered = submissions?.filter(project => {
    // 1. Kiểm tra xem tên đội có chứa chữ được nhập vào ô tìm kiếm không
    const matchesSearch = project.teamName.toLowerCase().includes(searchText.toLowerCase());
    // 2. Chuyển đổi trạng thái đánh giá về dạng chuẩn 'GRADED' (Đã chấm) hoặc 'PENDING' (Chờ chấm)
    const evalStatus = project.myEvaluationStatus === 'GRADED' ? 'GRADED' : 'PENDING';
    // 3. Đối chiếu với Trạng thái đang chọn trên ô Dropdown
    const matchesStatus = selectedStatus === 'All' || evalStatus === selectedStatus;
    // 4. Chỉ giữ lại những bài thi thỏa mãn cả 2 điều kiện
    return matchesSearch && matchesStatus;
  });

  const getLogoText = (name: string) => {
    if (!name) return 'TM';
    const words = name.split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Phần Tiêu đề & Thống kê */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Danh sách bài thi</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Xem và đánh giá các bài nộp {filtered ? `(${filtered.length} kết quả)` : ''}</p>
        </div>
      </div>

      {/* Thanh Công cụ: Tìm kiếm & Lọc (Search Bar & Filters) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">

        {/* Bố cục dạng lưới chứa Ô tìm kiếm và 4 ô Select */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo tên đội..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs focus:ring-2 focus:ring-[#F26F21]/20 focus:border-[#F26F21] outline-none transition-all"
            />
          </div>

          {/* Cột 2: Chọn Sự kiện */}
          <div>
            <select
              value={selectedEventId || ''}
              onChange={(e) => handleEventChange(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-100 text-slate-600 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#F26F21]/20 focus:border-[#F26F21] outline-none cursor-pointer"
            >
              <option disabled value="">Chọn sự kiện</option>
              {events.map(ev => (
                <option key={ev.id ?? ev.eventId ?? ev.eventID} value={ev.id ?? ev.eventId ?? ev.eventID}>{ev.name ?? ev.eventName}</option>
              ))}
            </select>
          </div>

          {/* Cột 3: Chọn Vòng thi */}
          <div>
            <select
              value={selectedRoundId || ''}
              onChange={(e) => handleRoundChange(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-100 text-slate-600 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#F26F21]/20 focus:border-[#F26F21] outline-none cursor-pointer"
            >
              <option disabled value="">Chọn vòng thi</option>
              {rounds.map(r => (
                <option key={r.id ?? r.roundId ?? r.roundID} value={r.id ?? r.roundId ?? r.roundID}>{r.name ?? r.roundName}</option>
              ))}
            </select>
          </div>

          {/* Cột 4: Chọn Hạng mục / Lĩnh vực */}
          <div>
            <select
              value={selectedCategoryId || ''}
              onChange={(e) => handleCategoryChange(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-100 text-slate-600 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#F26F21]/20 focus:border-[#F26F21] outline-none cursor-pointer"
            >
              <option disabled value="">Chọn lĩnh vực</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Cột 5: Chọn trạng thái Chấm thi */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 text-slate-600 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#F26F21]/20 focus:border-[#F26F21] outline-none cursor-pointer"
            >
              <option disabled>Lọc theo trạng thái</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'Tất cả trạng thái' : s === 'GRADED' ? 'Đã chấm' : 'Chờ chấm'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center shadow-sm border border-red-100 mt-8 max-w-2xl mx-auto">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-semibold">{error}</p>
        </div>
      ) : (
      <>
      {/* Khung chứa các Thẻ bài thi (Grid of Submission Cards) */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl py-16 text-center shadow-xs">
          <FolderMinus className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">Không tìm thấy bài nộp phù hợp</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Thử xóa bộ lọc tìm kiếm, kiểm tra các lĩnh vực khác hoặc thay đổi trạng thái đánh giá.</p>
          <button
            onClick={() => {
              setSearchText('');
              setSelectedStatus('All');
            }}
            className="mt-4 text-xs font-bold text-[#F26F21] hover:underline cursor-pointer"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((project) => {
            return (
              <div
                key={project.submissionId}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-200/60 transition-all duration-300 group"
              >
                <div className="space-y-4">

                  {/* Dòng trên cùng: Hiển thị ID và Trạng thái Chấm */}
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      ID: {project.submissionId}
                    </span>
                    {project.myEvaluationStatus === 'GRADED' ? (
                      <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ĐÃ CHẤM
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full text-[10px] font-semibold animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> {project.myEvaluationStatus || 'PENDING'}
                      </span>
                    )}
                  </div>

                  {/* Khu vực Logo tự tạo (Chữ cái đầu) và Tên Đội */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs border bg-slate-50 text-slate-600 border-slate-200">
                      {getLogoText(project.teamName)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-[#F26F21] transition-colors">
                        {project.teamName}
                      </h4>
                    </div>
                  </div>

                  {/* Thông tin Thời gian nộp & Mô tả ngắn */}
                  <div className="text-xs text-slate-500">
                    <p>Thời gian nộp: {new Date(project.submittedAt).toLocaleString('vi-VN')}</p>
                    {project.description && (
                      <p className="mt-1 text-slate-400 line-clamp-2">{project.description}</p>
                    )}
                  </div>

                  {/* Các đường link mã nguồn (Github) và Tệp đính kèm */}
                  <div className="space-y-3 pt-2">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#F26F21] bg-slate-50 p-2 rounded-lg transition-colors">
                        <Link className="w-4 h-4" />
                        <span className="truncate">{project.githubUrl}</span>
                      </a>
                    )}

                    {project.files && project.files.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">Tệp đính kèm</p>
                        <div className="flex flex-col gap-1.5">
                          {project.files.map((file, idx) => (
                            <a key={idx} href={file.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-[#F26F21] hover:underline">
                              <FileText className="w-3.5 h-3.5" />
                              <span className="truncate max-w-50">{file.fileName}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Khu vực chân thẻ: Hiển thị Điểm số (nếu có) và Các Nút thao tác (Chấm/Sửa) */}
                <div className="mt-5 pt-4 border-t border-slate-50 flex flex-col gap-3">
                  {project.myEvaluationStatus === 'GRADED' && (
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${project.hasTotalDeviationWarning ? 'bg-amber-50/50 border-amber-200' : 'bg-blue-50/50 border-blue-100'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${project.hasTotalDeviationWarning ? 'text-amber-800' : 'text-blue-800'}`}>Điểm của bạn</span>
                        {project.hasTotalDeviationWarning && (
                           <span title={`Lệch ${project.totalDeviation} điểm (${project.totalDeviationPercentage}%)`} className="flex items-center text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] font-bold gap-1 cursor-help">
                             <AlertCircle className="w-3 h-3" /> Lệch điểm
                           </span>
                        )}
                      </div>
                      <span className={`text-sm font-black ${project.hasTotalDeviationWarning ? 'text-amber-700' : 'text-blue-600'}`}>{project.myTotalScore}</span>
                    </div>
                  )}

                  <div className={`grid gap-2 ${project.myEvaluationStatus === 'GRADED' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {project.myEvaluationStatus === 'GRADED' ? (
                      <>
                        <button
                          onClick={() => handleSelect(project, 'PRESENTATION', true)}
                          className="py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleSelect(project, 'PRESENTATION')}
                          className="py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white"
                        >
                          Sửa Present
                        </button>
                        <button
                          onClick={() => handleSelect(project, 'SUBMISSION')}
                          className="py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center bg-blue-50 hover:bg-[#F26F21] text-blue-700 hover:text-white"
                        >
                          Sửa Code
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSelect(project, 'PRESENTATION')}
                          className="py-2 px-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white"
                        >
                          Chấm Present
                        </button>
                        <button
                          onClick={() => handleSelect(project, 'SUBMISSION')}
                          className="py-2 px-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1 bg-blue-50 hover:bg-[#F26F21] text-blue-700 hover:text-white"
                        >
                          Chấm Code
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* Hộp thoại Chấm thi (Grading Modal) 
          Sẽ hiện lên khi biến gradingSubmission có giá trị (không bị null) */}
      {gradingSubmission && selectedRoundId && (
        <GradingModal
          submissionId={gradingSubmission.id}
          roundId={selectedRoundId}
          teamName={gradingSubmission.teamName}
          mode={gradingSubmission.mode}
          isViewOnly={gradingSubmission.isViewOnly}
          onClose={() => setGradingSubmission(null)}
          onSuccess={() => {
            setGradingSubmission(null);
            if (selectedCategoryId) {
              fetchSubmissions(selectedCategoryId);
            }
          }}
        />
      )}
    </div>
  );
}
