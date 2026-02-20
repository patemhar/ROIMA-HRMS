import { create } from "zustand";

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
  
    markAllRead: () =>
      set((state) => ({
        notifications: state.notifications.map((item) => ({
          ...item,
          read: true,
        })),
    })),
  
    markRead: (id) =>
      set((state) => ({
        notifications: state.notifications.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
    })),
  
    clearAll: () => set({ notifications: [] }),
}));
