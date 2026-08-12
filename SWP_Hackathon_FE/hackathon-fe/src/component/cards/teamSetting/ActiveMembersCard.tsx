import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, MoreVertical, Crown, GraduationCap, Mail } from 'lucide-react';
import type { Member } from '../../../types/team/TeamDetail';
import MemberActionMenu from '../../team/setting/MemberActionMenu';
import Avatar from '../../ui/Avatar';
import type { TeamRequest } from '../../../types/team/TeamRequest';

interface ActiveMembersCardProps {
  members: Member[];
  activeMenuMemberId: number | null;
  onSetActiveMenuMemberId: (id: number | null) => void;
  onUpdateRole: (teamRequest: TeamRequest) => void;
}

export default function ActiveMembersCard({
  members,
  activeMenuMemberId,
  onSetActiveMenuMemberId,
  onUpdateRole,
}: ActiveMembersCardProps) {
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-4xl border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 flex justify-between items-end mb-8 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50/80 rounded-2xl text-brand-primary shadow-sm border border-blue-100/50">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            Thành viên nhóm
          </h2>
          <p className="text-sm text-slate-500 mt-2 ml-1 font-medium">
            Quản lý danh sách và vai trò trong nhóm
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2.5 bg-slate-50/80 border border-slate-200/60 px-3.5 py-2 rounded-xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {members.length} Thành viên
          </span>
        </div>
      </div>

      <div className="space-y-3.5 relative z-10">
        <AnimatePresence>
          {members.map((member, index) => (
            <motion.div
              key={member.studentCode}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, ease: "easeOut", duration: 0.3 }}
              className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/5 transition-all duration-300 relative"
            >
              {/* Leader glow effect */}
              {member.leader && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-amber-400 to-orange-500 rounded-l-2xl" />
              )}

              <div className="flex items-center gap-5 pl-2">
                <div className="relative">
                  <Avatar
                    src={member.avatarUrl}
                    name={member.fullName}
                    className={`w-12 h-12 rounded-full object-cover shadow-sm text-sm ${member.leader ? 'ring-2 ring-amber-400 ring-offset-2' : 'border border-slate-200'
                      }`}
                  />
                  {member.leader && (
                    <div className="absolute -bottom-1.5 -right-1.5 bg-linear-to-br from-amber-400 to-orange-500 text-white p-1 rounded-full shadow-md border-2 border-white">
                      <Crown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <p className="font-extrabold text-[15px] text-slate-800 tracking-tight">
                      {member.fullName}
                    </p>
                    {member.leader && (
                      <span className="px-2.5 py-0.5 rounded-md bg-linear-to-r from-amber-100 to-orange-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-200/50 shadow-sm">
                        Trưởng nhóm
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.email}</span>
                    </div>
                    {member.major && (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.major}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!member.leader ? (
                  <span className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-bold tracking-wide uppercase border border-slate-200/60 shadow-sm">
                    Thành viên
                  </span>
                ) : null}

                {!member.leader && (
                  <div className="relative">
                    <button
                      onClick={() => onSetActiveMenuMemberId(activeMenuMemberId === member.studentCode ? null : member.studentCode)}
                      className="p-2 rounded-xl text-slate-400 hover:text-brand-primary hover:bg-blue-50 transition-all duration-200"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                      {activeMenuMemberId === member.studentCode && (
                        <div className="absolute right-0 top-full mt-2 z-50">
                          <MemberActionMenu
                            member={member}
                            onClose={() => onSetActiveMenuMemberId(null)}
                            onUpdateRole={onUpdateRole}
                          />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
