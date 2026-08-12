export interface UserProfile {
    accessToken: string;
    refreshToken: string;
    githubId: number;
    githubUsername: string;
    passwordChanged: boolean;
    accountStatus: string;
    organization: string;
    expiresIn: number;
    accountId: number;
    fullName: string;
    email: string;
    role: string;
    avatar: string;
    university: string;
    isSelf?: boolean;
}

export interface ExpertPropfile {
    expertId: number;
    expertName: string;
    email: string;
    department: string;
}

export interface AuthContextType {
    user: UserProfile | null;
    login: (account: UserProfile, token: string, refreshToken: string) => void;
    logout: () => void;
    updateUser: (user: Partial<UserProfile>) => void;
}

export interface StudentProfileForm {
    studentName: string;
    studentCode: string;
    phone: string;
    address: string;
    major: string;
    university: string;
    avatar: string;
}