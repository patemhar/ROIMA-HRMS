package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Core.Entities.SlotBookingRequest;
import com.roima.hrms.Dtos.game.GameCreateRequestDto;
import com.roima.hrms.Dtos.game.GameResponseDto;
import com.roima.hrms.Dtos.game.GameSlotBookingRequestDto;
import com.roima.hrms.Dtos.game.GameSlotBookingRequestResponse;

import java.util.List;
import java.util.UUID;

public interface gameService {

    GameSlotBookingRequestResponse makeRequest(GameSlotBookingRequestDto request);

    GameResponseDto createGame(GameCreateRequestDto request);

    Void updateGame(GameCreateRequestDto request, UUID gameId);

    GameResponseDto getGame(UUID gameId);

    List<GameResponseDto> getAllGames();
}
