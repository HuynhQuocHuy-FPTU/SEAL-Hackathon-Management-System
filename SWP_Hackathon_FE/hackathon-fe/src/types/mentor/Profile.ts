export interface Expert {
    accountId: number;
    avatarUrl: string;
    fullName: string;
    email: string;
    role: string;
    university: string;
    organization: string;
    createdAt: Date;
    accountStatus: string;
}

export interface Password {
    status: boolean;
    message: string;
    data: string;
    errors: string;
}