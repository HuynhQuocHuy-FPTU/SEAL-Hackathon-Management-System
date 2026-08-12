
import type { ParticipantUser, Event, AuditLog, RolePermissions, SystemMetrics, AppSettings } from "../types";

export const initialUsers: ParticipantUser[] = [
    {
        id: "usr-1",
        name: "Jane Doe",
        email: "jane.doe@hackorchestra.dev",
        role: "Mentor",
        initials: "JD",
        registeredAt: "2023-10-15T09:30:00Z",
        status: "active"
    },
    {
        id: "usr-2",
        name: "Arthur Morgan",
        email: "arthur.m@van-der-linde.org",
        role: "Mentor",
        initials: "AM",
        registeredAt: "2023-08-12T14:15:22Z",
        status: "active"
    },
    {
        id: "usr-3",
        name: "Satoshi K.",
        email: "satoshi@bitcoin.org",
        role: "Guest Judge",
        initials: "SK",
        registeredAt: "2023-10-24T12:00:00Z",
        status: "active"
    },
    {
        id: "usr-4",
        name: "John Marston",
        email: "john.m@ranchlife.net",
        role: "Team member",
        initials: "JM",
        registeredAt: "2024-01-05T16:40:11Z",
        status: "active"
    },
    {
        id: "usr-5",
        name: "Sadie Adler",
        email: "sadie.bounty@west.gov",
        role: "Admin",
        initials: "SA",
        registeredAt: "2023-09-01T11:22:33Z",
        status: "active"
    },
    {
        id: "usr-6",
        name: "Bobby Fischer",
        email: "bobby@chess-master.com",
        role: "Team member",
        initials: "BF",
        registeredAt: "2025-02-12T10:05:14Z",
        status: "inactive"
    },
    {
        id: "usr-7",
        name: "Grace Hopper",
        email: "grace.hopper@usnavy.mil",
        role: "Admin",
        initials: "GH",
        registeredAt: "2023-01-01T08:00:00Z",
        status: "active"
    },
    {
        id: "usr-8",
        name: "Linus Torvalds",
        email: "torvalds@linuxfoundation.org",
        role: "Mentor",
        initials: "LT",
        registeredAt: "2023-05-20T17:33:45Z",
        status: "active"
    }
];

export const initialEvents: Event[] = [
    {
        id: "evt-1",
        name: "Fall Hackathon 2023",
        startDate: "2023-10-20",
        endDate: "2023-10-22",
        status: "deleted",
        participantsCount: 620,
        tracks: ["Web3", "Developer Productivity", "Cybersecurity"]
    },
    {
        id: "evt-2",
        name: "Spring AI Spark 2025",
        startDate: "2025-04-10",
        endDate: "2025-04-13",
        status: "past",
        participantsCount: 1210,
        tracks: ["Large Language Models", "Generative Art", "Agentic Workflows"]
    },
    {
        id: "evt-3",
        name: "HackOrchestra Summer Final 2026",
        startDate: "2026-06-15",
        endDate: "2026-06-20",
        status: "ongoing",
        participantsCount: 1842,
        tracks: ["Cloud-Native Serverless", "DevOps Systems", "AI Orchestra Integrations"]
    },
    {
        id: "evt-4",
        name: "Global Zero-Trust Hackathon",
        startDate: "2026-09-01",
        endDate: "2026-09-04",
        status: "upcoming",
        participantsCount: 450,
        tracks: ["Cryptography", "Identity Access Management", "API Gateway Performance"]
    }
];

export const initialAuditLogs: AuditLog[] = [
    {
        id: "log-1",
        user: { name: "Jane Doe", initials: "JD", role: "Mentor" },
        action: "Modified User Role: Participant → Mentor",
        timestamp: "2026-06-04T14:22:05Z",
        ipAddress: "192.168.1.104",
        status: "SUCCESS"
    },
    {
        id: "log-2",
        user: { name: "Arthur Morgan", initials: "AM", role: "Mentor" },
        action: "Deleted Event: \"Fall Hackathon 2023\"",
        timestamp: "2026-06-04T13:45:12Z",
        ipAddress: "45.22.119.2",
        status: "SUCCESS"
    },
    {
        id: "log-3",
        user: { name: "Satoshi K.", initials: "SK", role: "Guest Judge" },
        action: "Failed Login Attempt",
        timestamp: "2026-06-04T12:30:59Z",
        ipAddress: "210.33.2.55",
        status: "FAILED"
    },
    {
        id: "log-4",
        user: { name: "System Cron", initials: "SY" },
        action: "Automated Database Optimization",
        timestamp: "2026-06-04T12:00:01Z",
        ipAddress: "127.0.0.1",
        status: "SYSTEM"
    }
];

export const initialRolePermissions: RolePermissions[] = [
    { role: "Team member", canSubmit: true, canEvaluate: false, canManageUsers: false, canEditSystemLogs: false, canCreateEvents: false },
    { role: "Team leader", canSubmit: true, canEvaluate: false, canManageUsers: false, canEditSystemLogs: false, canCreateEvents: false },
    { role: "Guest Judge", canSubmit: false, canEvaluate: true, canManageUsers: false, canEditSystemLogs: false, canCreateEvents: false },
    { role: "Internal Judge", canSubmit: false, canEvaluate: true, canManageUsers: false, canEditSystemLogs: false, canCreateEvents: false },
    { role: "Mentor", canSubmit: false, canEvaluate: true, canManageUsers: false, canEditSystemLogs: false, canCreateEvents: false },
    { role: "Coordinator", canSubmit: true, canEvaluate: true, canManageUsers: true, canEditSystemLogs: false, canCreateEvents: true },
    { role: "Admin", canSubmit: true, canEvaluate: true, canManageUsers: true, canEditSystemLogs: true, canCreateEvents: true }
];

export const initialMetrics: SystemMetrics = {
    totalUsers: 12842,
    activeSessions: 1402,
    systemHealth: 99.98,
    pendingApprovals: 24,
    serverUptime: "14d 6h 22m",
    dbLatency: 14,
    apiHealth: 99.9,
    userGrowth: [
        { day: "Mon", count: 240, previous: 210 },
        { day: "Tue", count: 480, previous: 440 },
        { day: "Wed", count: 320, previous: 350 },
        { day: "Thu", count: 640, previous: 550 },
        { day: "Fri", count: 820, previous: 710 },
        { day: "Sat", count: 580, previous: 520 },
        { day: "Sun", count: 420, previous: 390 }
    ]
};

export const defaultSettings: AppSettings = {
    maintenanceMode: false,
    autoBackup: true,
    backupInterval: 6,
    simulatedActivity: true,
    simulationFrequency: 30, // seconds
    adminName: "Alex Rivera",
    adminRole: "System Lead"
};
