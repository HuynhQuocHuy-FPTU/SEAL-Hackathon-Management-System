import axiosClient from "../../api/axiosClient";
import type { ProcessRequest } from "../../types/team/TeamRequest";

export const getAppealRequest = async (roundId: number) => {
    const res = await axiosClient.get(`/appeal/${roundId}`);
    return res.data;
}

export const getAllRequestsForEvent = async (eventId: number) => {
    const res = await axiosClient.get(`/team-request/event/${eventId}`);
    return res.data;
}

export const processRequest = async (requestId: number, processTeamRequest: ProcessRequest) => {
    const res = await axiosClient.patch(`/team-request/${requestId}/process`, processTeamRequest);
    return res.data;
}