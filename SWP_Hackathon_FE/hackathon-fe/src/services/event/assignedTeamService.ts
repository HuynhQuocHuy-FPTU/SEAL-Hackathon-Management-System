import axiosClient from "../../api/axiosClient";
import type { DrawResult } from "../../types/registration/Registration";

export const assignTeamCategory = async (eventId: number, responseDeadline: number, drawResults: DrawResult[]) => {
    const res = await axiosClient.put(`/events/${eventId}/draw-results/import`, drawResults, {
        params: { responseDeadline },
    });

    return res.data;
};

export const updateTeamCategory = async (eventId: number, drawResults: DrawResult[]) => {
    const res = await axiosClient.put(`events/${eventId}/draw-results/update`, drawResults);
    return res.data;
}

export const getAllTeamApproved = async (eventId: number) => {
    const res = await axiosClient.get(`/registrations/${eventId}/approved-teams`);
    console.log(res.data);
    return res.data;
}

export const getDrawResults = async (eventId: number) => {
    const res = await axiosClient.get(`events/${eventId}/draw-results/get-draw`);
    return res.data;
}