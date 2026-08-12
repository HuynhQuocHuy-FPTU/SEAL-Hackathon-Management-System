import axiosClient from "../../api/axiosClient";

export const getAllPendingRegistration = async (eventId: number) => {
    const registerRes = await axiosClient.get(`/registrations/${eventId}/pendingTeam`);
    return registerRes.data.data;
}

export const updateDrawResult = async (eventId: number) => {
    const updateRes = await axiosClient.put(`/events/${eventId}/draw-results/update`);
    return updateRes.data;
}

export const getAllAprrovedRegister = async (eventId: number) => {
    const registerRes = await axiosClient.get(`/registrations/${eventId}/approved-teams`);
    return registerRes.data.data;
}
export const getAllRegistration = async (eventId: number) => {
    const registerRes = await axiosClient.get(`/registrations/${eventId}/registration-all`);
    return registerRes.data.data;
}

export const getPendingTeamDetail = async (registrationId: number) => {
    const registerRes = await axiosClient.get(`/registrations/${registrationId}/pendingTeam-detail`);
    return registerRes.data.data;
}

export const approvedPendingTeam = async (registrationId: number) => {
    const registerRes = await axiosClient.patch(`/registrations/${registrationId}/approve`);
    return registerRes.data;
}

export const rejectedPendingTeam = async (registrationId: number, reason: string) => {
    console.log("res id: ", registrationId);
    console.log("rejectReason: ", reason);
    const registerRes = await axiosClient.patch(`/registrations/${registrationId}/reject`, null, {
        params: {
            reason: reason
        }
    });
    return registerRes.data;
}

export const getRegistrationCount = async (eventId: number) => {
    const registerRes = await axiosClient.get(`/registrations/${eventId}/count-registration`);
    return registerRes.data;
}