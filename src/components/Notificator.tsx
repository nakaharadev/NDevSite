import { JSX, useEffect, useRef, useState } from "react";
import { useNotificator } from "./context/NotificatorContext";

export const Notificator = (): JSX.Element => {
    const { notification } = useNotificator();
    const [isVisible, setIsVisible] = useState(false);
    const [currentNotification, setCurrentNotification] = useState(notification);
    
    const notifColor = {
        success: "#00ff00",
        error: "#ff0000"
    };
    
    const ref = useRef<HTMLParagraphElement>(null);
    const timeoutId = useRef<NodeJS.Timeout | number | null>(null);

    useEffect(() => {
        if (!notification.text) return;

        // Сбрасываем предыдущую анимацию
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
            setIsVisible(false);
        }

        // Устанавливаем новое уведомление и делаем его видимым
        setCurrentNotification(notification);
        setIsVisible(true);

        // Автоматически скрываем через 3 секунды
        timeoutId.current = setTimeout(() => {
            setIsVisible(false);
        }, 3000);

        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
        };
    }, [notification]);

    return (
        <div style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            display: "flex",
            pointerEvents: "none",
            overflow: "hidden",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            padding: "20px"
        }}>
            <p 
                ref={ref}
                style={{
                    color: "#fff",
                    fontSize: "21pt",
                    border: `1px ${notifColor[currentNotification.type as keyof typeof notifColor] || "#313233"} solid`,
                    background: "#313233",
                    borderRadius: "15px",
                    padding: "0 20px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
                    transform: isVisible ? "translateX(-40%)" : "translateX(200%)",
                    opacity: isVisible ? 1 : 0
                }}
            >
                {currentNotification.text}
            </p>
        </div>
    );
};