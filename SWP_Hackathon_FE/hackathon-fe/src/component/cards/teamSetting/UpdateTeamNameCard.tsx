import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Check, Loader2 } from 'lucide-react';

interface UpdateTeamNameCardProps {
  currentTeamName: string;
  isUpdating?: boolean;
  onUpdateTeamName: (newName: string) => Promise<void>;
}

export default function UpdateTeamNameCard({
  currentTeamName,
  isUpdating = false,
  onUpdateTeamName,
}: UpdateTeamNameCardProps) {
  const [teamName, setTeamName] = useState(currentTeamName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim() === currentTeamName.trim()) {
      return;
    }
    await onUpdateTeamName(teamName);
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-outline-variant/60 p-6 md:p-8 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-br from-orange-500 to-pink-500"></div>

      <h2 className="text-xl font-semibold text-brand-on-surface mb-1.5 flex items-center gap-2">
        <Users className="w-5 h-5 text-brand-secondary" />
        Hồ sơ nhóm
      </h2>
      <p className="text-xs text-brand-on-surface-variant/90 mb-6">
        Cập nhật tên nhóm của bạn. Tên này sẽ hiển thị với mọi người trong sự kiện.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-brand-on-surface-variant/80 mb-1.5 ml-1" htmlFor="teamName">
            Tên nhóm
          </label>
          <div className="relative">
            <input
              id="teamName"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={isUpdating}
              placeholder="Nhập tên nhóm của bạn"
              className="w-full bg-white border border-brand-outline-variant/70 text-brand-on-surface text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-outline-variant/80 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        <motion.button
          whileTap={!isUpdating && teamName.trim() !== currentTeamName.trim() ? { scale: 0.98 } : undefined}
          type="submit"
          disabled={isUpdating || teamName.trim() === currentTeamName.trim() || teamName.trim() === ''}
          className={`mt-2 w-full bg-linear-to-br from-orange-500 to-pink-500 text-white font-semibold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
            isUpdating || teamName.trim() === currentTeamName.trim() || teamName.trim() === ''
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:shadow-lg cursor-pointer hover:bg-linear-to-br from-orange-500 to-pink-500/90'
          }`}
        >
          {isUpdating ? (
            <>
              Đang cập nhật...
              <Loader2 className="w-4 h-4 animate-spin" />
            </>
          ) : (
            <>
              Lưu thay đổi
              <Check className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
