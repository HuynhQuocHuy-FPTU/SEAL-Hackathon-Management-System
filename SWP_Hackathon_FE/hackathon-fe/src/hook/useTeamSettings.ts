import { useState, useEffect } from 'react';
import { useNotification } from './useNotification';
import type { TeamJoinResponse } from '../types/team/TeamActive';
import { getTeamRequest, acceptTeamJoinRequest, rejectTeamJoinRequest } from '../services/team/teamActiveListService';

export function useTeamSettings() {
  const { addNotification } = useNotification();

  // State for pending join requests
  const [joinRequests, setJoinRequests] = useState<TeamJoinResponse[]>([]);

  // Active member action menu
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<number | null>(null);

  const fetchJoinRequests = async () => {
    try {
      const data = await getTeamRequest();
      console.log(data)
      setJoinRequests(data);
    } catch (error) {
      console.error("Failed to fetch join requests", error);
    }
  };

  useEffect(() => {
    fetchJoinRequests();
  }, []);

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await acceptTeamJoinRequest(requestId);
      setJoinRequests(prev => prev.filter(req => req.requestId !== requestId));
      addNotification('Success', `Đã đồng ý yêu cầu tham gia!`);
    } catch (error: any) {
      addNotification('Info', error?.response?.data?.message || 'Có lỗi xảy ra khi đồng ý yêu cầu.');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await rejectTeamJoinRequest(requestId);
      setJoinRequests(prev => prev.filter(req => req.requestId !== requestId));
      addNotification('Info', `Đã từ chối yêu cầu tham gia.`);
    } catch (error: any) {
      addNotification('Info', error?.response?.data?.message || 'Có lỗi xảy ra khi từ chối yêu cầu.');
    }
  };

  return {
    joinRequests,
    activeMenuMemberId,
    setActiveMenuMemberId,
    handleAcceptRequest,
    handleRejectRequest,
  };
}
