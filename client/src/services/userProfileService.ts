import { apiClient } from "./apiClient";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;

class UserProfileService {

  async createProfile (
    data: Schemas["ProfileAdminRequestDTO"]
  ) : ApiResult<Schemas["ProfileResponseDTO"]> {
    return apiClient.post(
      '/profiles',
      data
    )
  }

  async updateProfile (
    data: Schemas["ProfileAdminRequestDTO"]
  ) : ApiResult<Schemas["ProfileResponseDTO"]> {
    return apiClient.patch(
      '/profiles',
      data
    )
  }

  async updateMyProfile (
    data: Schemas["ProfileSelfUpdateDTO"]
  ) : ApiResult<Schemas["ProfileResponseDTO"]> {
    return apiClient.patch(
      'profiles/me',
      data
    )
  }

  async getMyProfile(): ApiResult<Schemas["ProfileResponseDTO"]> {
    return apiClient.get("/profiles/me");
  }

  async uploadAvatar(file: File)
    : ApiResult<void> {

    const formData = new FormData();
    formData.append("file", file);

    return apiClient.postForm("/profiles/avatar", formData);
  }


  async getProfile(
    userId: string
  ) : ApiResult<Schemas["ProfileResponseDTO"]> {
    return apiClient.get(
      `profiles/${userId}`
    )
  }
}

export const userProfileService = new UserProfileService();
