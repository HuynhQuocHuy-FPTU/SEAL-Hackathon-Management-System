import axiosClient from '../../api/axiosClient'
import type { RankingResponse } from '../../types/judge/Ranking';
import type { SubmissionResponse, CategoryRoundResponse, EventResponse, RoundResponse, EvaluationResponse } from '../../types/judge/Submission';
import type { EvaluationDetailResponse } from '../../types/judge/EvaluationResponse';
import type { CriteriaResponse } from '../../types/judge/Criteria';

// get round ranking by round id
export const getRoundRanking = async (roundId: number): Promise<RankingResponse> => {
    const response = await axiosClient.get(`/ranking/rounds/${roundId}/all`);
    return response.data;
};

// get assigned categories for a round
export const getAssignedCategories = async (roundId: number): Promise<CategoryRoundResponse> => {
    const response = await axiosClient.get(`/expert/assigments/rounds/${roundId}/categories`);
    return response.data;
};

// get assigned events for an expert
export const getAssignedEvents = async (): Promise<EventResponse> => {
    const response = await axiosClient.get(`/expert/assigments/events`);
    return response.data;
};

// get assigned rounds for an event
export const getAssignedRounds = async (eventId: number): Promise<RoundResponse> => {
    const response = await axiosClient.get(`/expert/assigments/events/${eventId}/rounds`);
    return response.data;
};

// get assigned submissions for a judge by categoryRoundId
export const getAssignedSubmissions = async (categoryRoundId: number): Promise<SubmissionResponse> => {
    const response = await axiosClient.get(`/grading/category-round/${categoryRoundId}/submissions`);
    return response.data.data;
};

// get criteria by roundId
export const getCriteriaByRoundId = async (roundId: number): Promise<CriteriaResponse> => {
    const response = await axiosClient.get(`/grading/rounds/${roundId}/criteria`);
    return response.data;
};

// submit evaluation
export const submitEvaluation = async (submissionId: number, type: 'PRESENTATION' | 'SUBMISSION', data: any): Promise<EvaluationDetailResponse> => {
    const endpointStr = type === 'PRESENTATION' ? 'presentation' : 'code';
    const response = await axiosClient.post(`/grading/submissions/${submissionId}/evaluation/${endpointStr}`, data);
    console.log(response.data);
    return response.data;
};

export const reEvaluatedCode = async (data: any) => {
    const response = await axiosClient.post(`/grading/submissions/re-evaluation/code`, data);
    return response.data;
}
export const reEvaluatedPresentation = async (data: any) => {
    const response = await axiosClient.post(`/grading/submissions/re-evaluation/presentation`, data);
    return response.data;
}

export const reEvaluation = async (categoryRoundId: number) => {
    const res = await axiosClient.get(`/grading/category-round/${categoryRoundId}/re-evaluations`);
    return res.data;
}

export const getReEvaluatedRequest = async (roundId: number) => {
    const response = await axiosClient.get(`/team-request/appeal/${roundId}/review-submissions`);
    return response.data;
}

// get expert overview statistics
export const getExpertOverview = async (eventId: number): Promise<any> => {
    const response = await axiosClient.get(`/expert/${eventId}`);
    return response.data;
};

// get submission evaluation
export const getSubmissionEvaluation = async (submissionId: number): Promise<EvaluationResponse> => {
    const response = await axiosClient.get(`/grading/submissions/${submissionId}/evaluation`);
    return response.data;
};