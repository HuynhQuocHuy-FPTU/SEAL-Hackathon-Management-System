export type UserRole = "Team member" | "Team leader" | "Guest Judge" | "Internal Judge" | "Mentor" | "Coordinator" | "Admin";

export interface ParticipantUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    initials: string;
    registeredAt: string;
    status: "active" | "inactive";
}

export type EventStatus = "ongoing" | "upcoming" | "past" | "deleted";

export interface Event {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: EventStatus;
    participantsCount: number;
    tracks: string[];
}

export interface AuditLog {
    id: string;
    user: {
        name: string;
        initials: string;
        role?: UserRole;
    };
    action: string;
    timestamp: string;
    status: "SUCCESS" | "FAILED" | "SYSTEM";
}

export interface SystemMetrics {
    totalUsers: number;
    activeSessions: number;
    systemHealth: number;
    pendingApprovals: number;
    serverUptime: string;
    dbLatency: number;
    apiHealth: number;
    userGrowth: { day: string; count: number; previous?: number }[];
}

export interface RolePermissions {
    role: UserRole;
    canSubmit: boolean;
    canEvaluate: boolean;
    canManageUsers: boolean;
    canEditSystemLogs: boolean;
    canCreateEvents: boolean;
}

export interface AppSettings {
    maintenanceMode: boolean;
    autoBackup: boolean;
    backupInterval: number; // in hours
    simulatedActivity: boolean; // toggle background live triggers
    simulationFrequency: number; // in seconds
    adminName: string;
    adminRole: string;
}

export interface TeamRequest {
    requestId: string;
    teamName: string;
    request: string;
    createDate: Date;
    status: 'pending' | 'accepted' | 'declined';
    track: string;
    response?: string;
    teamId: string;
    expertId: string;
}


export interface UpcomingSession {
    id: string;
    teamName: string;
    date: string; // e.g. "NOV 12"
    timeSlot: string; // e.g. "10:00 AM - 10:30 AM"
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    topic?: string;
    joinUrl: string;
}

export interface Expert {
    expertId: string;
    expertName: string;
    department: string;
    accountId: string;
    accountName: string;
    email: string;
    phone: string;
    avatarUrl: string;
    password: string;
    createdAt: string;
    updatedAt: string;
}


export interface MentorProfile {
    name: string;
    role: string;
    initials: string;
    avatarColor: string;

    available: boolean;
    availableForRequests: boolean;

    avatarUrl?: string;

    bio: string;
    skills: string[];

    scheduleUrl: string;
}

export type StatusTag = | 'AI' | 'Web3' | 'Sustainability' | 'Healthtech';

export type HelpStatus = | 'Needs Help' | 'Recent Update' | 'Resolved';

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

export interface Milestone {
    id: string;
    title: string;
    completed: boolean;
}

export interface TeamGoal {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

export interface GuidanceNote {
    id: string;
    content: string;
    createdAt: string;
}


export interface Team {
    teamId: string;
    teamName: string;
    numOfMember: number;
    category: string;
    expertId: string;
}


export interface ExpertAssign {
    scheduleId: string;
    scheduleDate: Date;
    expertId: string;
    scheduleTime: Date;
    categoryRoundId: string;
    role: string;
    coordinatorId: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    dayShort: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
    dayIndex: number;     // 1 = Mon, 2 = Tue, etc.
    timeLabel: string;    // "11:15 - 12:00"
    startTimeMinutes: number; // minutes from 9 AM (9*60=540) to position vertically
    durationMinutes: number;  // duration for height
    color: 'blue' | 'purple' | 'cyan' | 'green' | 'amber';
    iconType?: 'meet' | 'person' | 'generic';
    attendee?: string;
    description?: string;
}

export interface RequestItem {
    id: string;
    teamName: string;
    category: string;
    initials: string;
    message: string;
    status: 'pending' | 'resolved';
    priority: 'high' | 'normal';
    timestamp: string;
}

export interface ScheduleItem {
    id: string;
    time: string;
    teamName: string;
    location: string;
    completed: boolean;
    round: 1 | 2;
    locked: boolean;
}

export interface SeasonItem {
    id: string;
    name: string;
    teamsCount: number;
    mentoredHours: number;
    impactScore: number;
    status: 'ARCHIVED' | 'ACTIVE';
}

export interface RoundExpert {
    roundId: string;
    roundName: string;
    date: string;
    startTime: string;
    endTime: string;
    expertId: string;
}

export interface HackathonEvent {
    eventId: string;
    eventName: string;
    startDate: string;
    endDate: string;
    title: string;
    address: string;
    status: string;
    description: string;
    season: string;
}

export interface User {
    accountId: string;
    accountName: string;
    password?: string;
    username?: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    school: string;
    createDate: Date;
    avatarUrl: string;
}




