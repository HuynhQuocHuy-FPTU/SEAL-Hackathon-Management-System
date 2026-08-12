import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ClipboardCheck,
  Calendar,
  MapPin,
  AlertCircle,
  X,
  Image,
} from 'lucide-react';
import { EventField, EventDateField, EventTeamField, EventSelectField } from '../../component/input/EventField';
import type {
  Category,
  Round,
  CustomCriteriaDetail,
  CategoryExpertAssignment,
  HackathonCreate,
  Description,
  prizes,
  CriteriaDetail,
} from '../../types/hackathonEvent/Hackathon';
import { useExperts } from '../../hook/eventHook/useExperts';
import { useCriteriaDetails } from '../../hook/eventHook/useCriterias';
import { createEvent, updateEvent } from '../../services/event/eventService';
import AdvancedScoringRounds from '../../component/eventCoordinator/AdvancedScoringRounds/AdvancedScoringRounds';
import { useForm } from 'react-hook-form';
import { applyServerErrors } from '../../hook/useApplyServerErrors';

export default function CreateEventPage() {
  const location = useLocation();
  const { isEdit, eventId, editData } = location.state || {};

  const formatForDateInput = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 16);
  };

  const initialData = editData ? {
    ...editData,
    title: editData.title || editData.theme || '',
    startDate: formatForDateInput(editData.startDate),
    endDate: formatForDateInput(editData.endDate),
    registrationDeadline: formatForDateInput(editData.registrationDeadline),
    workshopTime: formatForDateInput(editData.workshopTime),
    rounds: (editData.rounds || []).map((r: any) => ({
      ...r,
      startDate: formatForDateInput(r.startDate),
      endDate: formatForDateInput(r.endDate),
      submissionDeadline: formatForDateInput(r.submissionDeadline),
      categoryExperts: (r.categoryExperts || []).map((ce: any) => {
        const idx = (editData.categories || []).findIndex((c: any) => c.categoryId === ce.categoryId);
        return {
          ...ce,
          categoryId: idx !== -1 ? idx : ce.categoryId
        };
      })
    }))
  } : null;

  const [formData, setFormData] = useState<HackathonCreate>(initialData || {
    eventName: '',
    title: '',
    startDate: '',
    endDate: '',
    address: '',
    description: {
      introduction: '',
      prizes: [],
      participantBenefits: [],
      disqualificationRules: [],
      competitionRules: []
    },
    maxTeam: 0,
    registrationDeadline: '',
    workshopTime: '',
    minTeamSize: 0,
    maxTeamSize: 0,
    bannerUrl: '',
    season: 'SPRING',
    categories: [],
    rounds: [],
  })

  const { setError, formState: { errors } } = useForm<HackathonCreate>();
  const [activeAnchor, setActiveAnchor] = useState('section-general');
  const { data: experts = [] } = useExperts();
  const { data: criteriaSets = [] } = useCriteriaDetails();
  const [categoryInput, setCategoryInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const scrollToSection = (id: string) => {
    setActiveAnchor(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDescriptionChange = (field: keyof Description, value: any) => {
    setFormData(prev => ({ ...prev, description: { ...prev.description, [field]: value } }));
  };

  const handleDynamicStringArrayChange = (field: keyof Description, index: number, value: string) => {
    setFormData(prev => {
      const arr = [...(prev.description[field] as string[])];
      arr[index] = value;
      return { ...prev, description: { ...prev.description, [field]: arr } };
    });
  };

  const handleAddStringArrayItem = (field: keyof Description) => {
    setFormData(prev => ({
      ...prev,
      description: { ...prev.description, [field]: [...(prev.description[field] as string[]), ''] }
    }));
  };

  const handleRemoveStringArrayItem = (field: keyof Description, index: number) => {
    setFormData(prev => {
      const arr = [...(prev.description[field] as string[])];
      arr.splice(index, 1);
      return { ...prev, description: { ...prev.description, [field]: arr } };
    });
  };

  const handlePrizeChange = (index: number, key: keyof prizes, value: string) => {
    setFormData(prev => {
      const p = [...prev.description.prizes];
      p[index] = { ...p[index], [key]: value };
      return { ...prev, description: { ...prev.description, prizes: p } };
    });
  };

  const handleAddPrize = () => {
    setFormData(prev => ({
      ...prev,
      description: { ...prev.description, prizes: [...prev.description.prizes, { title: '', reward: '' }] }
    }));
  };

  const handleRemovePrize = (index: number) => {
    setFormData(prev => {
      const p = [...prev.description.prizes];
      p.splice(index, 1);
      return { ...prev, description: { ...prev.description, prizes: p } };
    });
  };

  const handleAddCategory = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = categoryInput.trim();
    if (!trimmed) return;
    setFormData(prev => {
      if (prev.categories.some(c => c.categoryName.toLowerCase() === trimmed.toLowerCase())) return prev;

      const newIndex = prev.categories.length;
      return {
        ...prev,
        categories: [...prev.categories, { categoryName: trimmed }],
        rounds: prev.rounds.map(r => ({
          ...r,
          categoryExperts: [
            ...r.categoryExperts,
            { categoryId: newIndex, experts: [] }
          ]
        }))
      };
    });
    setCategoryInput('');
  };

  const handleRemoveCategory = (cat: Category) => {
    setFormData(prev => {
      const indexToRemove = prev.categories.findIndex(c => c.categoryName === cat.categoryName);
      if (indexToRemove === -1) return prev;

      const newCategories = prev.categories.filter((_, idx) => idx !== indexToRemove);

      const newRounds = prev.rounds.map(r => {
        const newCategoryExperts = r.categoryExperts
          .filter(ce => ce.categoryId !== indexToRemove)
          .map(ce => ({
            ...ce,
            categoryId: ce.categoryId > indexToRemove ? ce.categoryId - 1 : ce.categoryId
          }));

        return {
          ...r,
          categoryExperts: newCategoryExperts
        };
      });

      return { ...prev, categories: newCategories, rounds: newRounds };
    });
  };

  const handleAddRound = () => {
    setFormData(prev => {
      const newId = prev.rounds.length > 0 ? Math.max(...prev.rounds.map(r => r.roundId)) + 1 : 1;
      return {
        ...prev,
        rounds: [
          ...prev.rounds,
          {
            roundId: newId,
            roundName: `Round ${prev.rounds.length + 1}`,
            description: '',
            startDate: '',
            endDate: '',
            submissionDeadline: '',
            advancementRule: 'Manual selection',
            orderIndex: prev.rounds.length + 1,
            criteriaSetId: 0,
            customCriteriaDetatils: [],
            categoryExperts: prev.categories.map((_, idx) => ({ categoryId: idx, experts: [] })),
            topN: 0,
            submissionType: 'FILE',
            allowedFileTypes: [],
            maxFileCount: 0,
            evaluationDeadline: '',
            resolveAppealDeadline: ''
          },
        ]
      };
    });
  };

  const handleRemoveRound = (roundId: number) => {
    if (formData.rounds.length <= 1) {
      setStatusMessage({ type: 'error', text: 'Yêu cầu ít nhất một vòng đánh giá.' });
      return;
    }
    setFormData(prev => ({ ...prev, rounds: prev.rounds.filter(r => r.roundId !== roundId) }));
  };

  const handleUpdateRound = (roundId: number, updates: Partial<Round>) =>
    setFormData(prev => ({ ...prev, rounds: prev.rounds.map(r => (r.roundId === roundId ? { ...r, ...updates } : r)) }));

  const handleSelectCriteriaSet = (roundId: number, setId: number) => {
    const chosen = criteriaSets.find(s => s.criteriaSetId === setId);
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.map(r => {
        if (r.roundId !== roundId) return r;
        return {
          ...r,
          criteriaSetId: setId,
          customCriteriaDetatils: chosen?.criteriaDetails ? chosen.criteriaDetails.map((d: CriteriaDetail) => ({
            evaluationCriteriaId: d.criteriaId || (Date.now() + Math.floor(Math.random() * 1000)),
            criteriaName: d.criteriaName || '',
            customWeight: d.weight || 0,
            type: d.type || '',
            description: d.description || ''
          })) : [],
        };
      })
    }));
  };
  const handleUpdateCriterion = (
    roundId: number,
    criteriaId: number,
    updates: Partial<CustomCriteriaDetail>
  ) =>
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.map(r =>
        r.roundId === roundId
          ? {
            ...r,
            customCriteriaDetatils: r.customCriteriaDetatils.map(c =>
              c.evaluationCriteriaId === criteriaId ? { ...c, ...updates } : c
            ),
          }
          : r
      )
    }));

  const handleUpdateCategoryExperts = (roundId: number, updated: CategoryExpertAssignment[]) =>
    setFormData(prev => ({ ...prev, rounds: prev.rounds.map(r => (r.roundId === roundId ? { ...r, categoryExperts: updated } : r)) }));

  const handleCreateEventSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (!formData.eventName.trim()) {
      setStatusMessage({ type: 'error', text: 'Xin vui lòng nhập tên sự kiện (Event Name).' });
      scrollToSection('section-general');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setStatusMessage({ type: 'error', text: 'Vui lòng cung cấp đầy đủ ngày bắt đầu và kết thúc.' });
      scrollToSection('section-general');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setStatusMessage({ type: 'error', text: 'Ngày kết thúc không được sớm hơn ngày bắt đầu.' });
      scrollToSection('section-general');
      return;
    }
    for (const round of formData.rounds) {
      const sum = round.customCriteriaDetatils.reduce((acc, c) => acc + (c.customWeight || 0), 0);
      if (round.customCriteriaDetatils.length > 0 && sum !== 100) {
        setStatusMessage({
          type: 'error',
          text: `Tổng trọng số của vòng "${round.roundName}" phải đúng 100%. Hiện tại: ${sum}%.`,
        });
        scrollToSection('section-rounds');
        return;
      }
    }

    const convertToLocalDateTime = (dateStr: string) => {
      if (!dateStr) return null;
      if (dateStr.includes('T')) {
        if (dateStr.length === 16) return `${dateStr}:00`;
        return dateStr;
      }
      return `${dateStr}T00:00:00`;
    };

    try {
      const { title, rounds, workshopTime, ...restFormData } = formData;
      const payload = {
        ...restFormData,
        title: title,
        startDate: convertToLocalDateTime(formData.startDate),
        endDate: convertToLocalDateTime(formData.endDate),
        registrationDeadline: convertToLocalDateTime(formData.registrationDeadline),
        workshopTime: convertToLocalDateTime(workshopTime),
        rounds: rounds.map(r => {
          const { customCriteriaDetatils, roundId, ...restRound } = r;

          return {
            ...restRound,
            startDate: convertToLocalDateTime(r.startDate),
            endDate: convertToLocalDateTime(r.endDate),
            submissionDeadline: convertToLocalDateTime(r.submissionDeadline),
            evaluationDeadline: convertToLocalDateTime(r.evaluationDeadline),
            resolveAppealDeadline: convertToLocalDateTime(r.resolveAppealDeadline),
            customCriteriaDetatils: customCriteriaDetatils.map(c => ({
              criteriaDetailId: c.evaluationCriteriaId,
              criteriaName: c.criteriaName,
              customWeight: c.customWeight,
              type: c.type,
              description: c.description
            }))
          };
        })
      };
      if (isEdit) {
        await updateEvent(payload as any, eventId);
        setStatusMessage({
          type: 'success',
          text: `Cập nhật sự kiện "${formData.eventName}" thành công!`,
        });
      } else {
        await createEvent(payload as any);
        setStatusMessage({
          type: 'success',
          text: `Khởi tạo sự kiện "${formData.eventName}" thành công!`,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 400 && error.response.data?.data) {
        applyServerErrors<HackathonCreate>(
          error.response.data.data,
          setError
        );
        setStatusMessage({
          type: 'error',
          text: `Vui lòng kiểm tra lại các trường bị lỗi.`,
        });
        return;
      }

      let errorMsg = 'Có lỗi xảy ra khi tạo sự kiện, vui lòng thử lại sau.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else {
          errorMsg = JSON.stringify(error.response.data);
        }
      }

      setStatusMessage({
        type: 'error',
        text: errorMsg,
      });
    }
  };

  const [hasDraft, setHasDraft] = useState(false);

  React.useEffect(() => {
    const draft = localStorage.getItem('create_event_draft');
    if (draft) setHasDraft(true);
  }, []);

  const handleSaveDraft = () => {
    localStorage.setItem('create_event_draft', JSON.stringify(formData));
    setHasDraft(true);
    setStatusMessage({
      type: 'success',
      text: `💾 Đã lưu bản nháp sự kiện "${formData.eventName || 'Chưa đặt tên'}" thành công!`,
    });
  };

  const handleLoadDraft = () => {
    try {
      const draft = localStorage.getItem('create_event_draft');
      if (draft) {
        setFormData(JSON.parse(draft));
        setStatusMessage({
          type: 'success',
          text: `📂 Đã tải bản nháp thành công!`,
        });
      }
    } catch (error) {
      console.error('Failed to parse draft:', error);
      setStatusMessage({
        type: 'error',
        text: `Lỗi tải bản nháp!`,
      });
    }
  };

  return (
    <div className="flex gap-8 relative">
      {/* Left Sticky Nav */}
      <aside className="w-52 hidden lg:block shrink-0 sticky top-4 h-fit">
        <h3 className="font-semibold text-[10px] uppercase text-slate-400 tracking-wider mb-3 leading-none font-mono">
          THIẾT LẬP SỰ KIỆN
        </h3>
        <nav className="space-y-1 border-l border-slate-200/80 pl-4">
          {[
            { id: 'section-general', label: 'Thông tin chung' },
            { id: 'section-description', label: 'Mô tả sự kiện' },
            { id: 'section-teams', label: 'Quy định nhóm' },
            { id: 'section-categories', label: 'Hạng mục thi' },
            { id: 'section-rounds', label: 'Vòng đánh giá chuyên sâu' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className={`block text-xs font-semibold py-2 transition-all cursor-pointer text-left relative ${activeAnchor === id
                ? 'text-blue-600 font-bold before:absolute before:-left-4 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-full before:bg-[#F26F21]'
                : 'text-slate-400 hover:text-slate-800'
                }`}
            >
              {label}
            </button>
          ))}
        </nav>
        {statusMessage && (
          <div
            className={`mt-8 p-4 rounded-xl text-xs flex gap-2.5 border ${statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}
          >
            {statusMessage.type === 'success' ? (
              <ClipboardCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="font-bold">Hệ thống báo:</strong>
              <p className="mt-1 font-medium leading-relaxed">{statusMessage.text}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Form */}
      <form onSubmit={handleCreateEventSubmit} className="flex-1 space-y-10 pb-24">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? 'Chỉnh Sửa Sự Kiện' : 'Khởi Tạo Sự Kiện Mới'}
          </h1>
          <p className="text-slate-500 mt-2">
            {isEdit ? 'Cập nhật thông tin chi tiết, luật lệ và các vòng thi cho sự kiện của bạn.' : 'Thiết lập thông tin chi tiết, luật lệ và các vòng thi cho sự kiện của bạn.'}
          </p>
        </div>
        {/* ── General Info ── */}
        <section className="scroll-mt-24 space-y-4" id="section-general">
          <div>
            <h3 className="text-base font-semibold text-slate-900 leading-tight">Thông tin chung</h3>
            <p className="text-xs text-slate-400 mt-1">Chi tiết cơ bản hiển thị công khai trên cổng thông tin cuộc thi.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <EventField label="Tên sự kiện" value={formData.eventName} onChange={e => setFormData(prev => ({ ...prev, eventName: e.target.value }))} placeholder="VD: Global AI Challenge 2026" error={errors.eventName?.message} />
              <EventField label="Chủ đề" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Kiến tạo tương lai trí tuệ nhân tạo" error={errors.title?.message} />
              <EventDateField Icon={Calendar} label="Ngày bắt đầu" value={formData.startDate} onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))} placeholder="MM/DD/YYYY" error={errors.startDate?.message} />
              <EventDateField Icon={Calendar} label="Ngày kết thúc" value={formData.endDate} onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))} placeholder="MM/DD/YYYY" error={errors.endDate?.message} />
              <EventSelectField
                Icon={MapPin}
                label="Mùa giải"
                value={formData.season}
                onChange={e => setFormData(prev => ({ ...prev, season: e.target.value as any }))}
                options={[
                  { value: 'SPRING', label: 'SPRING' },
                  { value: 'SUMMER', label: 'SUMMER' },
                  { value: 'FALL', label: 'FALL' },
                  { value: 'WINTER', label: 'WINTER' }
                ]}
                error={errors.season?.message}
              />
              <EventField Icon={MapPin} label="Địa điểm / Địa chỉ" value={formData.address} onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Địa chỉ trực tuyến hoặc thực tế" error={errors.address?.message} />
              <EventField Icon={Image} label="Đường dẫn ảnh bìa" value={formData.bannerUrl} onChange={e => setFormData(prev => ({ ...prev, bannerUrl: e.target.value }))} placeholder='https://example.com/image.jpg' error={errors.bannerUrl?.message} />
            </div>
          </div>
        </section>

        {/* ── Event Description ── */}
        <section className="scroll-mt-24 space-y-4" id="section-description">
          <div>
            <h3 className="text-base font-semibold text-slate-900 leading-tight">Mô tả sự kiện</h3>
            <p className="text-xs text-slate-400 mt-1">Thông tin chi tiết, quy định, quyền lợi và câu hỏi thường gặp.</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8 space-y-8">

            {/* Introduction */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase font-mono tracking-wider">Giới thiệu</label>
              <textarea
                value={formData.description.introduction}
                onChange={e => handleDescriptionChange('introduction', e.target.value)}
                placeholder="Viết phần giới thiệu ngắn gọn cho sự kiện..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all min-h-30"
              />
            </div>

            {/* Prizes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-500 uppercase font-mono tracking-wider">Giải thưởng</label>
                <button type="button" onClick={handleAddPrize} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-100/50">
                  Thêm Giải thưởng
                </button>
              </div>
              <div className="space-y-3">
                {formData.description.prizes.map((prize, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center group">
                    <div className="flex-1 grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                      <div className="bg-white flex items-center focus-within:relative focus-within:z-10 focus-within:ring-1 focus-within:ring-blue-500">
                        <span className="pl-3.5 pr-2 py-2.5 text-xs font-medium text-slate-400 bg-slate-50/50 border-r border-slate-100">Danh hiệu</span>
                        <input
                          type="text"
                          value={prize.title}
                          onChange={e => handlePrizeChange(idx, 'title', e.target.value)}
                          placeholder="VD: Giải nhất"
                          className="flex-1 py-2.5 px-3.5 text-sm text-slate-800 bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="bg-white flex items-center focus-within:relative focus-within:z-10 focus-within:ring-1 focus-within:ring-blue-500">
                        <span className="pl-3.5 pr-2 py-2.5 text-xs font-medium text-slate-400 bg-slate-50/50 border-r border-slate-100">Phần thưởng</span>
                        <input
                          type="text"
                          value={prize.reward}
                          onChange={e => handlePrizeChange(idx, 'reward', e.target.value)}
                          placeholder="VD: $5,000"
                          className="flex-1 py-2.5 px-3.5 text-sm text-slate-800 bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemovePrize(idx)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-all shrink-0 cursor-pointer border border-transparent hover:border-rose-100">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.description.prizes.length === 0 && <p className="text-xs text-slate-400 italic">Chưa có giải thưởng nào được thêm.</p>}
              </div>
            </div>

            {/* Dynamic string arrays */}
            {[
              { field: 'participantBenefits' as keyof Description, label: 'Quyền lợi thí sinh', placeholder: 'VD: Quà tặng miễn phí, kết nối, tư vấn...' },
              { field: 'disqualificationRules' as keyof Description, label: 'Quy định loại', placeholder: 'VD: Việc đạo văn sẽ dẫn đến bị loại ngay lập tức.' },
              { field: 'competitionRules' as keyof Description, label: 'Quy định cuộc thi', placeholder: 'VD: Các đội phải có từ 2-5 thành viên.' },
            ].map(({ field, label, placeholder }) => (
              <div key={field} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-500 uppercase font-mono tracking-wider">{label}</label>
                  <button type="button" onClick={() => handleAddStringArrayItem(field)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-100/50">
                    Thêm mục
                  </button>
                </div>
                <div className="space-y-3">
                  {(formData.description[field] as string[]).map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 items-center group">
                      <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm hover:shadow-md">
                        <div className="pl-3.5 pr-2 py-2.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                          <span className="text-xs font-mono font-medium">{idx + 1}.</span>
                        </div>
                        <input
                          type="text"
                          value={item}
                          onChange={e => handleDynamicStringArrayChange(field, idx, e.target.value)}
                          placeholder={placeholder}
                          className="flex-1 py-2.5 px-3.5 text-sm text-slate-800 bg-transparent focus:outline-none"
                        />
                      </div>
                      <button type="button" onClick={() => handleRemoveStringArrayItem(field, idx)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-all shrink-0 cursor-pointer border border-transparent hover:border-rose-100">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(formData.description[field] as string[]).length === 0 && <p className="text-xs text-slate-400 italic">Chưa có mục nào được thêm.</p>}
                </div>
              </div>
            ))}

          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <section className="scroll-mt-24 space-y-4" id="section-teams">
            <div>
              <h3 className="text-base font-semibold text-slate-900 leading-tight">Quy định nhóm</h3>
              <p className="text-xs text-slate-400 mt-1">Xác định giới hạn số đội và số thành viên cho các đội tham gia.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8 h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <EventTeamField label="Tổng số đội tối thiểu" value={formData.minTeam === 0 ? '' : formData.minTeam} onChange={e => setFormData(prev => ({ ...prev, minTeam: e.target.value === '' ? 0 : parseInt(e.target.value) }))} placeholder="VD: 02" error={errors.minTeam?.message} />
                <EventTeamField label="Tổng số đội tối đa" value={formData.maxTeam === 0 ? '' : formData.maxTeam} onChange={e => setFormData(prev => ({ ...prev, maxTeam: e.target.value === '' ? 0 : parseInt(e.target.value) }))} placeholder="VD: 50" error={errors.maxTeam?.message} />
                <EventTeamField label="Số thành viên tối thiểu" value={formData.minTeamSize === 0 ? '' : formData.minTeamSize} onChange={e => setFormData(prev => ({ ...prev, minTeamSize: e.target.value === '' ? 0 : parseInt(e.target.value) }))} placeholder="1" error={errors.minTeamSize?.message} />
                <EventTeamField label="Số thành viên tối đa" value={formData.maxTeamSize === 0 ? '' : formData.maxTeamSize} onChange={e => setFormData(prev => ({ ...prev, maxTeamSize: e.target.value === '' ? 0 : parseInt(e.target.value) }))} placeholder="1" error={errors.maxTeamSize?.message} />
                <EventDateField Icon={Calendar} label="Hạn chót đăng ký" value={formData.registrationDeadline} onChange={e => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))} placeholder='MM/DD/YYYY' error={errors.registrationDeadline?.message} />
                <EventDateField Icon={Calendar} label="Thời gian diễn ra bốc thăm" value={formData.workshopTime} onChange={e => setFormData(prev => ({ ...prev, workshopTime: e.target.value }))} placeholder='MM/DD/YYYY' error={errors.workshopTime?.message} />
              </div>
            </div>
          </section>
          <section className="scroll-mt-24 space-y-4" id="section-categories">
            <div>
              <h3 className="text-base font-semibold text-slate-900 leading-tight">Hạng mục thi</h3>
              <p className="text-xs text-slate-400 mt-1">Tạo các lĩnh vực hoặc chủ đề công nghệ cụ thể cho các đội cạnh tranh.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8 space-y-4 h-full">
              <label className="block text-xs font-semibold text-slate-500 uppercase font-mono tracking-wider">Thêm Hạng mục</label>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={e => setCategoryInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory(e)}
                  placeholder="Nhập tên hạng mục (VD: HealthTech)..."
                  className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleAddCategory()}
                  className="bg-slate-800 hover:bg-slate-950 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.categories.map((cat, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-full text-xs font-medium border border-blue-100/65">
                    {cat.categoryName}
                    <button type="button" onClick={() => handleRemoveCategory(cat)} className="hover:text-blue-800 text-blue-400 p-0.5 rounded-full transition-colors cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {formData.categories.length === 0 && <span className="text-xs text-slate-400 italic">Chưa có hạng mục nào được định nghĩa.</span>}
              </div>
            </div>
          </section>
        </div>

        {/* ── Advanced Scoring Rounds ── */}
        <AdvancedScoringRounds
          rounds={formData.rounds}
          criteriaSets={criteriaSets}
          experts={experts}
          categories={formData.categories}
          onAddRound={handleAddRound}
          onRemoveRound={handleRemoveRound}
          onUpdateRound={handleUpdateRound}
          onSelectCriteriaSet={handleSelectCriteriaSet}
          onUpdateCriterion={handleUpdateCriterion}
          onUpdateCategoryExperts={handleUpdateCategoryExperts}
        />

        {/* Footer */}
        <div className="fixed bottom-0 left-64 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 px-8 flex justify-end gap-3.5 z-30 shadow-lg">
          {hasDraft && (
            <button
              type="button"
              onClick={handleLoadDraft}
              className="px-6 py-2.5 rounded-xl text-blue-600 hover:text-blue-700 font-semibold text-xs bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer active:scale-[0.98]"
            >
              Tải bản nháp
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-6 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer active:scale-[0.98]"
          >
            Lưu bản nháp
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 rounded-xl text-white font-semibold text-xs bg-[#F26F21] hover:brightness-110 transition-all shadow-md cursor-pointer active:scale-[0.98]"
          >
            {isEdit ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
          </button>
        </div>
      </form>
    </div>
  );
}
