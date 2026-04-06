import { createContext, useContext } from "react";

export type NotificationContextType = {
    showCheckinNotification: () => void
}

export const NotificationContext = createContext<NotificationContextType>({

});

export function useNotification() {
    const ctx = useContext(NotificationContext)
    if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
    return ctx
}
