import { apiClient } from "./apiClient";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;

class TravelService {

    createTravel (
        data: Schemas["TravelRequest"]
    ) : ApiResult<Schemas["TravelResponseSummary"]> {
        return apiClient.post<Schemas["TravelRequest"]> (
            '/travels',
            data
        );
    }

    getTravelById (
        id: String
    ) : ApiResult<Schemas["TravelResponse"]> {
        return apiClient.get<Schemas["TravelResponse"]> (
            `travels/${id}`
        )
    }

    getMyTravels (pageNumber: number, pageSize: number, searchTerm?: string) : ApiResult<Schemas["PageTravelResponseSummary"]> {
        const params = new URLSearchParams();
        params.append("page", pageNumber.toString());
        params.append("size", pageSize.toString());
        if (searchTerm) {
            params.append("search", searchTerm);
        }
        return apiClient.get<Schemas["PageTravelResponseSummary"]> (
            'travels/my',
            { params }
        )
    }

    getUserTravels (
        id: String
    ) : ApiResult<Schemas["TravelResponseSummary"][]> {
        return apiClient.get<Schemas["TravelResponseSummary"][]> (
            `travels/user/${id}`
        )
    }

    getAllTravels (pageNumber: number, pageSize: number, searchTerm?: string) : ApiResult<Schemas["PageTravelResponseSummary"]> {
        const params = new URLSearchParams();
        params.append("page", pageNumber.toString());
        params.append("size", pageSize.toString());
        if (searchTerm) {
            params.append("search", searchTerm);
        }
        return apiClient.get<Schemas["PageTravelResponseSummary"]> (
            '/travels',
            { params }
        )
    }

    updateTravel ({
        id,
        data
    } : {
        id: String
        data: Schemas["TravelUpdateRequest"]
    }
    ) : ApiResult<void> {
        return apiClient.patch<void> (
            `travels/${id}`,
            data
        )
    }

    cancelTravel (
        id: String
    ) : ApiResult<void> {
        return apiClient.post<void> (
            `travels/${id}/cancel`
        )
    }

    deleteTravel (
        id: String
    ) : ApiResult<void> {
        return apiClient.delete<void> (
            `travels/${id}`
        )
    }

    addMember (
        travelId: string,
        userId: string
    ) : ApiResult<Schemas["TravelMemberResponse"]> {
        return apiClient.post<Schemas["TravelMemberResponse"]> (
            `/travels/${travelId}/members/${userId}`
        )
    }

    deleteMember (
        id: String
    ) : ApiResult<void> {
        return apiClient.delete<void> (
            `travels/members/${id}`
        )
    }

    addItinerary (
        id: string,
        data: Schemas["TravelItineraryRequest"]
    ) : ApiResult<Schemas["TravelItineraryResponse"]> {
        return apiClient.post<Schemas["TravelItineraryResponse"]> (
            `/travels/${id}/itinerary`,
            data
        )
    }

    getItineraries (
        id: string,
    ) : ApiResult<Schemas["TravelItineraryResponse"][]> {
        return apiClient.get<Schemas["TravelItineraryResponse"][]> (
            `/travels/${id}/itinerary`
        )
    }

    updateItinerary (
        id: String,
        data: Schemas["TravelItineraryRequest"]
    ) : ApiResult<void> {
        return apiClient.patch<void> (
            `/travels/itinerary/${id}`,
            data
        )
    }

    addBooking (
        id: string,
        data: Schemas["TravelBookingRequest"]
    ) : ApiResult<Schemas["TravelBookingResponse"]> {
        return apiClient.post<Schemas["TravelBookingResponse"]> (
            `/travels/${id}/booking`,
            data
        )
    }

    getBooking (
        id: string,
    ) : ApiResult<Schemas["TravelBookingResponse"][]> {
        return apiClient.get<Schemas["TravelBookingResponse"][]> (
            `/travels/${id}/booking`
        )
    }

    updateBooking (
        id: String,
        data: Schemas["TravelBookingRequest"]
    ) : ApiResult<void> {
        return apiClient.patch<void> (
            `/travels/booking/${id}`,
            data
        )
    }

    deleteBooking (
        id: String
    ) : ApiResult<void> {
        return apiClient.delete<void> (
            `/travels/booking/${id}`
        )
    }

    uploadTravelDocs(
        id: String,
        files: File[]
    ): ApiResult<Schemas["DocUploadResponse"]> {

        const formData = new FormData();
        
        for (const file of files) {
          formData.append("files", file);
        }
        
        return apiClient.postForm<Schemas["DocUploadResponse"]>(
            `/travels/${id}/documents`,
            formData
        );
    }

    getTravelDocs(
        id: String
    ) : ApiResult<Schemas["TravelDocumentResponseDto"][]> {
        return apiClient.get<Schemas["TravelDocumentResponseDto"][]>(
            `/travels/${id}/documents`
        );
    }

    deleteTravelDocument(
        id: String
    ) : ApiResult<void> {
        return apiClient.delete<void> (
            `/travels/documents/${id}`
        )
    }

    addExpense(
        id: String,
        data: Schemas["TravelExpenseRequest"]
    ) : ApiResult<Schemas["TravelExpenseResponse"]> {
         return apiClient.post<Schemas["TravelExpenseResponse"]>(
            `/travels/${id}/expenses`,
            data
        );
    }

    getExpenses(
        id: String
    ) : ApiResult<Schemas["TravelExpenseResponse"][]> {
        return apiClient.get<Schemas["TravelExpenseResponse"][]> (
            `/travels/${id}/expenses`
        )
    }

    approveExpense(
        id: String,
        remark: String
    ) : ApiResult<void> {
        return apiClient.put<void> (
            `/travels/expenses/${id}/approve`,
            remark
        )
    }

    rejectExpense(
        id: String,
        remark: String
    ) : ApiResult<void> {
        return apiClient.put<void> (
            `/travels/expenses/${id}/reject`,
            remark
        )
    }

    uploadExpenseDoc(
        id: String,
        files: File[]
    ): ApiResult<Schemas["DocUploadResponse"]> {

        const formData = new FormData();
        
        for (const file of files) {
          formData.append("files", file);
        }
        
        return apiClient.postForm<Schemas["DocUploadResponse"]>(
            `/travels/expenses/${id}/documents`,
            formData
        );
    }

    getExpenseDocs(
        id: String
    ) : ApiResult<Schemas["ExpenseDocumentResponseDto"][]> {
        return apiClient.get<Schemas["ExpenseDocumentResponseDto"][]> (
            `/travels/expenses/${id}/documents`
        );
    }

    deleteExpense(
        id: String
    ) : ApiResult<void> {
        return apiClient.delete<void> (
            `/travels/expenses/${id}`
        )
    }

    deleteExpenseDocument(
        id: String
    ) : ApiResult<void> {
        return apiClient.delete<void> (
            `/travels/expenses/documents/${id}`
        )
    }
}

export const travelService = new TravelService();