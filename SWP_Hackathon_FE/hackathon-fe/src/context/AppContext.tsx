import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { ParticipantUser, Event, RolePermissions, SystemMetrics, AppSettings, UserRole, EventStatus } from "../types";
import {
    initialUsers,
    initialEvents,
    initialRolePermissions,
    initialMetrics,
    defaultSettings
} from "../data/mockData";

export type ActiveTab = "Overview" | "Users" | "Roles" | "Events" | "Audit Logs" | "Settings";

interface AppContextType {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    users: ParticipantUser[];
    addUser: (name: string, email: string, role: UserRole) => void;
    updateUserRole: (id: string, role: UserRole) => void;
    deleteUser: (id: string) => void;
    events: Event[];
    addEvent: (name: string, startDate: string, endDate: string, tracks: string[]) => void;
    updateEventStatus: (id: string, status: EventStatus) => void;
    deleteEvent: (id: string) => void;

    metrics: SystemMetrics;
    triggerSystemAudit: () => void;
    rolePermissions: RolePermissions[];
    updateRolePermission: (role: UserRole, field: keyof Omit<RolePermissions, "role">, value: boolean) => void;
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Custom Toast state
    toastMessage: string;
    toastType: "info" | "success" | "error" | "system";
    toastVisible: boolean;
    showToast: (message: string, type?: "info" | "success" | "error" | "system") => void;
    hideToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);



