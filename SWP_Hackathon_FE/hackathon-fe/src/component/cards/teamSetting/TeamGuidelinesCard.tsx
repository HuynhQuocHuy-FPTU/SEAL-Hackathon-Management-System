import { AlertCircle } from 'lucide-react';

export default function TeamGuidelinesCard() {
  return (
    <div className="p-5 border border-dashed border-orange-200 bg-orange-50/45 rounded-[20px] flex items-start gap-3">
      <AlertCircle className="w-4.5 h-4.5 text-brand-secondary shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-brand-secondary">Hướng dẫn nhóm</h4>
        <p className="text-[11px] text-brand-on-surface-variant/90 leading-normal">
          Để mời hơn 6 thành viên, dự án của bạn cần được Mentor phê duyệt. Tối đa một nhóm có thể chứa 8 thành viên.
        </p>
      </div>
    </div>
  );
}
