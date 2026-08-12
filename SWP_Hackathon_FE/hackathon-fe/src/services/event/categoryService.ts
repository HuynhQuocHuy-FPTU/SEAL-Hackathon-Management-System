import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api'

export const getCategories = async () => {
    try {
        const response = await axiosClient.get(API_ENDPOINTS.CATEGORIES.CATEGORY);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}