package com.roima.hrms.Controller;

import com.roima.hrms.Core.Entities.ExpenseDocument;
import com.roima.hrms.Core.Entities.Notification;
import com.roima.hrms.Core.Entities.TravelDocument;
import com.roima.hrms.Core.Enums.EntityType;
import com.roima.hrms.Core.Enums.NotificationType;
import com.roima.hrms.Dtos.Travel.*;
import com.roima.hrms.Service.Interfaces.*;
import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.DocUploadResponse;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
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
    private final NotificationService notificationService;

    // Travel

    @PostMapping
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<TravelResponseSummary> createTravel(@RequestBody @Valid TravelRequest request) {
        return ApiResponse.success(travelService.createTravel(request), "Travel created successfully");
    }

    @GetMapping("/{travelId}")
    public ApiResponse<TravelResponse> getTravel(@PathVariable UUID travelId) {
        return ApiResponse.success(travelService.getTravel(travelId), "Travel fetched successfully");
    }

    @GetMapping("/my")
    public ApiResponse<List<TravelResponseSummary>> getMyTravels() {
        return ApiResponse.success(travelService.getMyTravel(), "Travels fetched successfully");
    }

    // travels that are created by user
    @GetMapping("/user/{userId}")
    public ApiResponse<List<TravelResponseSummary>> getUserTravels(@PathVariable UUID userId) {
        return ApiResponse.success(travelService.getTravelsForUser(userId), "Travels fetched successfully");
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PER023')")
    public ApiResponse<List<TravelResponseSummary>> getAllTravels() {
        return ApiResponse.success(travelService.getTravels(), "Travels fetched successfully");
    }

    @PatchMapping("/{travelId}")
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<Void> updateTravel(@PathVariable UUID travelId, @RequestBody @Valid TravelUpdateRequest request) {
        travelService.updateTravel(travelId, request);
        return ApiResponse.success(null, "Travel updated successfully.");
    }

    @DeleteMapping("/{travelId}")
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<Void> deleteTravel(@PathVariable UUID travelId) {
        travelService.deleteTravel(travelId);
        return ApiResponse.success(null, "Travel deleted successfully");
    }


    // Travel Member

    @PostMapping("/{travelId}/members/{userId}")
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<TravelMemberResponse> addMember(@PathVariable UUID travelId, @PathVariable UUID userId) {
        return ApiResponse.success(travelService.addTravelMember(travelId, userId), "Member added successfully");
    }


    @DeleteMapping("/members/{memberId}")
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<Void> deleteMember(@PathVariable UUID memberId) {
        travelService.deleteMember(memberId);
        return ApiResponse.success(null, "Member Removed Successfully.");
    }

    // Travel Itinerary

    @PostMapping("/{travelId}/itinerary")
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<TravelItineraryResponse> addItinerary(@PathVariable UUID travelId, @RequestBody @Valid TravelItineraryRequest request) {
        return ApiResponse.success(travelService.addTravelItinerary(travelId, request), "Itinerary added successfully");
    }

    @GetMapping("/{travelId}/itinerary")
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<List<TravelItineraryResponse>> getItinerary(@PathVariable UUID travelId) {
        return ApiResponse.success(travelService.getTravelItineraries(travelId), "Itinerary fetched successfully");
    }

    @PatchMapping("/itinerary/{itineraryId}")
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<Void> updateItinerary(@PathVariable UUID itineraryId, @RequestBody @Valid TravelItineraryRequest request) {
        travelService.updateItinerary(itineraryId, request);
        return ApiResponse.success(null, "Itinerary updated successfully");
    }

    // Travel Booking

    @PostMapping("/{travelId}/booking")
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<TravelBookingResponse> addBooking(@PathVariable UUID travelId, @RequestBody @Valid TravelBookingRequest request) {
        return ApiResponse.success(travelService.addTravelBooking(travelId, request), "Booking added successfully");
    }

    @GetMapping("/{travelId}/booking")
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<List<TravelBookingResponse>> getBookings(@PathVariable UUID travelId) {
        return ApiResponse.success(travelService.getTravelBookings(travelId), "Bookings fetched successfully");
    }

    @PatchMapping("booking/{bookingId}")
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<Void> updateBooking(@PathVariable UUID bookingId, @RequestBody @Valid TravelBookingRequest request) {
        travelService.updateBooking(bookingId, request);
        return ApiResponse.success(null, "Booking updated successfully.");
    }

    @DeleteMapping("booking/{bookingId}")
    @PreAuthorize("hasAuthority('PER010')")
    public ApiResponse<Void> deleteBooking(@PathVariable UUID bookingId) {
        travelService.deleteBooking(bookingId);
        return ApiResponse.success(null, "Booking deleted successfully.");
    }


    // Travel Doc

    @PostMapping("/{travelId}/documents")
    @PreAuthorize("hasAuthority('PER021')")
    public ApiResponse<DocUploadResponse> uploadTravelDocument(@PathVariable UUID travelId, @RequestParam("files") MultipartFile[] files) throws IOException {
        return ApiResponse.success(travelDocumentService.addTravelDocs(travelId, files), "Document uploaded successfully");
    }

    @GetMapping("/{travelId}/documents")
    @PreAuthorize("hasAuthority('PER021')")
    public ApiResponse<List<TravelDocumentResponseDto>> getTravelDocuments(@PathVariable UUID travelId) {
        return ApiResponse.success(travelDocumentService.getTravelDocs(travelId), "Documents fetched successfully");
    }

    @DeleteMapping("/documents/{docId}")
    @PreAuthorize("hasAuthority('PER021')")
    public ApiResponse<Void> deleteTravelDocument(@PathVariable UUID docId) {
        travelDocumentService.deleteTravelDoc(docId);
        return ApiResponse.success(null, "Document deleted successfully");
    }


    // Expense

    @PostMapping("/{travelId}/expenses")
    @PreAuthorize("hasAuthority('PER021')")
    public ApiResponse<TravelExpenseResponse> addExpense(@PathVariable UUID travelId, @RequestBody @Valid TravelExpenseRequest request) {
        return ApiResponse.success(travelExpenseService.addTravelExpense(travelId, request), "Expense added successfully");
    }

    @GetMapping("/{travelId}/expenses")
    @PreAuthorize("hasAuthority('PER021')")
    public ApiResponse<List<TravelExpenseResponse>> getExpenses(@PathVariable UUID travelId) {
        return ApiResponse.success(travelExpenseService.getAllExpenses(travelId), "Expenses fetched successfully");
    }

    @PutMapping("/expenses/{expenseId}/approve")
    @PreAuthorize("hasAuthority('PER014')")
    public ApiResponse<Void> approveExpense(@PathVariable UUID expenseId, @RequestBody String remark) {
        travelExpenseService.approveExpense(expenseId, remark);
        return ApiResponse.success(null, "Expense approved");
    }

    @PutMapping("/expenses/{expenseId}/reject")
    @PreAuthorize("hasAuthority('PER014')")
    public ApiResponse<Void> rejectExpense(@PathVariable UUID expenseId, @RequestBody String remark) {
        travelExpenseService.rejectExpense(expenseId, remark);
        return ApiResponse.success(null, "Expense rejected");
    }

    @DeleteMapping("/expenses/{expenseId}")
    @PreAuthorize("hasAuthority('PER021')")
    public ApiResponse<Void> deleteExpense(@PathVariable UUID expenseId) {
        travelExpenseService.deleteExpense(expenseId);
        return ApiResponse.success(null, "Expense deleted successfully");
    }


    // Expense Doc

    @PostMapping("/expenses/{expenseId}/documents")
    @PreAuthorize("hasAuthority('PER021')")
    public ApiResponse<DocUploadResponse> uploadExpenseDocs(@PathVariable UUID expenseId, @RequestParam("files") MultipartFile[] files) throws IOException {
        return ApiResponse.success(expenseDocumentService.addExpenseDocs(expenseId, files), "Expense documents uploaded");
    }

    @GetMapping("/expenses/{expenseId}/documents")
    @PreAuthorize("hasAuthority('PER021')")
    public ApiResponse<List<ExpenseDocumentResponseDto>> getExpenseDocs(@PathVariable UUID expenseId) {
        return ApiResponse.success(expenseDocumentService.getTravelExpenseDocs(expenseId), "Expense documents fetched");
    }

    @DeleteMapping("/expenses/documents/{docId}")
    @PreAuthorize("hasAuthority('PER021')")
    public ApiResponse<Void> deleteExpenseDocument(@PathVariable UUID docId) {
        expenseDocumentService.deleteExpenseDoc(docId);
        return ApiResponse.success(null, "Expense document deleted successfully");
    }
}
