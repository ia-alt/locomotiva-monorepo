import { FC, PropsWithChildren, useEffect } from "react";
import { NotificationContext } from "../contexts/notification";
import { useORPC } from "../locomotiva-api/context";

export const NotificationProvider: FC<PropsWithChildren> = ({ children }) => {
    const orpc = useORPC();

    function onChekin() {
        console.log("Checkin com sucesso")
    }

    useEffect(() => {
        const streaming = orpc.coworking.totem.onCheckin.call({ totemName: "tomate" }).then(async (events) => {
            console.log("Notification connected");
            for await (const event of events) {
                onChekin();
            }
        }).catch((error) => {
            console.error("Notification error:", error);
        })
    }, [])
    return (
        <NotificationContext.Provider value={{}}>
            {children}
        </NotificationContext.Provider>
    )
}