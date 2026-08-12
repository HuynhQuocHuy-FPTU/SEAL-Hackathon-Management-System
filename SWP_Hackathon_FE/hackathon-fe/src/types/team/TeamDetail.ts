export interface TeamDetail {
    teamId: number;
    teamName: string;
    leader: Member;
    members: Member[];
    sizeTeam: number;
    invitations: Invitations[];
}

export interface Member {
    studentCode: number;
    fullName: string;
    email: string;
    avatarUrl: string;
    leader: boolean;
    major: string;
}

interface Invitations {
    email: string;
    status: string;
}