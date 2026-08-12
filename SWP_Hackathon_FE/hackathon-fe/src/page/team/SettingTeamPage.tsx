import { useTeamSettings } from '../../hook/useTeamSettings';
import ActiveMembersCard from '../../component/cards/teamSetting/ActiveMembersCard';
import PendingInvitationsCard from '../../component/cards/teamSetting/PendingInvitationsCard';
import { useTeamContext } from '../../context/TeamContext';
import InviteForm from '../../component/team/setting/InviteForm';
import UpdateTeamNameCard from '../../component/cards/teamSetting/UpdateTeamNameCard';
import SentInvitationsCard from '../../component/cards/teamSetting/SentInvitationsCard';
import LeaveTeamCard from '../../component/cards/teamSetting/LeaveTeamCard';
import { useState } from 'react';
import { useNotification } from '../../hook/useNotification';
import { sendInvitation, updateTeamName, leaveTeam, tranferLeader } from '../../services/team/teamsService';
import { useNavigate } from 'react-router-dom';
import type { TeamRequest } from '../../types/team/TeamRequest';
import { useAuthContext } from '../../hook/useAuthContext';

export default function SettingTeamPage() {
  const { teamDetail, isLoading, refreshTeamData } = useTeamContext();
  const {
    activeMenuMemberId,
    setActiveMenuMemberId,
    handleAcceptRequest,
    handleRejectRequest,
  } = useTeamSettings();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingTeamName, setIsUpdatingTeamName] = useState(false);
  const [isLeavingTeam, setIsLeavingTeam] = useState(false);

  const { user } = useAuthContext();
  const isLeader = teamDetail?.leader?.email === user?.email;

  if (isLoading) {
    return <div className="animate-pulse space-y-8">Đang tải cài đặt nhóm...</div>;
  }
  const handleSendInvite = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const emails = emailInput.split(/[\s,]+/).filter(email => email.trim() !== '');

    if (emails.length === 0) {
      addNotification("Info", "Vui lòng nhập ít nhất một địa chỉ email");
      return;
    }

    if (!teamDetail?.teamId) {
      addNotification("Info", "Thiếu ID nhóm. Không thể gửi lời mời.");
      return;
    }

    try {
      setIsSending(true);
      await sendInvitation(teamDetail.teamId, emails);
      addNotification("Success", "Gửi lời mời thành công!");
      setEmailInput('');
      if (refreshTeamData) {
        await refreshTeamData();
      }
    } catch (error: any) {
      addNotification("Info", error.response?.data?.message || "Gửi lời mời thất bại")
    } finally {
      setIsSending(false);
    }
  }

  const handleUpdateTeamName = async (newName: string) => {
    try {
      setIsUpdatingTeamName(true);
      await updateTeamName(newName);
      addNotification("Success", "Cập nhật tên nhóm thành công!");
      if (refreshTeamData) {
        refreshTeamData();
      }
    } catch (error: any) {
      addNotification("Info", error.response?.data?.message || "Cập nhật tên nhóm thất bại");
    } finally {
      setIsUpdatingTeamName(false);
    }
  }

  const handleLeaveTeam = async () => {
    if (!teamDetail?.teamId) return;
    try {
      setIsLeavingTeam(true);
      await leaveTeam(teamDetail.teamId);
      addNotification("Success", "Bạn đã rời khỏi nhóm.");
      if (refreshTeamData) {
        await refreshTeamData();
      }
      navigate('/');
    } catch (error: any) {
      addNotification("Info", error.response?.data?.message || "Rời nhóm thất bại.");
    } finally {
      setIsLeavingTeam(false);
    }
  }

  const onUpdateRole = async (teamRequest: TeamRequest) => {
    try {
      if (!teamDetail?.teamId) return;
      await tranferLeader(teamDetail.teamId, teamRequest);
      addNotification("Success", "Đã gửi yêu cầu đổi trưởng nhóm!");
      if (refreshTeamData) {
        refreshTeamData();
      }
    } catch (error: any) {
      addNotification("Info", error.response?.data?.message || "Gửi yêu cầu đổi trưởng nhóm thất bại.");
    }
  }
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <ActiveMembersCard
            members={teamDetail ? [teamDetail.leader, ...(teamDetail.members || [])].filter(Boolean) : []}
            activeMenuMemberId={activeMenuMemberId}
            onSetActiveMenuMemberId={setActiveMenuMemberId}
            onUpdateRole={onUpdateRole}
          />
          {isLeader && teamDetail && (
            <PendingInvitationsCard
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
            />
          )}
          {isLeader && teamDetail && (
            <SentInvitationsCard invitations={teamDetail.invitations} />
          )}
        </div>
        <div className="lg:col-span-5 flex flex-col gap-6">
          {isLeader && teamDetail && (
            <UpdateTeamNameCard
              currentTeamName={teamDetail.teamName}
              isUpdating={isUpdatingTeamName}
              onUpdateTeamName={handleUpdateTeamName}
            />
          )}
          {isLeader && (
            <InviteForm
              emailInput={emailInput}
              isSending={isSending}
              onChange={(e) => setEmailInput(e.target.value)}
              onSubmit={handleSendInvite}
            />
          )}
          <LeaveTeamCard
            isLeaving={isLeavingTeam}
            onLeaveTeam={handleLeaveTeam}
          />
        </div>
      </div>
    </div>
  );
}
