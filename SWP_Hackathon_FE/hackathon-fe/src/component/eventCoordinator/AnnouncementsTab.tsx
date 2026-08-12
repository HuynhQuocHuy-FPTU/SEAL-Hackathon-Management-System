import React, { useState } from 'react';
import {
  Megaphone,
  Send,
  Users,
  Gavel,
  GraduationCap,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Volume2
} from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
// TODO: Import types từ API types của dự án

interface AnnouncementsTabProps {
  announcements: any[];
  setAnnouncements: React.Dispatch<React.SetStateAction<any[]>>;
  totalTeams: number;
  totalJudges: number;
}

export default function AnnouncementsTab({
  announcements,
  setAnnouncements,
  totalTeams,
  totalJudges,
}: AnnouncementsTabProps) {

  // Creation form toggle state
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAudience, setAnnAudience] = useState<'all' | 'teams' | 'judges' | 'mentors'>('all');

  // Status broadcast confirmation message state
  const [broadcastLog, setBroadcastLog] = useState<string | null>(null);

  // Create or Update announcement
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    if (editingId) {
      // Update Mode
      setAnnouncements(prev => prev.map(ann => {
        if (ann.id === editingId) {
          return {
            ...ann,
            title: annTitle,
            content: annContent,
            audience: annAudience,
          };
        }
        return ann;
      }));
      setEditingId(null);
    } else {
      // Create Mode
      const newAnn: any = {
        id: `ann-${Date.now()}`,
        title: annTitle,
        content: annContent,
        audience: annAudience,
        createdAt: new Date().toISOString(),
        isSent: false, // Default draft, ready to dispatch
      };
      setAnnouncements(prev => [newAnn, ...prev]);
    }

    setIsCreating(false);
    setAnnTitle('');
    setAnnContent('');
    setAnnAudience('all');
  };

  // Dispatch live notification broadcast to participants (Sends announcement)
  const handleSendBroadcast = (id: string) => {
    let targetMsg = '';
    const selectedAnn = announcements.find(a => a.id === id);
    if (!selectedAnn) return;

    if (selectedAnn.audience === 'all') {
      targetMsg = `Phát sóng thành công bản tin tới tất cả ${totalTeams} đội thi, ${totalJudges} cán bộ chấm thi và 112 cố vấn hoạt động!`;
    } else if (selectedAnn.audience === 'teams') {
      targetMsg = `Gửi email thông báo và thông tin đẩy thành công tới toàn bộ ${totalTeams} đội thi trong hệ thống!`;
    } else if (selectedAnn.audience === 'judges') {
      targetMsg = `Gửi cảnh báo tin nhắn tức thời thành công tới ${totalJudges} Giám khảo chuyên môn chấm thi!`;
    } else {
      targetMsg = `Gửi bảng tin hướng dẫn thành công tới tất cả Đội ngũ cố vấn tích hợp!`;
    }

    setAnnouncements(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, isSent: true };
      }
      return a;
    }));

    setBroadcastLog(targetMsg);
    // Auto clear toast after 5 seconds
    setTimeout(() => {
      setBroadcastLog(null);
    }, 5500);
  };

  const startEdit = (ann: any) => {
    setEditingId(ann.id);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setAnnAudience(ann.audience);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-6">

      {/* Upper action card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Phát sóng thông báo</h2>
          <p className="text-xs text-gray-500 mt-1">Phát sóng trực tiếp tới sinh viên, giám khảo và cố vấn. Theo dõi lịch sử giao tiếp.</p>
        </div>

        {!isCreating && (
          <button
            onClick={() => {
              setEditingId(null);
              setAnnTitle('');
              setAnnContent('');
              setAnnAudience('all');
              setIsCreating(true);
            }}
            className="bg-[#F26F21] hover:brightness-110 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm"
            id="btn-trigger-new-announcement"
          >
            Tạo thông báo
          </button>
        )}
      </div>

      {/* Broadcast event logger pop up toast */}
      {broadcastLog && (
        <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-lg flex items-start gap-3 entry-animation">
          <CheckCircle size={20} className="shrink-0 animate-bounce mt-0.5" />
          <div className="text-xs leading-relaxed">
            <h4 className="font-bold">Đã phát sóng thông báo thành công</h4>
            <p className="opacity-95">{broadcastLog}</p>
          </div>
        </div>
      )}

      {/* Announcement Creation Form */}
      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-blue-500 p-6 space-y-4 shadow-md entry-animation">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Megaphone size={16} className="text-blue-500" />
            {editingId ? 'Cập nhật bản tin' : 'Tạo bản tin cần phát sóng'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-600 mb-1">Tiêu đề thông báo</label>
              <input
                type="text" required value={annTitle} onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Kết quả vòng 2 được dời lại thời điểm 20:00 ngày 20/06"
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-xl py-2 px-3.5 text-xs outline-none transition-all"
                id="announcement-title-input"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">Đối tượng nhận tin (Audience)</label>
              <CustomSelect
                options={[
                  { value: 'all', label: 'Tất cả mọi người' },
                  { value: 'teams', label: 'Chỉ các Đội thi' },
                  { value: 'judges', label: 'Chỉ Ban Giám khảo' },
                  { value: 'mentors', label: 'Chỉ các Cố vấn' },
                ]}
                value={annAudience}
                onChange={(val) => setAnnAudience(val as any)}
                placeholder="Chọn đối tượng"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-gray-600 mb-1">Nội dung chi tiết thông báo</label>
              <textarea
                rows={4} required value={annContent} onChange={(e) => setAnnContent(e.target.value)}
                placeholder="Viết nội dung bản tin tại đây..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-xl py-2 px-3.5 text-xs outline-none transition-all resize-none"
                id="announcement-content-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 text-xs">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
              }}
              className="text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-all"
            >
              Hủy viết
            </button>
            <button
              type="submit"
              className="bg-[#F26F21] hover:brightness-110 text-white px-4 py-2 rounded-lg font-bold transition-all"
              id="announcement-save-btn"
            >
              {editingId ? 'Cập nhật bản tin' : 'Lưu bản nháp'}
            </button>
          </div>
        </form>
      )}

      {/* List / History details */}
      <div className="space-y-4">
        {announcements.map((ann) => {
          const audienceBadges = {
            all: { label: 'Tất cả mọi người', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Volume2 },
            teams: { label: 'Chỉ Đội Thi', color: 'bg-green-50 text-green-700 border-green-200', icon: Users },
            judges: { label: 'Chỉ Ban Giám Khảo', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Gavel },
            mentors: { label: 'Chỉ Cố Vấn', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: GraduationCap },
          }[ann.audience as string] ?? { label: 'Unknown', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Volume2 };

          const IconComponent = audienceBadges.icon;

          return (
            <div
              key={ann.id}
              className={`bg-white rounded-2xl border-2 p-5 shadow-sm space-y-3 transition-all ${ann.isSent ? 'border-gray-200' : 'border-amber-400 bg-amber-50/5'
                }`}
            >
              {/* Upper row */}
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${audienceBadges.color}`}>
                    <IconComponent size={11} />
                    {audienceBadges.label}
                  </span>
                  {!ann.isSent && (
                    <span className="text-[10px] bg-amber-400 text-amber-900 border border-amber-500 font-extrabold px-1.5 py-0.5 rounded animate-pulse">
                      Nháp
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => startEdit(ann)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Sửa bản tin"
                    id={`btn-edit-announcement-${ann.id}`}
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
                    title="Xóa"
                    id={`btn-delete-announcement-${ann.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Title & Body */}
              <div>
                <h4 className="font-bold text-gray-900 text-sm leading-snug">{ann.title}</h4>
                <p className="text-xs text-gray-600 font-medium leading-relaxed mt-1.5">{ann.content}</p>
              </div>

              {/* Actions & timestamps bottom info */}
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400">
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock size={11} />
                  {new Date(ann.createdAt).toLocaleString('vi-VN')}
                </span>

                {ann.isSent ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded flex items-center gap-1">
                    <CheckCircle size={12} className="text-emerald-500" />
                    Đã phát sóng mạng lưới (Sent)
                  </span>
                ) : (
                  <button
                    onClick={() => handleSendBroadcast(ann.id)}
                    className="bg-[#F26F21] hover:brightness-110 text-white font-bold text-xs py-1 px-3 rounded-lg transition-all flex items-center gap-1 leading-none"
                    id={`btn-broadcast-${ann.id}`}
                  >
                    <Send size={11} /> Phát sóng ngay
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
