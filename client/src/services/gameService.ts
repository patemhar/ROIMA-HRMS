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
    ) : ApiResult<void> {
        return apiClient.patch<void> (
            `/games/${id}`,
            data
        )
    }

    getAllGames() : ApiResult<Schemas["GameResponseDto"][]> {
        return apiClient.get(
            '/games/all'
        )
    }

    getGameSlots({
        gameId,
        date
    } : {
        gameId: string,
        date: string
    }) : ApiResult<Schemas["SlotResponseDto"][]> {
        return apiClient.get<Schemas["SlotResponseDto"][]> (
            `/games/${gameId}/slots/${date}`
        )
    }

    getGameById(
        gameId: string
    ) : ApiResult<Schemas["GameResponseDto"]> {
        return apiClient.get<Schemas['GameResponseDto']> (
            `/games/${gameId}`
        )
    }

    getGamecycle(
        gameId: string
    ) : ApiResult<any> {
        return apiClient.get<any> (
            `/games/${gameId}/cycle`
        )
    }

    makeBookingRequest(
        data: Schemas["GameSlotBookingRequestDto"]
    ) : ApiResult<Schemas["GameSlotBookingRequestResponse"]> {
        return apiClient.post<Schemas["GameSlotBookingRequestResponse"]> (
            `/games/book`,
            data
        )
    }

    getUserGameStats() : ApiResult<Schemas["UserCycleStatsDto"][]> {
        return apiClient.get<Schemas["UserCycleStatsDto"][]> (
            `/profiles/game-stats?latest=true`
        )
    }

    getUserActiveBooking(gameId: string) : ApiResult<Schemas["UserActiveBookingDto"]> {
        return apiClient.get<Schemas["UserActiveBookingDto"]> (
            `/games/${gameId}/my-booking`
        )
    }

    cancelBooking(bookingId: string) : ApiResult<void> {
        return apiClient.patch<void> (
            `/games/bookings/${bookingId}/cancel`
        )
    }
}

export const GameService = new gameService();
