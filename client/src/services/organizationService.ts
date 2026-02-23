import { apiClient } from "./apiClient";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;

class organizationService {

    getNextLayer(
        id: string
    ) : ApiResult<Schemas["UserDetailResponse"][]> {
        return apiClient.get<Schemas["UserDetailResponse"][]>(
            `org/${id}`
        )
    }

    getMyManager() : ApiResult<Schemas["UserDetailResponse"]> {
        return apiClient.get<Schemas["UserDetailResponse"]>(
            `org/my-manager`
        )
    }

}

export const orgService = new organizationService();