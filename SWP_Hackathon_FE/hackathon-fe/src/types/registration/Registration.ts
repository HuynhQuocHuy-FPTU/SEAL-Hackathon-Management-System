import type { Member } from "../team/TeamDetail";

export interface Registration {
    registrationId: number;
    eventName: string;
    teamId: number;
    teamName: string;
    registrationDate: string;
    teamSize: number;
    leader: Member;
    members: Member[];
}

export interface DrawResult {
    categoryId: number,
    registrationId: number[]
}

export interface TeamApprove {
    registrationId: number;
    teamName: string;
}

export interface RegistrationCount {
    countApproved: number;
    countReject: number;
    countPending: number;
}

export interface RegistrationViewing {
    registrationId: number;
    eventId: number;
    eventName: string;
    teamId: number;
    teamName: string;
    teamSize: number;
    registrationDate: string;
    status: string;
}