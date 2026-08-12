import axiosClient from '../../api/axiosClient'
import type { EventTimeRequest, HackathonCreate, RoundTimeData } from '../../types/hackathonEvent/Hackathon'

export const getAllExperts = async () => {
    const expertRes = await axiosClient.get("/events/experts");
    return expertRes.data?.data;
}
export const getAllCriteriaDetails = async () => {
    const criteriaRes = await axiosClient.get("/criteriaSet/with-details");
    return criteriaRes.data.data;
}
export const createEvent = async (eventData: HackathonCreate) => {
    const eventRes = await axiosClient.post("/events/create", eventData);
    return eventRes.data;
}

export const updateEvent = async (eventData: HackathonCreate, eventId: number) => {
    const eventRes = await axiosClient.put(`/events/update/${eventId}`, eventData);
    return eventRes.data;
}

export const updateDeadlineRound = async (roundId: number, updateData: RoundTimeData) => {
    const res = await axiosClient.put(`/events/update-time-round/${roundId}`, updateData);
    return res.data;
}

export const getAllPublicEvents = async () => {
    const eventRes = await axiosClient.get("/events/public");
    return eventRes.data;
}
export const getAllEvent = async () => {
    const eventRes = await axiosClient.get("/events/all");
    return eventRes.data;
}
export const deleteEvent = async (eventId: number) => {
    const eventRes = await axiosClient.put(`/events/delete/${eventId}`);
    return eventRes.data;
}
export const cancelEvent = async (eventId: number, reason: string) => {
    const eventRes = await axiosClient.put(`events/cancel/${eventId}?reason=${reason}`);
    return eventRes.data;
}
export const publishEvent = async (eventId: number) => {
    const eventRes = await axiosClient.put(`/events/publish/${eventId}`);
    return eventRes.data;
}

export const restoreEvent = async (eventId: number) => {
    const eventRes = await axiosClient.put(`/events/restore/${eventId}`);
    return eventRes.data;
}

export const getTrashEvent = async () => {
    const trashEvent = await axiosClient.get("/events/trash");
    return trashEvent.data;
}

export const permanentDeleteEvent = async (eventId: number) => {
    const eventRes = await axiosClient.delete(`/events/permanently/${eventId}`);
    return eventRes.data;
}

export const getEventDetailById = async (eventId: number) => {
    const eventRes = await axiosClient.get(`/events/public/detail/${eventId}`);
    return eventRes.data;
}
export const completeWorkshop = async (eventId: number) => {
    const eventRes = await axiosClient.patch(`/events/${eventId}/draw-results/workshop/complete`);
    return eventRes.data;
}
export const cancelWorkshop = async (eventId: number) => {
    const eventRes = await axiosClient.patch(`/events/${eventId}/draw-results/workshop/cancel`);
    return eventRes.data;
}

export const getPublicstatis = async () => {
    const statisRes = await axiosClient.get("/events/public/statistics");
    return statisRes.data;
}

export const updateEventTime = async (eventId: number, eventTimeRequest: EventTimeRequest) => {
    const rest = await axiosClient.put(`/events/update-time-event/${eventId}`, eventTimeRequest);
    return rest.data;
}

export const getYearOfEvents = async (): Promise<number[]> => {
    const resYear = await axiosClient.get("/events/years");
    return resYear.data;
}