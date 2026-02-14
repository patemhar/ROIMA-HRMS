import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { ApiResponse } from "../types/http";
import type { components } from "@/types/api";
import { useAuth } from "@/store";

type Schemas = components["schemas"];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

class ApiClient {

  private readonly client: AxiosInstance;
  private readonly refreshClient: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.refreshClient = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: unknown) => void;
  }> = [];

  private setupInterceptors(): void {

    this.client.interceptors.request.use((config) => {
      const token = useAuth.getState().auth.token;
      if (token) {
        config.headers = config.headers ?? {};
        console.log(token);
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,

      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/api/auth/")
        ) {
          if (this.isRefreshing) {
            // Queue this request while refresh is in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {

            // Use the existing refresh method from our client
            const refreshResponse = await this.refreshClient.post(
              "/auth/refresh",
            );

            const normalized = this.normalizeResponse<any>(refreshResponse.data);

            if (normalized.success) {
              
              this.processQueue(null);

              return this.client(originalRequest);
            }

            throw new Error("Token refresh failed");
          } catch (refreshError) {

            this.processQueue(refreshError);
            this.handleAuthFailure();

            return Promise.reject(refreshError);

          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private processQueue(error: unknown): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve("");
      }
    });
    this.failedQueue = [];
  }

  private handleAuthFailure(): void {
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  //#region Generic Helpers

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return this.normalizeResponse<T>(response.data);
  }

  async post<T>(
    url: string,
    data?:unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return this.normalizeResponse<T>(response.data);
  }

    async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return this.normalizeResponse<T>(response.data);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return this.normalizeResponse<T>(response.data);
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return this.normalizeResponse<T>(response.data);
  }

  async postForm<T>(
    url: string,
    data: FormData | Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    let payload = new FormData;
    if(data instanceof FormData) {
      payload = data;
    } else {
      payload = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if(value !== undefined && value !== null) {
          payload.append(key, value as string | Blob);
        }
      });
    }

    const response = await this.client.post(url, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return this.normalizeResponse<T>(response.data);
  }

  private normalizeResponse<T>(payload: unknown): ApiResponse<T> {
    if (
      payload &&
      typeof payload === "object" &&
      "success" in (payload as Record<string, unknown>)
    ) {
      return payload as ApiResponse<T>;
    }

    return {
      success: true,
      message: null,
      data: payload as T,
      errors: null,
    };
  }

  //#endregion

  //#region Auth

  login(
    data: Schemas["LoginRequestDto"]
  ) : Promise<ApiResponse<Schemas["AuthResponseDto"]>> {
    return this.post<Schemas["AuthResponseDto"]> (
      "auth/login",
       data
    );
  }

  register(
    data: Schemas["RegisterRequestDto"]
  ) : Promise<ApiResponse<Schemas["RegisterResponseDto"]>> {
    return this.post<Schemas["RegisterRequestDto"]>(
      "auth/register",
      data
    )
  }

  refreshToken(): Promise<ApiResponse<Schemas["AuthResponseDto"]>> {
    return this.post<Schemas["AuthResponseDto"]> (
      "auth/refresh"
    )
  }

  logout(): Promise<ApiResponse<void>> {
    return this.post<void>("api/logout")
  }

  getProfile(): Promise<ApiResponse<Schemas["UserDetailResponse"]>> {
    return this.get<Schemas["UserDetailResponse"]> (
      "/users/my"
    )
  }

  //#endregion

}

export const apiClient = new ApiClient();

