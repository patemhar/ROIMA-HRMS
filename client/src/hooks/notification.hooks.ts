import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/store";
import { useNotificationsStore } from "@/store/notifications";

export type notificationResponseDto = {
    id: string;
    actor: string;
    recipient: string;
    type: string;
    title: string;
    message: string;
    created_at: string;
    read: boolean;
};

export const useNotifications = () => {

    const token = useAuth((state) => state.auth.token);

    useEffect(() => {
        const addNotification = useNotificationsStore.getState().addNotification;
        const baseUrl = "http://localhost:8080";

        if (!token) {
            return;
        }

        const url = `${baseUrl}/notifications/subscribe?access_token=${encodeURIComponent(token)}`;

        const eventSource = new EventSource(url);

        eventSource.addEventListener("notification", (event) => {

            const data = event.data;

            const parsed = JSON.parse(data) as notificationResponseDto;    
            const message = `${parsed.title}: ${parsed.message}`;

            addNotification({
                id: parsed.id,
                actor: parsed.actor,
                recipient: parsed.recipient,
                type: parsed.type,
                title: parsed.title,
                message: parsed.message,
                created_at: parsed.created_at,
                read: parsed.read,
            });

            toast.info(String(message));
        });

        eventSource.onerror = () => {
            eventSource.close();
        };

        return () => eventSource.close();

    }, [token]);
};
