import type { components } from "@/types/api";
import { apiClient } from "./apiClient";
import { useAuth } from "@/store"
import type { ApiResponse } from "@/types/http";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;

class AuthService {

    async login(
        credentials: Schemas["LoginRequestDto"]
    ) : ApiResult<Schemas["AuthResponseDto"]> {

        const response = await apiClient.login(credentials);

        if(response.success && response.data?.accessToken) {
            this.setAccessToken(response.data.accessToken);
        }

        return response;
    }

    async register(
        data: Schemas["RegisterRequestDto"]
    ) : ApiResult<Schemas["RegisterResponseDto"]> {
        return apiClient.register(data);
    }

    async refreshToken() : ApiResult<Schemas["AuthResponseDto"]> {
        const response = await apiClient.refreshToken();

        if(response.success && response.data?.accessToken) {
            this.setAccessToken(response.data?.accessToken);
        }

        return response;
    }

    getProfile() : ApiResult<Schemas["UserDetailResponse"]> {
        return apiClient.getProfile();
    }

    logout() : ApiResult<void> {
        const response = apiClient.logout();
        this.clearAccessToken();
        return response;
    }

    private setAccessToken(token?: string | null): void {
        if (token) {
            useAuth.getState().auth.setToken(token);
        }
    }

    private clearAccessToken(): void {
        useAuth.getState().auth.logout();
    }

    isAuthenticated(): boolean {
        return Boolean(this.getToken());
    }

    getToken(): string | null {
        return useAuth.getState().auth.token;
    }

    // To attempt refresh token and logout user if failed.
    async ensureValidToken(): Promise<void> {

        if (!this.isAuthenticated()) {
            throw new Error("Not authenticated");
        }

        try {
            const response = await this.refreshToken();
            if (!response.success) {
                throw new Error(response.message ?? "Token refresh failed");
            }
            } catch (error) {
                this.clearAccessToken();
                window.location.href = "/login";
                throw error;
        }
    }
}

export const authService = new AuthService();