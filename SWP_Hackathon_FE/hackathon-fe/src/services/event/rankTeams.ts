import axiosClient from "../../api/axiosClient";
import type { PrizeExtension } from "../../types/rank/Prize";

export const handleAppeal = async (roundId: number, startTime: string, endTime: string) => {
    const res = await axiosClient.put(`/ranking/rounds/open-appeals`, {
        roundId: roundId,
        startTime: startTime,
        endTime: endTime
    });
    return res.data;
}

export const getRankingByRoundId = async (roundId: number) => {
    const res = await axiosClient.get(`/ranking/rounds/${roundId}/all`);
    return res.data;
}

export const getTopN = async (roundId: number) => {
    const res = await axiosClient.get(`/ranking/rounds/${roundId}/topN`);
    return res.data;
}

export const getAllRanking = async (roundId: number) => {
    const res = await axiosClient.get(`/ranking/rounds/${roundId}/all`);
    return res.data;
}

export const publicDraftRanking = async (roundId: number, hoursAmount?: number) => {
    const res = await axiosClient.post(`/ranking/rounds/${roundId}/publish-draft?hoursAmount=${hoursAmount}`);
    return res.data;
}

export const releaseFinalRanking = async (roundId: number) => {
    const res = await axiosClient.post(`/ranking/rounds/${roundId}/publish-FINAL`);
    return res.data;
}

export const prizeReward = async (roundId: number, prizeExtend?: PrizeExtension[]) => {
    const res = await axiosClient.post(`/prize/${roundId}/assign`, prizeExtend);
    return res.data;
}

export const exportToExcel = async (roundId: number, type: string) => {
    const res = await axiosClient.get(`/ranking/rounds/coordinator/download-excel/${roundId}?type=${type}`);
    return res.data;
}

export const k = async (roundId: number, type: string) => {
    const res = await axiosClient.get(`/ranking/rounds/all/download-excel/${roundId}?type=${type}`);
    return res.data;
}