import React from 'react';
import { motion } from 'motion/react';
import { UserPlus, Mail, Check, Loader2 } from 'lucide-react';

interface InviteFormProps {
  emailInput: string;
  isSending?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function InviteForm({
  emailInput,
  isSending = false,
  onChange,
  onSubmit,
}: InviteFormProps) {
  return (
    <div className="bg-white rounded-3xl border border-brand-outline-variant/60 p-6 md:p-8 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-primary to-brand-secondary"></div>

      <h2 className="text-xl font-semibold text-brand-on-surface mb-1.5 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-brand-secondary" />
        Mời thành viên
      </h2>
      <p className="text-xs text-brand-on-surface-variant/90 mb-6">
        Gửi lời mời qua email cho các đồng đội mới. Có thể mời nhiều người bằng cách phân tách các email bằng dấu phẩy.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-brand-on-surface-variant/80 mb-1.5 ml-1" htmlFor="email">
            Địa chỉ email
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-outline-variant text-[20px]">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="email"
              type="text"
              value={emailInput}
              onChange={onChange}
              disabled={isSending}
              placeholder="user1@domain.com, user2@domain.com"
              className="w-full bg-white border border-brand-outline-variant/70 text-brand-on-surface text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-outline-variant/80 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        <motion.button
          whileTap={!isSending ? { scale: 0.98 } : undefined}
          type="submit"
          disabled={isSending}
          className={`mt-2 w-full bg-linear-to-br from-orange-500 to-pink-500 text-white font-semibold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
            isSending ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer hover:brightness-105'
          }`}
        >
          {isSending ? (
            <>
              Đang gửi...
              <Loader2 className="w-4 h-4 animate-spin" />
            </>
          ) : (
            <>
              Gửi lời mời
              <Check className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
