import { apiClient } from "./apiClient";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;

class gameService {

    createGame(
        data: Schemas["GameCreateRequestDto"]
    ) : ApiResult<Schemas["GameResponseDto"]> {
        return apiClient.post<Schemas["GameResponseDto"]> (
            '/games',
            data
        )
    }

    updateGame({
        id,
        data
    } : {
        id: string
        data: Schemas["GameCreateRequestDto"]
    }
    ) : ApiResult<Schemas["GameResponseDto"]> {
        return apiClient.patch<Schemas["GameResponseDto"]> (
            `/games/${id}`,
            data
        )
    }

    getAllGames() : ApiResult<Schemas["GameResponseDto"][]> {
        return apiClient.get(
            '/games/all'
        )
    }

}

export const GameService = new gameService();