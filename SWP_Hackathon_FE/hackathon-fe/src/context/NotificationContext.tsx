import { createContext, useState } from "react";
import type { Notification } from "../types/admin/Notification";

type NotificationType = "Success" | "Info" | "Warning" | "Error";

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string) => void;
  dismissNotification: (id: string) => void;
};
export const NotificationContext = createContext<NotificationContextType | null>(null);
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotification] = useState<Notification[]>([]);
  const addNotification = (type: NotificationType, message: string) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date().toLocaleString(),
    };
    setNotification((prev) => [...prev, newNotification]);
  };
  const dismissNotification = (id: string) => {
    setNotification((prev) => prev.filter((n) => n.id !== id));
  };
  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, dismissNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}