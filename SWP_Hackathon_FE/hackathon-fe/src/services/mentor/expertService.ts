
import axiosClient from '../../api/axiosClient'



// get team info by expert id (real BE API)
export const getTeamInfoByExpertId = async (eventId: number) => {
    const response = await axiosClient.get(`/teams/expert/my-member/${eventId}`);
    return response.data.data;
};

// get team detail by team id (real BE API)
export const getTeamDetailByTeamId = async (teamId: number) => {
    const response = await axiosClient.get(`/teams/expert/detail/${teamId}`);
    return response.data;
};

// accept team request
export const acceptTeamRequest = async (requestId: number, responseMessage: string) => {
    const response = await axiosClient.patch(`/team-request/${requestId}/accept`, null, { params: { responseMessage } });
    return response.data;
};

// decline team request
export const declineTeamRequest = async (requestId: number, responseMessage: string) => {
    const response = await axiosClient.patch(`/team-request/${requestId}/reject`, null, { params: { responseMessage } });
    return response.data;
};

// get received team request by expert id
export const getReceivedTeamRequestByExpertId = async (roundId: number) => {
    const response = await axiosClient.get(`/team-request/received/${roundId}`);
    return response.data;
};

// get category by event id
export const getCategoryByEventId = async (eventId: number) => {
    try {
        const response = await axiosClient.get(`/expert/mentor/assigncategory-round/${eventId}`);
        return response.data.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            console.error("BACKEND ERROR TRACE:", error.response.data);
        }
        throw error;
    }
};

// get history by account id
export const getHistoryByAccountId = async (accountId: number) => {
    const response = await axiosClient.get(`/historty/expert/${accountId}`);
    return response.data.data.histories;
};
