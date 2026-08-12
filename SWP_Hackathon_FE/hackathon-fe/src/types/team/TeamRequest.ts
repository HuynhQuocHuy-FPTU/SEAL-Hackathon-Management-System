export interface TeamRequest {
    studentCode: string;
}

export interface CreateDirectTeamRequest {
    requestType: RequestType;
    requestMessage: string;
    roundId: number;
    eventId: number;
}


export const RequestType = {
    APPEAL: "APPEAL",
    DRAW_RESULT_VERIFICATION: "DRAW_RESULT_VERIFICATION"
} as const;

export type RequestType = typeof RequestType[keyof typeof RequestType];

export interface ProcessRequest {
    action: RequestAction;
    responseMessage: String;
    eventId: number;
    drawResults: DrawResultRequestDTO[];
}

export const RequestAction = {
    REJECT: "REJECT",
    REQUEST_RE_EVALUATION: "REQUEST_RE_EVALUATION",
    UPDATE_DRAW_RESULT: "UPDATE_DRAW_RESULT",
    RESOLVE: "RESOLVE"
} as const;

export type RequestAction = typeof RequestAction[keyof typeof RequestAction];

interface DrawResultRequestDTO {
    categoryId: number;
    registrationId: number[];
}

