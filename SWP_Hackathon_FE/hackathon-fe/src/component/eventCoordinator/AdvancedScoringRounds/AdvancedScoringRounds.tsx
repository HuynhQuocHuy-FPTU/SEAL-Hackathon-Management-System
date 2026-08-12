import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  X,
  PlusCircle,
  Calendar,
  UserCheck,
  Database,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EventDateField } from '../../input/EventField';
import CustomSelect from "../../../component/ui/CustomSelect";
import type {
  Round,
  CustomCriteriaDetail,
  Category,
  CategoryExpertAssignment,
  CriteriaSet,
  FileType,
} from '../../../types/hackathonEvent/Hackathon';
import { FILE_TYPES } from '../../../types/hackathonEvent/Hackathon';
import type { ExpertPropfile } from '../../../types/account/Account';
import CategoryExpertPanel from '../CategoryExpert/CategoryExpertPanel';
interface AdvancedScoringRoundsProps {
  rounds: Round[];
  criteriaSets: CriteriaSet[];
  experts: ExpertPropfile[];
  categories: Category[];
  onAddRound: () => void;
  onRemoveRound: (roundId: number) => void;
  onUpdateRound: (roundId: number, updates: Partial<Round>) => void;
  onSelectCriteriaSet: (roundId: number, setId: number) => void;
  onUpdateCriterion: (roundId: number, criteriaDetailId: number, updates: Partial<CustomCriteriaDetail>) => void;
  onUpdateCategoryExperts: (roundId: number, updated: CategoryExpertAssignment[]) => void;
}

function FileTypeSelector({ selectedTypes, onChange }: { selectedTypes: FileType[], onChange: (types: FileType[]) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = Object.keys(FILE_TYPES) as FileType[];

  const toggle = (type: FileType) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter(t => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 cursor-pointer flex flex-wrap gap-1.5 items-center min-h-10.5 transition-all focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500"
      >
        {selectedTypes.length === 0 ? <span className="text-slate-400">Select file types...</span> :
          selectedTypes.map(t => (
            <span key={t} className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 shadow-sm">
              {t}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-blue-900 transition-colors" onClick={(e) => { e.stopPropagation(); toggle(t); }} />
            </span>
          ))
        }
      </div>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
          {options.map(type => (
            <label key={type} className="flex items-center gap-2 text-xs font-semibold p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
              <input type="checkbox" className="accent-blue-600 w-3.5 h-3.5" checked={selectedTypes.includes(type)} onChange={() => toggle(type)} />
              {type}
            </label>
          ))}
        </div>
      )}
      {isOpen && <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />}
    </div>
  );
}

