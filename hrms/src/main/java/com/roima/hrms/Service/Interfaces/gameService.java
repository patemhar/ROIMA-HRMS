package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Core.Entities.SlotBookingRequest;
import com.roima.hrms.Dtos.game.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface gameService {

    GameSlotBookingRequestResponse makeRequest(GameSlotBookingRequestDto request);

    GameResponseDto createGame(GameCreateRequestDto request);

    Void updateGame(GameCreateRequestDto request, UUID gameId);

    GameResponseDto getGame(UUID gameId);

    List<GameResponseDto> getAllGames();

    List<SlotResponseDto> getGameSlots(UUID gameId, LocalDate date);

    Optional<GameCycleReponseDto> getGameCycle(UUID gameId);

    UserActiveBookingDto getUserActiveBooking(UUID gameId);

    void cancelBooking(UUID bookingId);
}
