import React, { useState, useEffect } from 'react';
import { createCriteriaSet, updateCriteriaSet } from '../../../services/event/criteriaService';
import type { Criteria, CriteriaDetail } from '../../../types/criteria/Criteria';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface CriteriaFormProps {
    initialData: any;
    onSuccess: () => void;
}

export default function CriteriaForm({ initialData, onSuccess }: CriteriaFormProps) {
    const [criteriaSetName, setCriteriaSetName] = useState('');
    const [maxScore, setMaxScore] = useState<number | ''>('');
    const [criteriaDetails, setCriteriaDetails] = useState<CriteriaDetail[]>([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (initialData) {
            setCriteriaSetName(initialData.criteriaSetName || '');
            setMaxScore(initialData.maxScore || '');
            setCriteriaDetails(initialData.criteriaDetails || []);
            setMessage(null);
        } else {
            setCriteriaSetName('');
            setMaxScore('');
            setCriteriaDetails([]);
            setMessage(null);
        }
    }, [initialData]);

    const handleAddDetail = () => {
        setCriteriaDetails([
            ...criteriaDetails,
            {
                criteriaId: 0,
                criteriaName: '',
                weight: 0,
                type: 'SUBMISSION',
                description: ''
            }
        ]);
    };

    const handleRemoveDetail = (index: number) => {
        const newDetails = [...criteriaDetails];
        newDetails.splice(index, 1);
        setCriteriaDetails(newDetails);
    };

    const handleDetailChange = (index: number, field: keyof CriteriaDetail, value: any) => {
        const newDetails = [...criteriaDetails];
        newDetails[index] = { ...newDetails[index], [field]: value };
        setCriteriaDetails(newDetails);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!criteriaSetName || !maxScore) {
            setMessage({ type: 'error', text: 'Please fill in all required fields' });
            return;
        }

        const totalWeight = criteriaDetails.reduce((sum, detail) => sum + Number(detail.weight || 0), 0);
        if (totalWeight !== 100) {
            setMessage({ type: 'error', text: `Tổng trọng số (weight) phải bằng chính xác 100. Hiện tại đang là ${totalWeight}.` });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const payload: Criteria = {
                criteriaSetName,
                maxScore: Number(maxScore),
                criteriaDetails
            };

            if (initialData && (initialData.criteriaSetId || initialData.id)) {
                payload.criteriaSetId = initialData.criteriaSetId || initialData.id;
                await updateCriteriaSet(payload);
                setMessage({ type: 'success', text: 'Criteria set updated successfully!' });
            } else {
                await createCriteriaSet(payload);
                setMessage({ type: 'success', text: 'Criteria set created successfully!' });
            }

            setTimeout(() => {
                onSuccess();
                if (!initialData) {
                    setCriteriaSetName('');
                    setMaxScore('');
                    setCriteriaDetails([]);
                }
                setLoading(false);
            }, 1500);
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to save criteria' });
            setLoading(false);
        }
    };

    return (
        <div>
            {message && (
                <div className={`p-4 mb-6 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tên bộ tiêu chí <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            value={criteriaSetName}
                            onChange={(e) => setCriteriaSetName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                            placeholder="e.g. Final Presentation Scoring"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hệ điểm <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={maxScore}
                            onChange={(e) => setMaxScore(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                            placeholder="e.g. 100"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-lg font-bold text-gray-800">Chi tiết bộ tiêu chí</label>
                        <div className="flex items-center gap-4">
                            <span className={`text-sm font-semibold ${criteriaDetails.reduce((sum, d) => sum + Number(d.weight || 0), 0) === 100
                                ? 'text-green-600'
                                : 'text-amber-600'
                                }`}>
                                Tổng trọng số: {criteriaDetails.reduce((sum, d) => sum + Number(d.weight || 0), 0)}/100%
                            </span>
                            <button
                                type="button"
                                onClick={handleAddDetail}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 rounded-lg font-medium transition-colors text-sm cursor-pointer"
                            >
                                <Plus size={16} /> Thêm tiêu chí
                            </button>
                        </div>
                    </div>

                    {criteriaDetails.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 mb-2">Vẫn chưa có thông tin về chi tiết bộ tiêu chí.</p>
                            <p className="text-sm text-gray-400">Nhấn "Thêm chi tiết" để bắt đầu định nghĩa các tiêu chí chấm điểm.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {criteriaDetails.map((detail, index) => (
                                <div key={index} className="p-6 bg-gray-50 border border-gray-100 rounded-xl relative group">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveDetail(index)}
                                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Remove Detail"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Tên chi tiết tiêu chí</label>
                                            <input
                                                type="text"
                                                required
                                                value={detail.criteriaName}
                                                onChange={(e) => handleDetailChange(index, 'criteriaName', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-primary text-sm outline-none"
                                                placeholder="e.g. Innovation"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Trọng số</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    value={detail.weight}
                                                    onChange={(e) => handleDetailChange(index, 'weight', Number(e.target.value))}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-primary text-sm outline-none"
                                                    placeholder="Weight"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Loại</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={detail.type}
                                                    onChange={(e) => handleDetailChange(index, 'type', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-primary text-sm outline-none"
                                                    placeholder="e.g. NORMAL"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả</label>
                                        <textarea
                                            required
                                            value={detail.description}
                                            onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-primary text-sm outline-none resize-none"
                                            placeholder="Describe what this criteria evaluates..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || criteriaDetails.length === 0}
                        className="flex items-center gap-2 bg-linear-to-br from-orange-500 to-pink-400 animate-pulse text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_12px_rgba(0,88,190,0.2)] hover:shadow-[0_4px_20px_rgba(0,88,190,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {loading ? 'Đang lưu...' : (initialData ? 'Cập nhật bộ tiêu chí' : 'Lưu bộ tiêu chí')}
                    </button>
                </div>
            </form>
        </div>
    );
}
