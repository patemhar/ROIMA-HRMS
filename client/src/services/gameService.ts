import { apiClient } from "./apiClient";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";
import type { Search } from "lucide-react";

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

    toggleGameActive(
        gameId: string
    ) : ApiResult<void> {
        return apiClient.post<void> (
            `/games/${gameId}/toggle-active`
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

    getAllGameBookingRequests(
        pageNumber: number = 1,
        pageSize: number = 10,
        searchTerm?: string,
        startDate?: string,
        endDate?: string,
        status?: string,
        sortBy?: string,
        sortDir?: string,
        myRequests?: boolean
    ) : ApiResult<Schemas["PageBookingRequestListDto"]> {

        const params = new URLSearchParams();
        params.append("pageNumber", pageNumber.toString());
        params.append("pageSize", pageSize.toString());

        if (searchTerm) {
            params.append("searchTerm", searchTerm);
        }

        if (startDate) {
            params.append("startDate", startDate);
        }

        if (endDate) {
            params.append("endDate", endDate);
        }

        if (status) {
            params.append("status", status);
        }

        if (sortBy) {
            params.append("sortBy", sortBy);
        }

        if (sortDir) {
            params.append("sortDir", sortDir);
        }

        if (myRequests) {
            params.append("myRequests", myRequests.toString());
        }

        return apiClient.get<Schemas["PageBookingRequestListDto"]> (
            '/games/bookings',
            { params }
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

    getUserGameStatsPaginated({
        userId,
        gameId,
        cycleId,
        startDate,
        endDate,
        pageNumber = 1,
        pageSize = 10,
        sortBy,
        sortDir
    }: {
        userId?: string,
        gameId?: string,
        cycleId?: string,
        startDate?: string,
        endDate?: string,
        pageNumber?: number,
        pageSize?: number,
        sortBy?: string,
        sortDir?: string
    }) : ApiResult<Schemas["PageUserCycleStatsDto"]> {
        const params = new URLSearchParams();
        params.append("pageNumber", pageNumber.toString());
        params.append("pageSize", pageSize.toString());

        if (userId) params.append("userId", userId);
        if (gameId) params.append("gameId", gameId);
        if (cycleId) params.append("cycleId", cycleId);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);

        return apiClient.get<Schemas["PageUserCycleStatsDto"]> (
            '/games/stats',
            { params }
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
