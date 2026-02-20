import { apiClient } from "./apiClient";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;

class UtilService {
  async getAllDepartments(): ApiResult<Schemas['departmentOptions'][]> {
    return await apiClient.get("/api/util/dept");
  }

  async getAllUsers(): ApiResult<Schemas['userOptions'][]> {
    return apiClient.get("/api/util/users");
  }

  async getAllTravelMembers(
    id: string
  ): ApiResult<Schemas["userOptions"][]> {
    return apiClient.get(`/api/util/members/${id}`);
  }

  async getAllRoles() : ApiResult<Schemas["roleOptions"][]> {
    return apiClient.get('api/util/roles');
  }

  async getAllGames(): ApiResult<Schemas['GameResponseDto'][]> {
    return apiClient.get("/api/util/games");
  }
}

export const utilService = new UtilService();
