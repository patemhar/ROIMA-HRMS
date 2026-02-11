package com.roima.hrms.Controller;

import com.roima.hrms.Service.Implementation.CustomUserDetails;
import com.roima.hrms.Service.Implementation.CustomUserDetailsService;
import com.roima.hrms.Service.Interfaces.TravelDocumentService;
import com.roima.hrms.Service.Interfaces.TravelService;
import com.roima.hrms.Shared.Dtos.ApiResponse;
import com.roima.hrms.Shared.Dtos.Travel.*;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

// content according to relation pending,

@RestController
@RequestMapping("/api/travels")
@RequiredArgsConstructor
public class TravelController {

    private final TravelService travelService;
    private final TravelDocumentService travelDocumentService;
    private final SecurityUtil securityUtil;

    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public ApiResponse<TravelResponseSummary> createTravel(
            @RequestBody TravelRequest request) {

        var userId = securityUtil.getCurrentUser().getId();

        TravelResponseSummary response =
                travelService.createTravel(request, userId);

        return ApiResponse.success(response,
                "Travel created successfully");
    }

    @GetMapping("/{travelId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<TravelResponse> getTravel(
            @PathVariable UUID travelId) {

        TravelResponse response =
                travelService.getTravel(travelId);

        return ApiResponse.success(response,
                "Travel fetched successfully");
    }


    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<List<TravelResponseSummary>> getAllTravels() {

        return ApiResponse.success(
                travelService.getAll(),
                "Travels fetched successfully"
        );
    }


    @GetMapping("/travels/{userId}")
    public ApiResponse<List<TravelResponseSummary>> getUserTravels(@PathVariable UUID userId) {

        return ApiResponse.success(
                travelService.getTravelsForUser(userId),
                "Travels fetched successfully for user"
        );
    }


    @PostMapping("/{travelId}/members")
    @PreAuthorize("hasAnyRole('MANAGER','HR')")
    public ApiResponse<Set<TravelMemberResponse>> addMember(
            @PathVariable UUID travelId,
            @RequestBody TravelMemberRequest request) {

        var travelMembers = travelService.addTravelMember(travelId, request);

        return ApiResponse.success(travelMembers,
                "Member added successfully");
    }


    @PostMapping("/{travelId}/itinerary")
    @PreAuthorize("hasRole('HR')")
    public ApiResponse<TravelItineraryResponse> addItinerary(
            @PathVariable UUID travelId,
            @RequestBody TravelItineraryRequest request) {

        var travelItinerary = travelService.addTravelItinerary(travelId, request);

        return ApiResponse.success( travelItinerary,
                "Itinerary added successfully");
    }

    @GetMapping("/{travelId}/itinerary")
    @PreAuthorize("hasRole('HR')")
    public ApiResponse<List<TravelItineraryResponse>> addItinerary(
            @PathVariable UUID travelId) {

        var travelItinerary = travelService.getTravelItineraries(travelId);

        return ApiResponse.success( travelItinerary,
                "Itinerary added successfully");
    }

    @PostMapping("/{travelId}/booking")
    @PreAuthorize("hasRole('HR')")
    public ApiResponse<TravelBookingResponse> addBooking(
            @PathVariable UUID travelId,
            @RequestBody TravelBookingRequest request) {

        var travelItinerary = travelService.addTravelBooking(travelId, request);

        return ApiResponse.success( travelItinerary,
                "Travel booking added successfully");
    }

    @GetMapping("/{travelId}/booking")
    @PreAuthorize("hasAnyRole('HR', 'EMPLOYEE', 'MANAGER')")
    public ApiResponse<List<TravelBookingResponse>> getBooking(
            @PathVariable UUID travelId) {

        var travelItinerary = travelService.getTravelBookings(travelId);

        return ApiResponse.success( travelItinerary,
                "Travel booking added successfully");
    }


    // pending
    @PostMapping("/{travelId}/documents")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<String> uploadDocument(
            @PathVariable UUID travelId,
            @RequestBody TravelDocRequest request) {

        travelDocumentService.addTravelDocs(travelId, request);

        return ApiResponse.success(null,
                "Document uploaded successfully");
    }


    @DeleteMapping("/{travelId}")
    @PreAuthorize("hasRole('HR')")
    public ApiResponse<String> deleteTravel(
            @PathVariable UUID travelId) {

        travelService.deleteTravel(travelId);

        return ApiResponse.success(null,
                "Travel deleted successfully");
    }
}