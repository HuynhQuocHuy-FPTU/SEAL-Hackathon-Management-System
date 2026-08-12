import type { InvitationStatus, TeamActiveResponse, TeamJoinRequest, TeamJoinRequestStatus, TeamJoinResponse } from "../../types/team/TeamActive";
import axiosClient from "../../api/axiosClient";


export const getActiveTeams = async (): Promise<TeamActiveResponse> => {
    const response = await axiosClient.get(`/teams/active`);
    return response.data;
}

export const joinTeam = async (teamId: number, request: TeamJoinRequest) => {
    const response = await axiosClient.post(`/teams/${teamId}/join-requests`, request);
    return response.data;
}

export const getTeamRequest = async (status: InvitationStatus): Promise<TeamJoinResponse[]> => {
    const res = await axiosClient.get("/teams/join-requests", {
        params: {
            status
        }
    });
    return res.data.data;
}

export const acceptTeamJoinRequest = async (requestId: number) => {
    const res = await axiosClient.put(`/teams/join-requests/${requestId}/accept`)
    return res.data;
}

export const rejectTeamJoinRequest = async (requestId: number) => {
    const res = await axiosClient.put(`/teams/join-requests/${requestId}/reject`)
    return res.data;
} 

export const viewRequestJoinTeamStatus = async (): Promise<TeamJoinRequestStatus[]> => {
    const resReqStatus = await axiosClient.get("/teams/join-requests/me");
    return resReqStatus.data;
}