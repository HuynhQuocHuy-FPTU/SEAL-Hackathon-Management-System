import axiosClient from '../../api/axiosClient'
import { API_ENDPOINTS } from '../../api'

export const getTeamRequests = async () => {
    try {
        const response = await axiosClient.get(API_ENDPOINTS.TEAMS.TEAM_REQUEST);
        return response.data;
    } catch (error) {
        console.error('Error fetching team requests:', error);
        throw error;
    }
};

export const getTeamRequestsByExpertId = async (expertId: string) => {
    try {
        const url = `${API_ENDPOINTS.TEAMS.TEAM_REQUEST_BY_EXPERT_ID}?expertId=${expertId}`;
        const response = await axiosClient.get(url);
        // Ensure the response is an array to prevent mapping errors if MockAPI returns a single object
        return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
        console.error('Error fetching team requests by expert:', error);
        throw error;
    }
};

export const acceptTeamRequest = async (requestId: string, currentData: any) => {
    try {
        const response = await axiosClient.put(API_ENDPOINTS.TEAMS.TEAM_REQUEST + '/' + requestId, {
            ...currentData,
            status: 'accepted'
        });
        return response.data;
    } catch (error) {
        console.error('Error accepting team request:', error);
        throw error;
    }
};

export const declineTeamRequest = async (requestId: string) => {
    try {
        const response = await axiosClient.put(API_ENDPOINTS.TEAMS.TEAM_REQUEST + '/' + requestId, {
            status: 'declined'
        });
        return response.data;
    } catch (error) {
        console.error('Error declining team request:', error);
        throw error;
    }
};

// update expert response
export const expertResponse = async (requestId: string, response: string) => {
    try {
        const res = await axiosClient.put(API_ENDPOINTS.TEAMS.TEAM_REQUEST + '/' + requestId, {
            response
        });
        return res.data;
    } catch (error) {
        console.error('Error updating expert response:', error);
        throw error;
    }
};

// get team detail - fetch all records then filter by teamId
export const getTeamDetail = async (teamId: number) => {
    try {
        // Use base endpoint without path param, filter by query param
        const baseUrl = API_ENDPOINTS.TEAMS.TEAM_DETAIL.replace('/${teamId}', '');
        const response = await axiosClient.get(baseUrl + '?teamId=' + teamId);
        const data = response.data;
        // Filter on client side to ensure only the correct teamId's members are returned
        const arr = Array.isArray(data) ? data : [data];
        return arr.filter((item: any) => String(item.teamId) === String(teamId));
    } catch (error) {
        console.error('Error fetching team detail:', error);
        throw error;
    }
};