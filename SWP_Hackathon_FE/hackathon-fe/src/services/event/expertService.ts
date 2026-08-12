import axiosClientTest from '../api/mokupAxios'
import { API_ENDPOINTS } from '../api'

export const getExpertScheduleById = async (expertId: string) => {
    try {
        // use query param ?expertId=
        const response = await axiosClientTest.get(API_ENDPOINTS.SCHEDULE.EXPERT_SCHEDULE.replace('/${expertId}', '') + '?expertId=' + expertId);
        return response.data;
    } catch (error) {
        console.error('Error fetching expert schedule:', error);
        throw error;
    }
};

export const createExpertSchedule = async (scheduleData: any) => {
    try {
        const url = API_ENDPOINTS.SCHEDULE.EXPERT_SCHEDULE.replace('/${expertId}', '');
        const response = await axiosClientTest.post(url, scheduleData);
        return response.data;
    } catch (error) {
        console.error('Error creating expert schedule:', error);
        throw error;
    }
};

export const getRoundByExpertId = async (expertId: string) => {
    try {
        // use query param ?expertId=
        const url = API_ENDPOINTS.ROUNDS.ROUND_BY_EXPERT_ID.replace(/\/[^/]+$/, '') + '?expertId=' + expertId;
        const response = await axiosClientTest.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching round expert:', error);
        throw error;
    }
};

export const getEventByExpertId = async (expertId: string) => {
    try {
        // Fetch all events since the mockAPI event doesn't contain expertId to filter by
        const url = API_ENDPOINTS.EVENTS.EVENT_BY_EXPERT_ID.replace(/\/[^/]+$/, '');
        const response = await axiosClientTest.get(url);
        return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
        console.error('Error fetching event expert:', error);
        throw error;
    }
};

// get team info by expert id
export const getTeamInfoByExpertId = async (expertId: string) => {
    try {
        const url = API_ENDPOINTS.TEAMS.TEAM_INFO_BY_EXPERT.replace('/${expertId}', '') + '?expertId=' + expertId;
        const response = await axiosClientTest.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching team info by expert:', error);
        throw error;
    }
}