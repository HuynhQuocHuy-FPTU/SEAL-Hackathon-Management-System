import axiosClient from "../../api/axiosClient";

export const getCurrentTeamAdvancement = async (roundId: number) => {
    const res = await axiosClient.get(`/round/${roundId}/participant/detail`);
    return res.data;
}

export const advanceTeam = async (roundId: number) => {
    const res = await axiosClient.post(`/round/advancement/${roundId}`);
    return res.data;
}

export const disqualifyTeam = async (eventId: number, teamId: number, reason: string) => {
    const res = await axiosClient.put("/participants/teams/disqualify", null,
        {
            params: {
                eventId,
                teamId,
                reason,
            },
        });
    return res.data;
};