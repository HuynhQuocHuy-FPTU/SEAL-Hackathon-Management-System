import { useQuery } from "@tanstack/react-query"
import { getAllExperts } from "../../services/event/eventService"

export const useExperts = () => {
    return useQuery({
        queryKey: ["experts"],
        queryFn: getAllExperts
    })
}