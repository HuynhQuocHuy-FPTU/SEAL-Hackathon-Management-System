// baseURL: 'http://localhost:8080/api',
export const API_BASE_URL = 'https://6a380716c105017aa63994fa.mockapi.io/wp';

export const API_ENDPOINTS = {
    CATEGORIES: {
        CATEGORY: "/category"
    },
    TEAMS: {
        TEAM_REQUEST: "/team_request",
        TEAM_REQUEST_BY_EXPERT_ID: "/team_request",
        EXPERT_RESPONSE: "/team_request/${requestId}",
        TEAM_INFO_BY_EXPERT: "/team_info/${expertId}",
        TEAM_DETAIL: "/team_detail/${teamId}",

    },
    ACCOUNTS: {
        EXPERT_PROFILE: "/expert_profile/${userId}",
        UPDATE_EXPERT_PROFILE: "/expert_profile/${userId}",
        ACCOUNT_INFO: "/user/${accountId}",
        UPDATE_ACCOUNT_INFO: "/user/${accountId}",
        GET_ALL_USERS: "/user",
        ADD_USER: "/user",

    },
    SCHEDULE: {
        EXPERT_SCHEDULE: "/expert_schedule/${expertId}",
    },
    ROUNDS: {
        ROUND_BY_EXPERT_ID: "/round/${expertId}",
    },
    EVENTS: {
        EVENT_BY_EXPERT_ID: "/hackathon_event/${expertId}",
    }
}