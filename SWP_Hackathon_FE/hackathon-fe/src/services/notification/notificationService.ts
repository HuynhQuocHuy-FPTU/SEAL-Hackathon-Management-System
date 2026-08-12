import axiosClient from "../../api/axiosClient";
import type { ResponseRequest } from "../../types/request/RequestResponse";

export const getNotificationUnRead = async () => {
    const res = await axiosClient.get("/notifications/web/unread");
    return res.data;
}

export const getRead = async (notifyId: number) => {
    const res = await axiosClient.put(`/notifications/web/${notifyId}/read`);
    return res.data;
}

export const responseNotification = async (notiId: number, responseRequest: ResponseRequest) => {
    const res = await axiosClient.post(`/notifications/web/response/${notiId}`, responseRequest);
    return res.data;
}