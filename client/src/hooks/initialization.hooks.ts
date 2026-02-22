import { authService } from "@/services/authService";
import { useAuth } from "@/store";
import { isTokenNearExpiryOrExpired } from "@/utils/tokenUtils";
import { useEffect, useState } from "react";
import { toast } from "sonner";


export function useAuthInitialization() {
  
  const [isInitialized, setIsInitialized] = useState<boolean>();
  const logout = useAuth((state) => state.auth.logout);
    
  const initializeAuth = async () => {
    
    try {
      
            const token = useAuth.getState().auth.token;

            if(!token || isTokenNearExpiryOrExpired(token)) {

                const response = await authService.refreshToken();

                if(!(response.success && response.data?.accessToken && response.data.userDetailResponse)) {
                    logout();
                    return;
                }
            }

        } catch (error) {
            toast.error("Failed to initialize authentication. Please log in again.");
            console.error("Authentication initialization error:", error);
            logout();
        } finally {
            setIsInitialized(true);
        }

    }

    useEffect(() => {
        void initializeAuth();
    }, [logout]);

    return {
        isInitialized,
        isAuthenticated: useAuth.getState().auth.isAuthenticated
    }
} 