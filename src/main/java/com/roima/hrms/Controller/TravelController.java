package com.roima.hrms.Controller;

import com.roima.hrms.Core.Entities.ExpenseDocument;
import com.roima.hrms.Core.Entities.TravelDocument;
import com.roima.hrms.Service.Implementation.CustomUserDetails;
import com.roima.hrms.Service.Implementation.CustomUserDetailsService;
import com.roima.hrms.Service.Interfaces.ExpenseDocumentService;
import com.roima.hrms.Service.Interfaces.TravelDocumentService;
import com.roima.hrms.Service.Interfaces.TravelExpenseService;
import com.roima.hrms.Service.Interfaces.TravelService;
import com.roima.hrms.Shared.Dtos.ApiResponse;
import com.roima.hrms.Shared.Dtos.DocUploadResponse;
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
@RequestMapping("/travels")
@RequiredArgsConstructor
public class TravelController {

    private final TravelService travelService;
    private final TravelDocumentService travelDocumentService;
    private final TravelExpenseService travelExpenseService;
    private final ExpenseDocumentService expenseDocumentService;
    private final SecurityUtil securityUtil;


    // Travel

    @PostMapping
//    @PreAuthorize("HasRole('HR')")
    public ApiResponse<TravelResponseSummary> createTravel(
            @RequestBody TravelRequest request) {

        return ApiResponse.success(
                travelService.createTravel(request),
                "Travel created successfully"
        );
    }

    @GetMapping("/{travelId}")
//    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<TravelResponse> getTravel(
            @PathVariable UUID travelId) {

        return ApiResponse.success(
                travelService.getTravel(travelId),
                "Travel fetched successfully"
        );
    }

    @GetMapping("/my")
//    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<List<TravelResponseSummary>> getMyTravels() {

        return ApiResponse.success(
                travelService.getMyTravel(),
                "Travels fetched successfully"
        );
    }

    // travels that are created by user
    @GetMapping("/user/{userId}")
//    @PreAuthorize("hasAnyRole('MANAGER','HR')")
    public ApiResponse<List<TravelResponseSummary>> getUserTravels(
            @PathVariable UUID userId
    ) {

        return ApiResponse.success(
                travelService.getTravelsForUser(userId),
                "Travels fetched successfully"
        );
    }

    @GetMapping
//    @PreAuthorize("hasRole('HR')")
    public ApiResponse<List<TravelResponseSummary>> getAllTravels() {

        return ApiResponse.success(
                travelService.getTravels(),
                "Travels fetched successfully"
        );
    }

    @DeleteMapping("/{travelId}")
//    @PreAuthorize("hasRole('HR')")
    public ApiResponse<Void> deleteTravel(@PathVariable UUID travelId) {

        travelService.deleteTravel(travelId);

        return ApiResponse.success(null, "Travel deleted successfully");
    }


    // Travel Member

    @PostMapping("/{travelId}/members")
//    @PreAuthorize("hasAnyRole('HR','MANAGER')")
    public ApiResponse<Set<TravelMemberResponse>> addMember(
            @PathVariable UUID travelId,
            @RequestBody TravelMemberRequest request) {

        return ApiResponse.success(
                travelService.addTravelMember(travelId, request),
                "Member added successfully"
        );
    }


    // Travel Itinerary

    @PostMapping("/{travelId}/itinerary")
//    @PreAuthorize("hasRole('HR')")
    public ApiResponse<TravelItineraryResponse> addItinerary(
            @PathVariable UUID travelId,
            @RequestBody TravelItineraryRequest request) {

        return ApiResponse.success(
                travelService.addTravelItinerary(travelId, request),
                "Itinerary added successfully"
        );
    }

    @GetMapping("/{travelId}/itinerary")
//    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<List<TravelItineraryResponse>> getItinerary(
            @PathVariable UUID travelId) {

        return ApiResponse.success(
                travelService.getTravelItineraries(travelId),
                "Itinerary fetched successfully"
        );
    }


    // Travel Booking

    @PostMapping("/{travelId}/booking")
//    @PreAuthorize("hasRole('HR')")
    public ApiResponse<TravelBookingResponse> addBooking(
            @PathVariable UUID travelId,
            @RequestBody TravelBookingRequest request) {

        return ApiResponse.success(
                travelService.addTravelBooking(travelId, request),
                "Booking added successfully"
        );
    }

    @GetMapping("/{travelId}/booking")
//    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<List<TravelBookingResponse>> getBookings(
            @PathVariable UUID travelId) {

        return ApiResponse.success(
                travelService.getTravelBookings(travelId),
                "Bookings fetched successfully"
        );
    }


    // Travel Doc

    @PostMapping("/{travelId}/documents")
//    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<DocUploadResponse> uploadTravelDocument(
            @PathVariable UUID travelId,
            @RequestBody TravelDocRequest request) {

        return ApiResponse.success(
                travelDocumentService.addTravelDocs(travelId, request),
                "Document uploaded successfully"
        );
    }

    @GetMapping("/{travelId}/documents")
//    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<List<TravelDocument>> getTravelDocuments(
            @PathVariable UUID travelId) {

        return ApiResponse.success(
                travelDocumentService.getTravelDocs(travelId),
                "Documents fetched successfully"
        );
    }


    // Expense

    @PostMapping("/{travelId}/expenses")
//    @PreAuthorize("hasAnyRole('EMPLOYEE','HR')")
    public ApiResponse<TravelExpenseResponse> addExpense(
            @PathVariable UUID travelId,
            @RequestBody TravelExpenseRequest request) {

        return ApiResponse.success(
                travelExpenseService.addTravelExpense(travelId, request),
                "Expense added successfully"
        );
    }

    @GetMapping("/{travelId}/expenses")
//    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<List<TravelExpenseResponse>> getExpenses(
            @PathVariable UUID travelId) {

        return ApiResponse.success(
                travelExpenseService.getAllExpenses(travelId),
                "Expenses fetched successfully"
        );
    }

    @PutMapping("/expenses/{expenseId}/approve")
//    @PreAuthorize("hasRole('HR')")
    public ApiResponse<Void> approveExpense(
            @PathVariable UUID expenseId,
            @RequestParam String remark) {

        travelExpenseService.approveExpense(expenseId, remark);
        return ApiResponse.success(null, "Expense approved");
    }

    @PutMapping("/expenses/{expenseId}/reject")
//    @PreAuthorize("hasRole('HR')")
    public ApiResponse<Void> rejectExpense(
            @PathVariable UUID expenseId,
            @RequestParam String remark) {

        travelExpenseService.rejectExpense(expenseId, remark);
        return ApiResponse.success(null, "Expense rejected");
    }


    // Expense Doc

    @PostMapping("/expenses/{expenseId}/documents")
//    @PreAuthorize("hasAnyRole('EMPLOYEE','HR')")
    public ApiResponse<DocUploadResponse> uploadExpenseDocs(
            @PathVariable UUID expenseId,
            @ModelAttribute ExpenseDocRequest request) {

        return ApiResponse.success(
                expenseDocumentService.addExpenseDocs(expenseId, request),
                "Expense documents uploaded"
        );
    }

    @GetMapping("/expenses/{expenseId}/documents")
//    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<List<ExpenseDocument>> getExpenseDocs(
            @PathVariable UUID expenseId) {

        return ApiResponse.success(
                expenseDocumentService.getTravelExpenseDocs(expenseId),
                "Expense documents fetched"
        );
    }
}
