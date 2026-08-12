export interface TeamActiveResponse {
    teamId: number;
    teamName: string;
    leaderName: string;
    memberNames: string[];
    createAt: string;
    maxTeamSize: number;
}

export interface TeamJoinRequest {
    reason: string;
}

export interface TeamJoinResponse {
    requestId: number;
    teamId: number;
    teamName: string;
    studentId: number;
    studentName: string;
    reason: string;
    status: string;
    createdAt: string;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "INVALID";

export interface TeamJoinRequestStatus {
    requestId: number;
    teamId: number;
    teamName: string;
    studentId: number;
    studentName: string;
    reason: string;
    status: string;
    createdAt: string;
}