export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
        const saved = localStorage.getItem("ho_active_tab");
        return (saved as ActiveTab) || "Overview";
    });

    const setActiveTab = (tab: ActiveTab) => {
        setActiveTabState(tab);
        localStorage.setItem("ho_active_tab", tab);
    };

    const [users, setUsers] = useState<ParticipantUser[]>(() => {
        const saved = localStorage.getItem("ho_users");
        return saved ? JSON.parse(saved) : initialUsers;
    });

    const [events, setEvents] = useState<Event[]>(() => {
        const saved = localStorage.getItem("ho_events");
        return saved ? JSON.parse(saved) : initialEvents;
    });



    const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>(() => {
        const saved = localStorage.getItem("ho_role_permissions_v2");
        return saved ? JSON.parse(saved) : initialRolePermissions;
    });

    const [metrics, setMetrics] = useState<SystemMetrics>(() => {
        const saved = localStorage.getItem("ho_metrics");
        return saved ? JSON.parse(saved) : initialMetrics;
    });

    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem("ho_settings");
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    const [searchQuery, setSearchQuery] = useState("");

    // Toast Notification State
    const [toastMessage, setToastMessage] = useState("System state: Nominal. All services operational.");
    const [toastType, setToastType] = useState<"info" | "success" | "error" | "system">("success");
    const [toastVisible, setToastVisible] = useState(false);

    // Persistence hooks
    useEffect(() => {
        localStorage.setItem("ho_users", JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem("ho_events", JSON.stringify(events));
    }, [events]);



    useEffect(() => {
        localStorage.setItem("ho_role_permissions", JSON.stringify(rolePermissions));
    }, [rolePermissions]);

    useEffect(() => {
        localStorage.setItem("ho_metrics", JSON.stringify(metrics));
    }, [metrics]);

    useEffect(() => {
        localStorage.setItem("ho_settings", JSON.stringify(settings));
    }, [settings]);

    // Toast controls
    const showToast = (message: string, type: "info" | "success" | "error" | "system" = "info") => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    };

    const hideToast = () => {
        setToastVisible(false);
    };



    // 1. Users managers
    const addUser = (name: string, email: string, role: UserRole) => {
        const names = name.trim().split(" ");
        const initials = names.map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "U";

        const newUser: ParticipantUser = {
            id: "usr-" + Date.now(),
            name,
            email,
            role,
            initials,
            registeredAt: new Date().toISOString(),
            status: "active"
        };

        setUsers((prev) => [newUser, ...prev]);

        // Increment metrics
        setMetrics((prev) => ({
            ...prev,
            totalUsers: prev.totalUsers + 1,
            // Modify user growth statistics
            userGrowth: prev.userGrowth.map((g, idx) => {
                // Increment the current day record
                if (idx === prev.userGrowth.length - 1) {
                    return { ...g, count: g.count + 1 };
                }
                return g;
            })
        }));

        showToast(`User ${name} successfully added to the console`, "success");
    };

    const updateUserRole = (id: string, role: UserRole) => {
        const targetUser = users.find((u) => u.id === id);
        if (!targetUser) return;

        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, role } : u))
        );

        showToast(`Updated ${targetUser.name}'s role to ${role}`, "success");
    };

    const deleteUser = (id: string) => {
        const targetUser = users.find((u) => u.id === id);
        if (!targetUser) return;

        setUsers((prev) => prev.filter((u) => u.id !== id));

        setMetrics((prev) => ({
            ...prev,
            totalUsers: Math.max(0, prev.totalUsers - 1)
        }));

        showToast(`Removed user ${targetUser.name}`, "info");
    };

    // 2. Events managers
    const addEvent = (name: string, startDate: string, endDate: string, tracks: string[]) => {
        const newEvent: Event = {
            id: "evt-" + Date.now(),
            name,
            startDate,
            endDate,
            status: "upcoming",
            participantsCount: Math.floor(Math.random() * 300) + 50,
            tracks
        };

        setEvents((prev) => [newEvent, ...prev]);
        showToast(`Successfully created hackathon "${name}"`, "success");
    };

    const updateEventStatus = (id: string, status: EventStatus) => {
        const targetEvent = events.find((e) => e.id === id);
        if (!targetEvent) return;

        setEvents((prev) =>
            prev.map((e) => (e.id === id ? { ...e, status } : e))
        );

        const prettyStatus = status.toUpperCase();

        showToast(`"${targetEvent.name}" status updated to ${status}`, "success");
    };

    const deleteEvent = (id: string) => {
        const targetEvent = events.find((e) => e.id === id);
        if (!targetEvent) return;

        // Soft delete / change status to deleted
        setEvents((prev) =>
            prev.map((e) => (e.id === id ? { ...e, status: "deleted" as EventStatus } : e))
        );

        showToast(`Deleted event "${targetEvent.name}"`, "info");
    };



    // Manual Trigger System Optimization
    const triggerSystemAudit = () => {
        // Generate system audit log
        const prevLatency = metrics.dbLatency;
        const newLatency = Math.max(5, prevLatency - Math.floor(Math.random() * 5) - 2);

        setMetrics((prev) => ({
            ...prev,
            dbLatency: newLatency,
            systemHealth: Math.min(100, Math.max(99, prev.systemHealth + 0.01))
        }));

        showToast("Garbage collection and indexing optimized successfully", "system");
    };

    // 4. Role Permissions matrix
    const updateRolePermission = (role: UserRole, field: keyof Omit<RolePermissions, "role">, value: boolean) => {
        setRolePermissions((prev) => {
            const next = prev.map((rp) =>
                rp.role === role ? { ...rp, [field]: value } : rp
            );
            localStorage.setItem("ho_role_permissions_v2", JSON.stringify(next));
            
            showToast(`Updated ${role} credentials for: ${field}`, "success");
            return next;
        });
    };

    // 5. App settings
    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
        showToast("System configurations saved successfully", "success");
    };

    // 6. Live Simulator (Simulated system activities popping up alerts)
    useEffect(() => {
        if (!settings.simulatedActivity) return;

        const interval = setInterval(() => {
            // Choose a random simulated administrative / background action
            const actions = [
                {
                    action: "Automated API Gateway Security Sweep Completed",
                    status: "SYSTEM" as const,
                    user: { name: "Security Bot", initials: "SB" },
                    toast: "API Gateway secure. Zero compromised tokens.",
                    toastType: "system" as const,
                    metricsUpdate: (prev: SystemMetrics) => ({
                        ...prev,
                        apiHealth: Math.min(100, Math.max(99.5, prev.apiHealth + (Math.random() * 0.1 - 0.05)))
                    })
                },
                {
                    action: "Failed login attempt detected - Suspicious traffic block",
                    status: "FAILED" as const,
                    user: { name: "Gateway Shield", initials: "GS" },
                    toast: "Blocked suspicious access attempt from external IP",
                    toastType: "error" as const,
                    metricsUpdate: (prev: SystemMetrics) => ({
                        ...prev,
                        pendingApprovals: prev.pendingApprovals + 1
                    })
                },
                {
                    action: "Synchronized project submittals schema & verified clusters",
                    status: "SYSTEM" as const,
                    user: { name: "System Cron", initials: "SY" },
                    toast: "Distributed sync complete. Nodes operating optimally.",
                    toastType: "system" as const,
                    metricsUpdate: (prev: SystemMetrics) => ({
                        ...prev,
                        dbLatency: Math.max(8, Math.min(25, prev.dbLatency + (Math.random() > 0.5 ? 1 : -1)))
                    })
                },
                {
                    action: "New anonymous participant registered for HackOrchestra",
                    status: "SUCCESS" as const,
                    user: { name: "Registration", initials: "RG" },
                    toast: "New participant signed up for current event!",
                    toastType: "success" as const,
                    metricsUpdate: (prev: SystemMetrics) => ({
                        ...prev,
                        totalUsers: prev.totalUsers + 1,
                        activeSessions: prev.activeSessions + Math.floor(Math.random() * 3) + 1,
                        userGrowth: prev.userGrowth.map((g, i) => i === prev.userGrowth.length - 1 ? { ...g, count: g.count + 1 } : g)
                    })
                },
                {
                    action: "Modified system performance logging interval to 500ms",
                    status: "SUCCESS" as const,
                    user: { name: "Bobby Fischer", initials: "BF", role: "Participant" as UserRole },
                    toast: "Bobby Fischer updated client debug logger setting",
                    toastType: "info" as const,
                    metricsUpdate: (prev: SystemMetrics) => prev
                }
            ];

            const chosen = actions[Math.floor(Math.random() * actions.length)];

            setMetrics((prev) => chosen.metricsUpdate(prev));
            showToast(chosen.toast, chosen.toastType);

        }, settings.simulationFrequency * 1000);

        return () => clearInterval(interval);
    }, [settings.simulatedActivity, settings.simulationFrequency, metrics]);

    // Toast auto-hide on transition
    useEffect(() => {
        if (toastVisible) {
            const timer = setTimeout(() => {
                setToastVisible(false);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [toastVisible, toastMessage]);

    return (
        <AppContext.Provider
            value={{
                activeTab,
                setActiveTab,
                users,
                addUser,
                updateUserRole,
                deleteUser,
                events,
                addEvent,
                updateEventStatus,
                deleteEvent,

                metrics,
                triggerSystemAudit,
                rolePermissions,
                updateRolePermission,
                settings,
                updateSettings,
                searchQuery,
                setSearchQuery,

                // Toast
                toastMessage,
                toastType,
                toastVisible,
                showToast,
                hideToast
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
};
