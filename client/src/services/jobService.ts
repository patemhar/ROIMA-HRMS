import { apiClient } from "./apiClient";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;

class jobService {

    creatJob(
        data: Schemas["JobRequestDto"]
    ) : ApiResult<Schemas["JobResponseDto"]> {
        return apiClient.post<Schemas["JobResponseDto"]> (
            '/api/jobs',
            data
        )
    }

    deleteJob(
        id: string
    ): ApiResult<void> {
        return apiClient.delete(
            `api/jobs/${id}`,
        )
    }

    getAllActiveJobs() : ApiResult<Schemas["JobResponseDto"][]> {
        return apiClient.get<Schemas["JobResponseDto"][]>(
            '/api/jobs/active'
        )
    }

    shareJob(
        data: Schemas["ShareJobRequest"]
    ) : ApiResult<string> {
        return apiClient.post<string>(
            '/api/jobs/share',
            data
        )
    }

    referFriend(
        data: any
    ) : ApiResult<string> {
        return apiClient.postForm<string>(
            '/api/jobs/refer',
            data
        )
    }
}

export const JobService = new jobService();