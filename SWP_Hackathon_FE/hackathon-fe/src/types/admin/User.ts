export interface User {
    accountId: number;
    email: string;
    phone: string;
    fullName: string;
    role: string;
    status: string;
    avatarUrl: string;
    university: string;
    organization: string;
    createdAt: Date;
    githubId: number;
    githubUsername: string;
    passwordChanged: boolean;
    accountStatus: string;

}

export interface Status {
    status: boolean;
    message: string;
    data: string;
    errors: string;
}

export interface OverviewMetrics {
    highLevelAccounts: number;
    systemRoles: number;
    totalLog24h: number;
    bannedAccounts: number;
}

export interface RoleDistributionResponse {
    studentCount: number;
    adminCount: number;
    coordinatorCount: number;
    expertCount: number;
    totalUsers: number;
}

export interface RecentAuditLog {
    id: number;
    accountId: number;
    actorName: string;
    role: string;
    action: string;
    entityType: string;
    entityId: number;
    message: string;
    data: string;
    createdAt: string;
}

export interface OverviewResponse {
    metrics: OverviewMetrics;
    roleDistributionResponse: RoleDistributionResponse;
    recentAuditLogs: RecentAuditLog[];
}

export interface PageInfo {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
}

export interface AuditLogPaginatedResponse {
    content: RecentAuditLog[];
    page: PageInfo;
}