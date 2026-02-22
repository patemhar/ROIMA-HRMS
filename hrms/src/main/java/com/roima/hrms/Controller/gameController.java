package com.roima.hrms.Controller;

import com.cloudinary.Api;
import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.game.*;
import com.roima.hrms.Service.Interfaces.gameService;
import com.roima.hrms.Service.Implementation.CycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class gameController {

    private final gameService gameService;
    private final CycleService cycleService;

    @PostMapping
    @PreAuthorize("hasAuthority('PER015')")
    public ApiResponse<GameResponseDto> createGame(
            @RequestBody GameCreateRequestDto requestDto
    ) {
        return ApiResponse.success(gameService.createGame(requestDto), "Game Created Successfully!");
    }

    @PatchMapping("/{gameId}")
    @PreAuthorize("hasAuthority('PER015')")
    public ApiResponse<Void> updateGame(
            @RequestBody GameCreateRequestDto request,
            @PathVariable UUID gameId
    ) {

        gameService.updateGame(request, gameId);

        return ApiResponse.success( null, "Game Updated Successfully");
    }

    @GetMapping("/{gameId}")
    @PreAuthorize("hasAuthority('PER016')")
    public ApiResponse<GameResponseDto> getGame(
            @PathVariable UUID gameId
    ) {
        return ApiResponse.success(gameService.getGame(gameId), "Game Fetched Successfully!");
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('PER016')")
    public ApiResponse<List<GameResponseDto>> getAllGames() {

        return ApiResponse.success(gameService.getAllGames(), "ALl Games Fetched Successfully");
    }

    @PostMapping("/book")
    @PreAuthorize("hasAuthority('PER016')")
    public ApiResponse<GameSlotBookingRequestResponse> makeBookingRequest(
            @RequestBody GameSlotBookingRequestDto request
    ) {
        return ApiResponse.success(gameService.makeRequest(request), "Booking request successfully");
    }

    @GetMapping("/{gameId}/slots/{date}")
    @PreAuthorize("hasAuthority('PER016')")
    public ApiResponse<List<SlotResponseDto>> getGameSlots(
            @PathVariable UUID gameId,
            @PathVariable LocalDate date
    ) {
        var slots = gameService.getGameSlots(gameId, date);

        return ApiResponse.success(slots, "Slots fetched for " + date);
    }

    @GetMapping("/{gameId}/cycle")
    @PreAuthorize("hasAuthority('PER016')")
    public ApiResponse<?> getGameCycle(
            @PathVariable UUID gameId
    ) {
        var cycleOpt = gameService.getGameCycle(gameId);

        if (cycleOpt.isPresent()) {
            return ApiResponse.success(cycleOpt.get(), "Game cycle fetched successfully.");
        } else {
            var nextStart = cycleService.getNextCycleStart();
            long minutes = Duration.between(nextStart, LocalDateTime.now()).toMinutes();
            return ApiResponse.success(null, "New cycle will begin in " + minutes + " minutes.");
        }
    }

    @GetMapping("/{gameId}/my-booking")
    @PreAuthorize("hasAuthority('PER016')")
    public ApiResponse<UserActiveBookingDto> getUserActiveBooking(
            @PathVariable UUID gameId
    ) {
        UserActiveBookingDto booking = gameService.getUserActiveBooking(gameId);
        if (booking == null) {
            return ApiResponse.success(null, "No active booking found for this game.");
        }
        return ApiResponse.success(booking, "Active booking fetched successfully.");
    }

    @PatchMapping("/bookings/{bookingId}/cancel")
    @PreAuthorize("hasAuthority('PER016')")
    public ApiResponse<Void> cancelBooking(
            @PathVariable UUID bookingId
    ) {
        gameService.cancelBooking(bookingId);
        return ApiResponse.success(null, "Booking cancelled successfully.");
    }
}
