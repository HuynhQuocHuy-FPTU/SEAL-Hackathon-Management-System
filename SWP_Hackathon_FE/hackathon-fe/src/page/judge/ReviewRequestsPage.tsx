import { useState, useEffect } from 'react';
import {
    Search, AlertCircle, Clock,
    CheckCircle2, FolderMinus, ChevronRight, Link, FileText, Loader2
} from 'lucide-react';
import { getAssignedEvents, getAssignedRounds, getAssignedCategories, reEvaluation } from '../../services/judge/judgeService';
import type { EventDTO, RoundDTO, CategoryRoundDTO } from '../../types/judge/Submission';
import { useNotification } from '../../hook/useNotification';
import GradingModal from './GradingModal';
import type { ReEvaluationResponse } from '../../types/judge/Resubmission';

export default function ReviewRequestsPage() {
    const { addNotification } = useNotification();
    const [events, setEvents] = useState<EventDTO[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

    const [rounds, setRounds] = useState<RoundDTO[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

    const [categories, setCategories] = useState<CategoryRoundDTO[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const [evaluationData, setEvaluationData] = useState<ReEvaluationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [gradingSubmission, setGradingSubmission] = useState<{ id: number, teamName: string, mode: 'PRESENTATION' | 'SUBMISSION' } | null>(null);
    const [searchText, setSearchText] = useState('');

    // Luồng dữ liệu (Cascading Data Fetching) khi trang vừa load xong:
    // Gọi tuần tự: Sự kiện -> Vòng thi -> Hạng mục -> Yêu cầu chấm lại (Re-Evaluation)
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

                            const subRes = await reEvaluation(firstCatId);
                            setEvaluationData(subRes.data || subRes);
                        }
                    }
                } else {
                    setError('Không tìm thấy sự kiện nào được phân công.');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchSubmissions = async (categoryId: number) => {
        try {
            setIsLoading(true);
            setError(null);
            setEvaluationData(null);
            const subRes = await reEvaluation(categoryId);
            setEvaluationData(subRes.data || subRes);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi tải danh sách chấm lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý khi người dùng đổi Sự kiện trên Dropdown
    const handleEventChange = async (eventId: number) => {
        setSelectedEventId(eventId);
        setRounds([]); setSelectedRoundId(null);
        setCategories([]); setSelectedCategoryId(null);
        setEvaluationData(null);

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

                    fetchSubmissions(firstCatId);
                } else {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        } catch (err: any) {
            setError('Lỗi khi tải vòng thi.');
            setIsLoading(false);
        }
    };

    // Xử lý khi người dùng đổi Vòng thi trên Dropdown
    const handleRoundChange = async (roundId: number) => {
        setSelectedRoundId(roundId);
        setCategories([]); setSelectedCategoryId(null);
        setEvaluationData(null);

        try {
            setIsLoading(true);
            const catRes = await getAssignedCategories(roundId);
            if ((catRes.status || catRes.success) && catRes.data && catRes.data.length > 0) {
                setCategories(catRes.data);
                const firstCatId = catRes.data[0].id;
                setSelectedCategoryId(firstCatId);
                fetchSubmissions(firstCatId);
            } else {
                setIsLoading(false);
            }
        } catch (err: any) {
            setError('Lỗi khi tải lĩnh vực.');
            setIsLoading(false);
        }
    };

    const handleCategoryChange = (catId: number) => {
        setSelectedCategoryId(catId);
        fetchSubmissions(catId);
    };

    const handleSelect = (project: any, mode: 'PRESENTATION' | 'SUBMISSION') => {
        setGradingSubmission({ id: project.submissionId, teamName: project.teamName, mode });
    }

    // Mảng dữ liệu đã qua lọc theo Ô tìm kiếm tên đội
    const filtered = evaluationData?.submissions?.filter(sub =>
        sub.teamName.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

    const getLogoText = (name: string) => {
        if (!name) return 'TM';
        const words = name.split(' ');
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-300 mx-auto py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-rose-100 to-orange-100 flex items-center justify-center shadow-inner">
                    <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Yêu cầu chấm lại</h1>
                    <p className="text-sm font-medium text-slate-500">Xem xét và đánh giá các bài nộp yêu cầu phúc khảo</p>
                </div>
            </div>

            {/* Thanh công cụ: Ô tìm kiếm và Các bộ lọc (Search Bar & Filters) */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
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
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center shadow-sm border border-red-100 mt-8 max-w-2xl mx-auto">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold">{error}</p>
                </div>
            ) : (
                <>
                    {/* Bố cục lưới chứa các Thẻ bài nộp (Grid of Submission Cards) */}
                    {filtered.length === 0 ? (
                        <div className="bg-white border border-slate-100 rounded-2xl py-16 text-center shadow-xs">
                            <FolderMinus className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <h4 className="font-bold text-slate-800 text-sm">Không tìm thấy yêu cầu chấm lại nào</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Thử xóa bộ lọc tìm kiếm hoặc kiểm tra các lĩnh vực khác.</p>
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
                                            {/* Phần tiêu đề thẻ (ID và Trạng thái) */}
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                                                    ID: {project.submissionId}
                                                </span>
                                                {project.myEvaluationStatus === 'GRADED' ? (
                                                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> ĐÃ CHẤM
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[10px] font-semibold animate-pulse">
                                                        <Clock className="w-3.5 h-3.5" /> {project.myEvaluationStatus || 'RE-EVALUATION'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Phần Tên Đội và Hình đại diện (Logo) */}
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

                                            {/* Thông tin thời gian và mô tả ngắn */}
                                            <div className="text-xs text-slate-500">
                                                <p>Thời gian nộp: {new Date(project.submittedAt).toLocaleString('vi-VN')}</p>
                                                {project.description && (
                                                    <p className="mt-1 text-slate-400 line-clamp-2">{project.description}</p>
                                                )}
                                            </div>

                                            {/* Các đường link đính kèm (Github, Tài liệu) */}
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

                                        {/* Phần chân thẻ: Điểm số hiện tại & Các nút Chấm lại */}
                                        <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <div className="text-xs font-bold text-slate-700">
                                                {project.myEvaluationStatus === 'GRADED' && (
                                                    <span className="text-[#F26F21]">Điểm: {project.myTotalScore}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleSelect(project, 'PRESENTATION')}
                                                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white"
                                                >
                                                    <span>Chấm Present</span>
                                                </button>
                                                <button
                                                    onClick={() => handleSelect(project, 'SUBMISSION')}
                                                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-[#F26F21] text-blue-700 hover:text-white"
                                                >
                                                    <span>Chấm Submission</span>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Hộp thoại Chấm thi (Grading Modal) dùng chung cho Chấm lần 1 và Chấm lại */}
            {gradingSubmission && selectedRoundId && (
                <GradingModal
                    submissionId={gradingSubmission.id}
                    roundId={selectedRoundId}
                    teamName={gradingSubmission.teamName}
                    mode={gradingSubmission.mode}
                    onClose={() => setGradingSubmission(null)}
                    onSuccess={() => {
                        setGradingSubmission(null);
                        addNotification("Success", "Đã cập nhật điểm phúc khảo thành công!");
                        if (selectedCategoryId) {
                            fetchSubmissions(selectedCategoryId);
                        }
                    }}
                />
            )}
        </div>
    );
}
