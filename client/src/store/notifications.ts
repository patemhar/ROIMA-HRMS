import { create } from "zustand";
import { notificationService } from "@/services/notificationService";
import { getErrorMessage } from "@/utils/error";

export type NotificationItem = {
  id: string;
  actor: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
};

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (notification: NotificationItem) => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationState>((set) => ({
  
  notifications: [],
  
    addNotification: (notification) =>
      set((state) => ({
        notifications: [notification, ...state.notifications],
    })),
  
    setNotifications: (notifications) =>
      set({ notifications }),
  
    markAllRead: async () => {

        set((state) => ({
          notifications: state.notifications.map((item) => ({
            ...item,
            read: true,
          }))
        }));
        
        try {
          await notificationService.markAllAsRead();
        } catch (error) {
          console.error("Failed to mark all notifications as read:", getErrorMessage(error));
          set((state) => ({
            notifications: state.notifications.map((item) => ({
              ...item,
              read: false,
            }))
          }));
        }
    },
  
    markRead: async (id) => {
      set((state) => ({
        notifications: state.notifications.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      }));
      
      try {
        await notificationService.markAsRead(id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === id ? { ...item, read: false } : item,
          ),
        }));
      }
    },
  
    clearAll: () => set({ notifications: [] }),
}));
