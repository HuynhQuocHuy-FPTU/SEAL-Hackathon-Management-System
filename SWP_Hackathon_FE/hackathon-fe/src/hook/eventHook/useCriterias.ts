import { useQuery } from "@tanstack/react-query"
import { getAllCriteriaDetails } from "../../services/event/eventService"
import type { CriteriaSet } from "../../types/hackathonEvent/Hackathon"

export const useCriteriaDetails = () => {
    return useQuery<CriteriaSet[]>({
        queryKey: ["criteriaDetails"],
        queryFn: getAllCriteriaDetails
    })
}