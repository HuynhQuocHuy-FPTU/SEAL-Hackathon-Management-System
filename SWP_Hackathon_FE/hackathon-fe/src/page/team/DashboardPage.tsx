import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import NoCompetition from '../../component/team/dashboard/NoCompetition'
import HasCompetition from '../../component/team/dashboard/HasCompetition'
import { useTeamContext } from '../../context/TeamContext';
import { getCurrentRound, getSubmissionByRoundId } from '../../services/team/teamsService';
import type { CurrentTeamStatus } from '../../types/team/TeamStatus';
import type { SubmissionResponse } from '../../types/submission/Submission';


export default function DashboardView() {
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [fullRoundData, setFullRoundData] = useState<CurrentTeamStatus>(null);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(0);
  const [submissionsList, setSubmissionsList] = useState<SubmissionResponse[]>([]);
  const { teamDetail, isLoading } = useTeamContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roundRes = await getCurrentRound();
        if (roundRes.data !== null && roundRes.data.rounds?.length > 0) {
          setFullRoundData(roundRes.data);
          let activeIndex = roundRes.data.rounds.findIndex((r: any) => r.roundStatus !== 'COMPLETED');
          if (activeIndex === -1) activeIndex = roundRes.data.rounds.length - 1;
          setSelectedRoundIndex(activeIndex);
          setHasJoined(true);
        } else {
          setFullRoundData(null);
          setHasJoined(false);
        }
      } catch (error: any) {
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (fullRoundData && fullRoundData.rounds && fullRoundData.rounds[selectedRoundIndex]) {
        try {
          const activeRound = fullRoundData.rounds[selectedRoundIndex];
          const submissionRes = await getSubmissionByRoundId(activeRound.roundId);
          setSubmissionsList(submissionRes.data);
        } catch (error) {
          setSubmissionsList([]);
        }
      }
    };
    fetchSubmissions();
  }, [fullRoundData, selectedRoundIndex]);

  if (isLoading) {
    return <div className="animate-pulse space-y-6">Đang tải trang tổng quan nhóm...</div>;
  }

  if (!teamDetail) {
    return <div>Không có dữ liệu nhóm.</div>;
  }

  const currentRoundProps = fullRoundData ? {
    ...fullRoundData,
    rounds: [fullRoundData.rounds[selectedRoundIndex]]
  } : null;

  return (
    <div className="space-y-6 animate-fade-in relative min-h-150">
      {hasJoined && fullRoundData?.rounds && fullRoundData.rounds.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {fullRoundData.rounds.map((round: any, index: number) => (
                  <button
                      key={round.roundId}
                      onClick={() => setSelectedRoundIndex(index)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
                          selectedRoundIndex === index 
                          ? 'bg-[#F26F21] text-white shadow-md border-[#F26F21]' 
                          : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                      }`}
                  >
                      {round.roundName}
                  </button>
              ))}
          </div>
      )}

      <AnimatePresence mode="wait">
        {!hasJoined ? (
          <NoCompetition
            teamDetail={teamDetail}
            teamName={teamDetail.teamName}
            members={teamDetail ? [teamDetail.leader, ...(teamDetail.members || [])].filter(Boolean) : []}
            slot={teamDetail.sizeTeam}
          />
        ) : (
          currentRoundProps && <HasCompetition
            key={currentRoundProps.rounds[0].roundId}
            status={currentRoundProps}
            submissions={submissionsList}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

