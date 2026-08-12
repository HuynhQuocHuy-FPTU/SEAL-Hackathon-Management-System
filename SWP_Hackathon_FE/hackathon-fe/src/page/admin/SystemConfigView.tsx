import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateSystemConfig } from '../../services/admin/systemConfigService';

type ConfigKey = 'MAX_TEAM_SIZE' | 'MIN_TEAM_SIZE' | 'LOCK_BEFORE_DEADLINE_HOURS' | 'INVITATION_EXPIRE_DAYS';

export default function SystemConfigView() {
  const [selectedKey, setSelectedKey] = useState<ConfigKey>('MAX_TEAM_SIZE');
  const [configValue, setConfigValue] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const configOptions: { label: string; value: ConfigKey; description: string }[] = [
    {
      label: 'Số lượng thành viên tối thiểu',
      value: 'MIN_TEAM_SIZE',
      description: 'Số lượng thành viên tối thiểu cho phép trong một đội.'
    },
    {
      label: 'Giới hạn số lượng thành viên đội',
      value: 'MAX_TEAM_SIZE',
      description: 'Số lượng thành viên tối đa cho phép trong một đội.'
    },
    {
      label: 'Thời gian khóa chỉnh sửa (giờ)',
      value: 'LOCK_BEFORE_DEADLINE_HOURS',
      description: 'Số giờ khóa chức năng chỉnh sửa đội trước hạn chót nộp bài.'
    },
    {
      label: 'Thời gian hiệu lực lời mời (ngày)',
      value: 'INVITATION_EXPIRE_DAYS',
      description: 'Số ngày hiệu lực của lời mời tham gia nhóm.'
    }
  ];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    if (!configValue || isNaN(Number(configValue))) {
      setErrorMessage('Vui lòng nhập một số nguyên hợp lệ.');
      return;
    }

    setIsLoading(true);
    try {
      await updateSystemConfig(selectedKey, parseInt(configValue, 10));
      setSuccessMessage('Cập nhật cấu hình hệ thống thành công.');
      setConfigValue('');
    } catch (error: any) {
      console.error('Update config error:', error);
      const errObj = error.response?.data;
      const backendMsg = errObj?.message || errObj?.error || (errObj ? JSON.stringify(errObj) : 'Lỗi khi cập nhật cấu hình. Vui lòng thử lại.');
      setErrorMessage(backendMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOption = configOptions.find(opt => opt.value === selectedKey);

  return (
    <div className="space-y-6">
      {/* Phần Tiêu đề (Header) */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">Cấu hình hệ thống</h2>
          <p className="text-[#727785] text-sm">Quản lý và điều chỉnh các tham số cấu hình chung của nền tảng.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xxl border border-[#e5e7eb] shadow-sm max-w-3xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5e7eb]">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-on-surface">Cập nhật tham số hệ thống</h3>
            <p className="text-xs text-[#727785]">Lưu ý: Thay đổi sẽ áp dụng ngay lập tức trên toàn hệ thống.</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#424754]">Chọn loại cấu hình (Key)</label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value as ConfigKey)}
                className="px-4 py-3 bg-[#f3f4f5] border border-[#c2c6d6]/60 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {configOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {selectedOption && (
                <p className="text-xs text-[#727785] pl-1 italic">
                  {selectedOption.description}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#424754]">Giá trị mới (Value)</label>
              <input
                type="number"
                value={configValue}
                onChange={(e) => setConfigValue(e.target.value)}
                placeholder="Nhập giá trị (số nguyên)..."
                className="px-4 py-3 bg-[#f3f4f5] border border-[#c2c6d6]/60 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all"
                required
              />
            </div>
          </div>

          {successMessage && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 p-3 border border-green-200 rounded-xl animate-fadeIn">
              <CheckCircle2 size={18} />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 text-sm font-medium text-red-700 bg-red-50 p-3 border border-red-200 rounded-xl animate-fadeIn">
              <AlertCircle size={18} />
              {errorMessage}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#F26F21] hover:brightness-110 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
