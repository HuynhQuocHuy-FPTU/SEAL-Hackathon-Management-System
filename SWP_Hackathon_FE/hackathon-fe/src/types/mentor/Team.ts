export interface Team {
    teamId: number;
    teamName: string;
    sizeTeam: number;
    categoryName: string;
    expertId: number;
    roundName: string;
    createAt: string;
    status: string;
}

export interface TeamMember {
    studentCode: string;
    fullName: string;
    email: string;
    major: string;
    avatarUrl?: string;
}

export interface TeamDetail {
    teamId: number;
    teamName: string;
    sizeTeam: number;
    categoryName: string;
    expertId: number;
    roundName: string;
    leader: TeamMember;
    members: TeamMember[];
}

export interface Request {
    requestId: number;
    teamId: number;
    teamName: string;
    createDate: Date;
    status: string;
    round: string;
    categoryName: string;
    requestMessage: string;
    responseMessage: string;
    responseStatus: string;
    responseId: number;
    responseAt: Date;
}


