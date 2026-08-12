import axiosClient from "../../api/axiosClient"
import type { Criteria } from "../../types/criteria/Criteria"

export const createCriteriaSet = async (criteria: Criteria) => {
    const result = await axiosClient.post("criteriaSet/create-criteriaSet", criteria);
    return result.data;
}

export const updateCriteriaSet = async (criteria: Criteria) => {
    const result = await axiosClient.post(`/criteriaSet/update-criteriaSet`, criteria);
    return result.data;
}

export const deleteCriteriaSet = async (criteriaId: number) => {
    const result = await axiosClient.post(`/criteriaSet/delete-criteriaSet/${criteriaId}`);
    return result.data;
}