import React, { createContext, JSX, useContext, useState } from "react";

type NotificationType = "success" | "error";

interface Notification {
    text: string;
    type: NotificationType
}

interface NotificatorContextValue {
    notification: Notification,
    setNotification: React.Dispatch<React.SetStateAction<Notification>>
}

const NotificatorContext = createContext<NotificatorContextValue | undefined>(undefined);

export const NotificatorProvider: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const [notification, setNotification] = useState<Notification>({
        text: "",
        type: "success"
    });

    return (
        <NotificatorContext.Provider value={{ notification, setNotification }}>
            { children }
        </NotificatorContext.Provider>
    );
}

export const useNotificator = () => {
    const context = useContext(NotificatorContext);
    if (!context) {
        throw new Error('useNotificator must be used within a NotificatorProvider');
    }
    return context;
};