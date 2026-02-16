import { authService } from "@/services/authService";
import { useAuth } from "@/store";
import { isTokenNearExpiryOrExpired } from "@/utils/tokenUtils";
import { useEffect, useState } from "react";


export function useAuthInitialization() {

    const [isInitialized, setIsInitialized] = useState<boolean>();
    const { logout, setToken } = useAuth((state) => state.auth);

    const initializeAuth = async () => {

        try {
            
            const token = useAuth.getState().auth.token;

            if(!token || isTokenNearExpiryOrExpired(token)) {

                const response = await authService.refreshToken();

                if(response.message && response.data?.accessToken) {
                    setToken(response.data.accessToken);
                } else {
                    logout();
                    return;
                }

            }

        } catch (error) {
            logout();
        } finally {
            setIsInitialized(true);
        }

    }

    useEffect(() => {
        void initializeAuth();
    }, []);

    return {
        isInitialized,
        isAuthenticated: useAuth.getState().auth.isAuthenticated
    }
} 