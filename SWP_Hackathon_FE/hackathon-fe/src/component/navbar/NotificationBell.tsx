import React, { useState, useEffect, useRef } from 'react';
import { Bell, Loader2, Check, CheckCircle2, MessageSquare } from 'lucide-react';
import { getNotificationUnRead, getRead, responseNotification } from '../../services/notification/notificationService';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentRound } from '../../services/team/teamsService';
import type { CurrentTeamStatus } from '../../types/team/TeamStatus';

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  if (seconds < 10) return "just now";
  return Math.floor(seconds) + "s ago";
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentUserStatus, setCurrentUserStatus] = useState<CurrentTeamStatus>(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotificationUnRead();
      const data = res?.data || res || [];
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (error: any) {
      console.error("Failed to fetch notifications", error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await getCurrentRound();
        setCurrentUserStatus(currentUser.data);
      } catch (error: any) {
      }
    }
    fetchCurrentUser();
  }, []);

  const handleMarkAsRead = async (notifyId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await getRead(notifyId);
      setNotifications(prev => prev.filter(n => (n.id || n.notificationId) !== notifyId));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const unreadIds = notifications.map(n => n.id || n.notificationId);
    setNotifications([]);
    for (const id of unreadIds) {
      try {
        await getRead(id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleResponse = async (notifyId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!replyMessage.trim()) return;
    try {
      await responseNotification(notifyId, {
        message: replyMessage,
        roundId: currentUserStatus?.rounds?.at(-1).roundId
      });
      setReplyingTo(null);
      setReplyMessage("");
      await getRead(notifyId);
      setNotifications(prev => prev.filter(n => (n.id || n.notificationId) !== notifyId));
    } catch (error) {
      console.error("Failed to response notification", error);
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 focus:outline-none cursor-pointer group"
      >
        <Bell size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-12' : 'group-hover:rotate-12'} ${unreadCount > 0 ? "text-slate-800" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F26F21] rounded-full border border-white shadow-sm ring-2 ring-blue-600/20"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 w-80 sm:w-102 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between bg-slate-50/50 backdrop-blur-md border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-112 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                  <span className="text-sm">Loading notifications...</span>
                </div>
              ) : unreadCount === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">You're all caught up</h4>
                  <p className="text-xs text-slate-500 max-w-50">There are no new notifications for you right now.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif, idx) => {
                    const id = notif.id || notif.notificationId;
                    const dateStr = notif.createdAt || notif.time;
                    return (
                      <div
                        key={id || idx}
                        className="relative p-4 border-b border-slate-100/50 hover:bg-slate-50/80 transition-colors flex flex-col gap-2 cursor-pointer group"
                        onClick={(e) => {
                          if (!notif.allowResponse) {
                            handleMarkAsRead(id, e);
                          }
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar / Icon */}
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50 text-blue-600">
                            <MessageSquare size={18} />
                          </div>

                          {/* Text Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm text-slate-800 font-medium leading-snug wrap-break-word">
                              {notif.message || notif.title || notif.content || "New notification received"}
                            </p>
                            {dateStr && (
                              <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                                {timeAgo(dateStr)}
                              </p>
                            )}
                          </div>

                          {/* Unread dot & Action */}
                          <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#F26F21] shadow-sm shadow-blue-200"></div>
                            {!notif.allowResponse && (
                              <button
                                onClick={(e) => handleMarkAsRead(id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all cursor-pointer transform scale-90 group-hover:scale-100"
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {notif.allowResponse && (
                          <div className="w-full mt-1 pl-14 pr-2 pb-1">
                            {replyingTo === id ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                  placeholder="Gõ phản hồi của bạn..."
                                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleResponse(id, e as any);
                                    }
                                  }}
                                />
                                <button
                                  onClick={(e) => handleResponse(id, e)}
                                  className="bg-[#F26F21] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:brightness-110 transition-colors"
                                >
                                  Gửi
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setReplyingTo(null); }}
                                  className="text-slate-500 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Huỷ
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setReplyingTo(id); setReplyMessage(""); }}
                                  className="text-xs bg-blue-50 text-blue-600 font-medium px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                  Trả lời
                                </button>
                                <button
                                  onClick={(e) => handleMarkAsRead(id, e)}
                                  className="text-xs border border-slate-200 text-slate-600 font-medium px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
                                >
                                  Đã đọc
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer w-full py-1">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
