import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// ============================================================
// TODO: Thay thế các interface dưới đây bằng types từ API thật
// ============================================================

export interface EventCoordinatorContextValue {
  // ── Event ──
  event: any;
  setEvent: React.Dispatch<React.SetStateAction<any>>;

  // ── Rounds ──
  rounds: any[];
  setRounds: React.Dispatch<React.SetStateAction<any[]>>;

  // ── Teams ──
  teams: any[];
  setTeams: React.Dispatch<React.SetStateAction<any[]>>;

  // ── Judges ──
  judges: any[];
  setJudges: React.Dispatch<React.SetStateAction<any[]>>;

  // ── Mentors ──
  mentors: any[];
  setMentors: React.Dispatch<React.SetStateAction<any[]>>;

  // ── Announcements ──
  announcements: any[];
  setAnnouncements: React.Dispatch<React.SetStateAction<any[]>>;

  // ── Team Rules ──
  teamRules: any[];
  setTeamRules: React.Dispatch<React.SetStateAction<any[]>>;

  // ── Tracks ──
  tracks: string[];
  setTracks: React.Dispatch<React.SetStateAction<string[]>>;

  // ── Scoring Criteria ──
  scoringCriteria: any[];
  setScoringCriteria: React.Dispatch<React.SetStateAction<any[]>>;

  // ── Modals ──
  isPublishModalOpen: boolean;
  setIsPublishModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAnnouncementModalOpen: boolean;
  setIsAnnouncementModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // ── Quick Announcement ──
  quickTitle: string;
  setQuickTitle: React.Dispatch<React.SetStateAction<string>>;
  quickBody: string;
  setQuickBody: React.Dispatch<React.SetStateAction<string>>;
  quickAudience: 'all' | 'teams' | 'judges';
  setQuickAudience: React.Dispatch<React.SetStateAction<'all' | 'teams' | 'judges'>>;

  // ── Publish Results Log ──
  publishedResultsLog: {
    roundName: string;
    advancementDesc: string;
    advancingTeamsCount: number;
    disqualifiedTeamsExcluded: number;
  } | null;

  // ── Handlers ──
  handleCalculateAndPublishRankings: () => void;
  handleSendQuickAnnouncement: (e: React.FormEvent) => void;
  handleResetStorage: () => void;
}

const EventCoordinatorContext = createContext<EventCoordinatorContextValue | null>(null);

// ============================================================
// Default empty event shape
// TODO: Thay bằng data từ API (useQuery, fetch, v.v.)
// ============================================================
const DEFAULT_EVENT = {
  id: '',
  name: 'HackathonOS',
  description: '',
  totalCap: 300,
  tracks: [] as string[],
  currentRoundId: '',
};

export function EventCoordinatorProvider({ children }: { children: ReactNode }) {
  // ── State ──
  const [event, setEvent] = useState<any>(DEFAULT_EVENT);
  const [rounds, setRounds] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [teamRules, setTeamRules] = useState<any[]>([]);
  const [tracks, setTracks] = useState<string[]>([]);
  const [scoringCriteria, setScoringCriteria] = useState<any[]>([]);

  // ── Modals ──
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  // React.useEffect(() => {
  //   let mounted = true;
  //   import('../../services/event/eventService').then(({ getAllEvent, getEventDetailById }) => {
  //     getAllEvent().then((res: any) => {
  //       if (!mounted) return;
  //       const events = res?.data || res || [];
  //       if (events.length > 0) {
  //         const firstEventId = events[events.length - 1].eventId; // Let's take the most recent or any existing event
  //         getEventDetailById(firstEventId).then((detailRes: any) => {
  //           if (mounted) {
  //             setEvent(detailRes?.data || detailRes || DEFAULT_EVENT);
  //           }
  //         }).catch(console.error);
  //       }
  //     }).catch(console.error);
  //   });
  //   return () => { mounted = false; };
  // }, []);

  // ── Quick Announcement Fields ──
  const [quickTitle, setQuickTitle] = useState('');
  const [quickBody, setQuickBody] = useState('');
  const [quickAudience, setQuickAudience] = useState<'all' | 'teams' | 'judges'>('all');

  // ── Published Results Log ──
  const [publishedResultsLog, setPublishedResultsLog] = useState<{
    roundName: string;
    advancementDesc: string;
    advancingTeamsCount: number;
    disqualifiedTeamsExcluded: number;
  } | null>(null);

  // ── Handlers ──
  const handleCalculateAndPublishRankings = () => {
    // TODO: Gọi API tính toán và publish kết quả xếp hạng
    // Placeholder – hiển thị modal với data rỗng
    const activeRound = rounds.find((r: any) => r.id === event.currentRoundId) || rounds[0];
    if (!activeRound) return;

    setPublishedResultsLog({
      roundName: activeRound.name || 'N/A',
      advancementDesc: activeRound.advancementRule?.description || 'N/A',
      advancingTeamsCount: 0,
      disqualifiedTeamsExcluded: 0,
    });
    setIsPublishModalOpen(true);
  };

  const handleSendQuickAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickBody.trim()) return;

    // TODO: Gọi API gửi thông báo tại đây
    const newAnn = {
      id: `ann-quick-${Date.now()}`,
      title: quickTitle,
      content: quickBody,
      audience: quickAudience,
      createdAt: new Date().toISOString(),
      isSent: true,
    };

    setAnnouncements((prev: any[]) => [newAnn, ...prev]);
    setQuickTitle('');
    setQuickBody('');
    setIsAnnouncementModalOpen(false);
    alert(`📢 Thông báo "${newAnn.title}" đã được gửi!`);
  };

  const handleResetStorage = () => {
    // TODO: Gọi API reset / reload data từ server
    if (confirm('Bạn có chắc muốn reset toàn bộ dữ liệu?')) {
      window.location.reload();
    }
  };

  return (
    <EventCoordinatorContext.Provider
      value={{
        event, setEvent,
        rounds, setRounds,
        teams, setTeams,
        judges, setJudges,
        mentors, setMentors,
        announcements, setAnnouncements,
        teamRules, setTeamRules,
        tracks, setTracks,
        scoringCriteria, setScoringCriteria,
        isPublishModalOpen, setIsPublishModalOpen,
        isAnnouncementModalOpen, setIsAnnouncementModalOpen,
        quickTitle, setQuickTitle,
        quickBody, setQuickBody,
        quickAudience, setQuickAudience,
        publishedResultsLog,
        handleCalculateAndPublishRankings,
        handleSendQuickAnnouncement,
        handleResetStorage,
      }}
    >
      {children}
    </EventCoordinatorContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================
export function useEventCoordinator() {
  const ctx = useContext(EventCoordinatorContext);
  if (!ctx) {
    throw new Error('useEventCoordinator must be used within EventCoordinatorProvider');
  }
  return ctx;
}
