package com.roima.hrms.Controller;

import com.cloudinary.Api;
import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.game.*;
import com.roima.hrms.Service.Interfaces.gameService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class gameController {

    private final gameService gameService;

    @PostMapping
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<GameResponseDto> createGame(
            @RequestBody GameCreateRequestDto requestDto
    ) {
        return ApiResponse.success(gameService.createGame(requestDto), "Game Created Successfully!");
    }

    @PatchMapping("/{gameId}")
    public ApiResponse<Void> updateGame(
            @RequestBody GameCreateRequestDto request,
            @PathVariable UUID gameId
    ) {

        gameService.updateGame(request, gameId);

        return ApiResponse.success( null, "Game Updated Successfully");
    }

    @GetMapping("/{gameId}")
    public ApiResponse<GameResponseDto> getGame(
            @PathVariable UUID gameId
    ) {
        return ApiResponse.success(gameService.getGame(gameId), "Game Fetched Successfully!");
    }

    @GetMapping("/all")
    public ApiResponse<List<GameResponseDto>> getAllGames() {

        return ApiResponse.success(gameService.getAllGames(), "ALl Games Fetched Successfully");
    }

    @PostMapping("/{gameId}/book")
    public ApiResponse<GameSlotBookingRequestResponse> makeBookingRequest(
            @PathVariable UUID gameId,
            @RequestBody GameSlotBookingRequestDto request
    ) {
        return ApiResponse.success(gameService.makeRequest(request), "Booking request successfully");
    }

    @GetMapping("/{gameId}/slots/{date}")
    public ApiResponse<List<SlotResponseDto>> getGameSlots(
            @PathVariable UUID gameId,
            @PathVariable LocalDate date
    ) {
        var slots = gameService.getGameSlots(gameId, date);

        return ApiResponse.success(slots, "Slots fetched for " + date);
    }

    @GetMapping("/{gameId}/cycle")
    public ApiResponse<GameCycleReponseDto> getGameCycle(
            @PathVariable UUID gameId
    ) {
        return ApiResponse.success(gameService.getGameCycle(gameId), "Game cycle fetched successfully.");
    }
}
