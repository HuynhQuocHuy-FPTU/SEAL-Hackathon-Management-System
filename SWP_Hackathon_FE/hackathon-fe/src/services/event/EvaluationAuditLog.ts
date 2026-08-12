import axiosClient from "../../api/axiosClient"
import type { EvaluationAuditAttemptResponse, EvaluationAuditListResponse, EvaluationDetailAuditResponse } from "../../types/hackathonEvent/EvaluationAuditResponse"

export const getAuditLogEvaluations = async (categoryRoundId: number): Promise<EvaluationAuditListResponse[]> => {
    const res = await axiosClient.get(`/evaluation-audit-logs/category-rounds/${categoryRoundId}/evaluations`)
    return res.data
}

export const getEvaluationAttempts = async (evaluationId: number): Promise<EvaluationAuditAttemptResponse[]> => {
    const res = await axiosClient.get(`/evaluation-audit-logs/evaluations/${evaluationId}`)
    return res.data
}

export const getAuditAttemptDetails = async (attemptId: number): Promise<EvaluationDetailAuditResponse[]> => {
    const res = await axiosClient.get(`/evaluation-audit-logs/${attemptId}/details`)
    return res.data
}