export default function AdvancedScoringRounds({
  rounds,
  criteriaSets,
  experts,
  categories,
  onAddRound,
  onRemoveRound,
  onUpdateRound,
  onSelectCriteriaSet,
  onUpdateCriterion,
  onUpdateCategoryExperts,
}: AdvancedScoringRoundsProps) {
  const [collapsedRounds, setCollapsedRounds] = useState<number[]>([]);

  const toggleRoundCollapse = (roundId: number) => {
    setCollapsedRounds(prev =>
      prev.includes(roundId) ? prev.filter(id => id !== roundId) : [...prev, roundId]
    );
  };

  return (
    <section className="scroll-mt-24 space-y-4" id="section-rounds">
      <div>
        <h3 className="text-base font-semibold text-slate-900 leading-tight">Quy định vòng thi</h3>
      </div>
      <div className={rounds?.length > 1 ? 'space-y-6' : 'space-y-6'}>
        {rounds?.map((round, rIndex) => {
          const totalWeight = (round.customCriteriaDetatils || []).reduce((acc: number, c: any) => acc + (c.customWeight || 0), 0);
          const weightOk = (round.customCriteriaDetatils || []).length === 0 || totalWeight === 100;
          const selectedSet = criteriaSets?.find(s => s?.criteriaSetId === round?.criteriaSetId);

          return (
            <div key={round.roundId} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
              {/* Round header */}
              <div
                className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/50 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => toggleRoundCollapse(round.roundId)}
              >
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-3">
                  <span className="bg-[#F26F21] text-white rounded-lg w-7 h-7 flex items-center justify-center text-xs font-mono font-bold">
                    {rIndex + 1}
                  </span>
                  {round.roundName || `Round ${rIndex + 1}`}
                </h4>
                <div className="flex items-center gap-2">
                  {rounds.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onRemoveRound(round.roundId); }}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-2 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button type="button" className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100">
                    {collapsedRounds.includes(round.roundId) ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Round body */}
              <AnimatePresence initial={false}>
                {!collapsedRounds.includes(round.roundId) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 md:p-4 space-y-6">
                      {/* Basic round info */}
                      <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Tên vòng thi</label>
                            <input
                              type="text"
                              value={round.roundName}
                              onChange={e => onUpdateRound(round.roundId, { roundName: e.target.value })}
                              placeholder="e.g. Vòng sơ loại"
                              className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Số thứ tự</label>
                            <input
                              type="number"
                              min="1"
                              value={round.orderIndex || ''}
                              onChange={e => onUpdateRound(round.roundId, { orderIndex: e.target.value === '' ? 1 : parseInt(e.target.value) })}
                              placeholder="e.g. 1"
                              className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Quy định thăng vòng</label>
                            <input
                              type="text"
                              value={round.advancementRule || ''}
                              onChange={e => onUpdateRound(round.roundId, { advancementRule: e.target.value })}
                              placeholder="e.g. Top 50% proceed"
                              className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Top N</label>
                            <input
                              type="number"
                              min="0"
                              value={round.topN || ''}
                              onChange={e => onUpdateRound(round.roundId, { topN: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                              placeholder="e.g. 10"
                              className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <EventDateField Icon={Calendar} label="Ngày bắt đầu" value={round.startDate} onChange={e => onUpdateRound(round.roundId, { startDate: e.target.value })} placeholder="Chọn ngày bắt đầu" />
                          <EventDateField Icon={Calendar} label="Ngày kết thúc" value={round.endDate} onChange={e => onUpdateRound(round.roundId, { endDate: e.target.value })} placeholder="Chọn ngày kết thúc" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <EventDateField Icon={Calendar} label="Hạn nộp bài" value={round.submissionDeadline} onChange={e => onUpdateRound(round.roundId, { submissionDeadline: e.target.value })} placeholder="Chọn hạn nộp bài" />
                          <EventDateField Icon={Calendar} label="Hạn chấm" value={round.evaluationDeadline} onChange={e => onUpdateRound(round.roundId, { evaluationDeadline: e.target.value })} placeholder="Chọn hạn chấm" />
                          <EventDateField Icon={Calendar} label="Hạn phúc khảo" value={round.resolveAppealDeadline} onChange={e => onUpdateRound(round.roundId, { resolveAppealDeadline: e.target.value })} placeholder="Chọn hạn phúc khảo" />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Mô tả vòng thi</label>
                          <textarea
                            rows={3}
                            value={round.description}
                            onChange={e => onUpdateRound(round.roundId, { description: e.target.value })}
                            placeholder="Mô tả vòng thi"
                            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                          />
                        </div>
                        <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                          <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                            Quy định nộp bài
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Phương thức nộp bài</label>
                              <CustomSelect
                                options={[
                                  { value: 'FILE', label: 'File Upload Only' },
                                  { value: 'GITHUB_URL', label: 'Github URL Only' },
                                  { value: 'BOTH', label: 'File Upload & Github URL' },
                                ]}
                                value={round.submissionType || 'FILE'}
                                onChange={val => onUpdateRound(round.roundId, { submissionType: val as any })}
                              />
                            </div>

                            {round.submissionType !== 'GITHUB_URL' && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Các file được phép nộp</label>
                                  <FileTypeSelector
                                    selectedTypes={round.allowedFileTypes || []}
                                    onChange={types => onUpdateRound(round.roundId, { allowedFileTypes: types })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Số file được phép nộp</label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={round.maxFileCount || 1}
                                    onChange={e => onUpdateRound(round.roundId, { maxFileCount: parseInt(e.target.value) || 1 })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <div className="bg-linear-to-br from-orange-50 to-blue-50 border border-orange-100/60 rounded-xl p-5 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Tag className="w-16 h-16 text-[#F26F21]" />
                          </div>
                          <div className="flex items-center gap-2 mb-3 relative z-10">
                            <div className="bg-orange-100 p-1.5 rounded-lg">
                              <Tag className="w-4 h-4 text-[#F26F21]" />
                            </div>
                            <h5 className="text-sm font-bold text-orange-900">
                              {round.roundName || `Stage ${rIndex + 1}`} bao gồm các hạng mục:
                            </h5>
                          </div>
                          {round.categoryExperts && round.categoryExperts.length > 0 ? (
                            <ul className="flex flex-col gap-2 mt-2 relative z-10">
                              {round.categoryExperts.map(ce => {
                                const catName = categories[ce.categoryId]?.categoryName;
                                if (!catName) return null;
                                return (
                                  <li key={ce.categoryId} className="flex items-center gap-2 text-sm text-orange-800 font-medium bg-white/60 px-3 py-2 rounded-lg border border-orange-100/50 shadow-sm transition-all hover:bg-white/80">
                                    {catName}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-xs text-orange-500/70 italic relative z-10">Chưa có hạng mục nào được thêm.</p>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono">
                            Giám khảo theo từng hạng mục
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3">
                          Phân công giám khảo đánh giá từng hạng mục trong vòng thi.
                        </p>
                        <CategoryExpertPanel
                          experts={experts}
                          roundId={round.roundId}
                          availableCategories={categories}
                          categoryExperts={round.categoryExperts || []}
                          onChange={onUpdateCategoryExperts}
                        />
                      </div>
                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="w-3.5 h-3.5 text-slate-400" />
                            <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono">
                              Hệ điểm
                            </h5>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${weightOk
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                              : 'bg-amber-50 border-amber-100 text-amber-600'
                              }`}
                          >
                            {(round.customCriteriaDetatils || []).length > 0 ? `${totalWeight}% / 100% ${weightOk ? '✓' : '— must sum to 100%'}` : 'No criteria yet'}
                          </span>
                        </div>

                        {/* Step 1: Choose CriteriaSet */}
                        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <Database className="w-3 h-3" />
                            Step 1 — Chọn bộ tiêu chí đánh giá
                          </label>
                          <p className="text-[11px] text-slate-400">
                            Chọn một bộ tiêu chí, sau đó tùy chỉnh trọng số và mô tả bên dưới.
                          </p>
                          <div className="mt-3 w-full sm:w-2/3 md:w-1/2">
                            <CustomSelect
                              options={[
                                { value: '0', label: '-- Chọn bộ tiêu chí --' },
                                ...criteriaSets.map(cs => ({
                                  value: cs.criteriaSetId.toString(),
                                  label: cs.criteriaSetName
                                }))
                              ]}
                              value={round.criteriaSetId ? round.criteriaSetId.toString() : '0'}
                              onChange={val => {
                                const id = parseInt(val as string);
                                if (id === 0) {
                                  onUpdateRound(round.roundId, { criteriaSetId: 0, customCriteriaDetatils: [] } as any);
                                } else {
                                  onSelectCriteriaSet(round.roundId, id);
                                }
                              }}
                            />
                          </div>
                          {selectedSet && (
                            <p className="text-[10px] text-blue-600 font-medium mt-2">
                              Đã chọn: <strong>{selectedSet.criteriaSetName}</strong> · Điểm tối đa: {selectedSet.maxScore} · {selectedSet.criteriaDetails ? selectedSet.criteriaDetails.length : 0} tiêu chí
                            </p>
                          )}
                        </div>

                        {/* Step 2: Customize criteria details */}
                        {(round.customCriteriaDetatils || []).length > 0 && (
                          <div className="bg-[#fcfdfe] rounded-2xl border border-slate-200 p-4 space-y-3.5 overflow-hidden">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                              Step 2 — Thiết kế lại các tiêu chí đánh giá
                            </p>

                            <div className="overflow-x-auto pb-2">
                              <table className="w-full text-left min-w-160">
                                <thead>
                                  <tr className="text-[10px] font-bold text-slate-400 font-mono border-b border-slate-100 uppercase tracking-wider">
                                    <th className="pb-3 font-bold text-center w-24">Trọng số (%)</th>
                                    <th className="pb-3 font-bold text-center w-36">Thể loại</th>
                                    <th className="pb-3 font-bold px-2 w-[35%]">Tiêu chí đánh giá</th>
                                    <th className="pb-3 font-bold px-2">Mô tả</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                  {(round.customCriteriaDetatils || []).map((crit: CustomCriteriaDetail) => (
                                    <tr key={crit.evaluationCriteriaId} className="group">
                                      <td className="py-2.5 pr-2">
                                        <input
                                          type="number"
                                          min={0}
                                          max={100}
                                          value={crit.customWeight || ''}
                                          onChange={e => {
                                            const w = e.target.value === '' ? 0 : parseInt(e.target.value);
                                            onUpdateCriterion(round.roundId, crit.evaluationCriteriaId, { customWeight: w });
                                          }}
                                          placeholder="0"
                                          className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 text-center font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                        />
                                      </td>
                                      <td className="py-2.5 px-2">
                                        <CustomSelect
                                          options={[
                                            { value: 'SUBMISSION', label: 'SUBMISSION' },
                                            { value: 'PRESENTATION', label: 'PRESENTATION' },
                                          ]}
                                          value={crit.type || 'SUBMISSION'}
                                          onChange={val => onUpdateCriterion(round.roundId, crit.evaluationCriteriaId, { type: val })}
                                          variant="inline"
                                        />
                                      </td>
                                      <td className="py-2.5 px-2">
                                        <input
                                          type="text"
                                          value={crit.criteriaName}
                                          onChange={e => onUpdateCriterion(round.roundId, crit.evaluationCriteriaId, { criteriaName: e.target.value })}
                                          placeholder="Vd: Technical Innovation..."
                                          className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                        />
                                      </td>
                                      <td className="py-2.5 pl-2">
                                        <input
                                          type="text"
                                          value={crit.description}
                                          onChange={e => onUpdateCriterion(round.roundId, crit.evaluationCriteriaId, { description: e.target.value })}
                                          placeholder="Mô tả chi tiết..."
                                          className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {(round.customCriteriaDetatils || []).length === 0 && round.criteriaSetId === 0 && (
                          <p className="text-[11px] text-slate-400 italic">
                            Select a criteria set above, or add criteria manually after selecting a set.
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <div className={rounds?.length > 1 ? "2xl:col-span-2" : ""}>
          <button
            type="button"
            onClick={onAddRound}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-semibold text-xs hover:bg-blue-50/20 hover:text-blue-600 hover:border-blue-400/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 animate-pulse" /> Add Another Round
          </button>
        </div>
      </div>
    </section>
  );
}
