import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuth } from "@/store";
import { useNotificationsStore } from "@/store/notifications";

interface UseLogoutOptions {
  redirectTo?: string;
  replace?: boolean;
}

export function useLogout({
  redirectTo,
  replace = true,
}: UseLogoutOptions = {}) {
    
  const navigate = useNavigate();
  const resetAuth = useAuth((state) => state.auth.logout);
  const clearNotifications = useNotificationsStore((state) => state.clearAll);

  return useCallback(
    async (overrideRedirect?: string) => {
      try {
        await authService.logout();
      } catch (error) {
        console.error("Failed to logout from server", error);
      } finally {
        resetAuth();
        clearNotifications();
        const target = overrideRedirect ?? redirectTo;
        if (target) {
          navigate(target, { replace });
        }
      }
    },
    [navigate, redirectTo, replace, resetAuth, clearNotifications]
  );
}
