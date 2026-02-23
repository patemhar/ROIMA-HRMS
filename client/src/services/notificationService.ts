import { apiClient } from "./apiClient";
import type { ApiResponse } from "@/types/http";

export type NotificationResponseDto = {
  id: string;
  actor: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
};

type ApiResult<T> = Promise<ApiResponse<T>>;

class NotificationService {
  markAsRead(notificationId: string): ApiResult<void> {
    return apiClient.put<void>(`/notifications/${notificationId}/read`);
  }

  getUnreadNotifications(): ApiResult<NotificationResponseDto[]> {
    return apiClient.get<NotificationResponseDto[]>(`/notifications/unread`);
  }
}

export const notificationService = new NotificationService();
