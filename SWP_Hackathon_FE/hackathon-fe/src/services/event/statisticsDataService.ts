import axiosClient from "../../api/axiosClient";
import type { StudentCount } from "../../types/metric/MetricResult";



//THỐNG KÊ TIÊU CHÍ
export const getEventCriteriaStats = async (eventId: number) => {
    const res = await axiosClient.get(`/analytics/events/${eventId}/criteria-stats`);
    return res.data;
}
export const getRoundCriteriaStats = async (roundId: number) => {
    const res = await axiosClient.get(`/analytics/rounds/${roundId}/criteria-stats`);
    return res.data;
}

export const getSubmissionCriteriaStats = async (submissionId: number) => {
    const res = await axiosClient.get(`/analytics/submissions/${submissionId}/criteria-stats`);
    return res.data;
}

export const getEventReliabilityMetrics = async (eventId: number) => {
    const res = await axiosClient.get(`/analytics/events/${eventId}/reliability`);
    return res.data;
}

export const countStudentFPTOrOther = async ():Promise<StudentCount> => {
    const res = await axiosClient.get("/analytics/students/counts");
    return res.data;
}