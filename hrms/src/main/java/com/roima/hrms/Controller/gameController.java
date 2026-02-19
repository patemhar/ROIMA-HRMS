package com.roima.hrms.Controller;

import com.cloudinary.Api;
import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.game.GameCreateRequestDto;
import com.roima.hrms.Dtos.game.GameResponseDto;
import com.roima.hrms.Dtos.game.GameSlotBookingRequestDto;
import com.roima.hrms.Dtos.game.GameSlotBookingRequestResponse;
import com.roima.hrms.Service.Interfaces.gameService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

}
