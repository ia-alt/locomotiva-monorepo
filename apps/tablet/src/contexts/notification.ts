import { createContext } from "react";

export const NotificationContext = createContext<NotificationContextType | null>(null);

export type NotificationContextType = {
}