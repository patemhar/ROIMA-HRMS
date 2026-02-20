import { apiClient } from "./apiClient";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;

class organizationService {

    getNextLayer(
        id: string
    ) : ApiResult<Schemas["nodeResponse"][]> {
        return apiClient.get<Schemas["nodeResponse"][]>(
            `org/${id}`
        )
    }

}

export const orgService = new organizationService();