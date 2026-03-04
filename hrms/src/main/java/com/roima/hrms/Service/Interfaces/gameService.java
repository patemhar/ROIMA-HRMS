package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.dtos.game.*;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface gameService {

    GameSlotBookingRequestResponse makeRequest(GameSlotBookingRequestDto request);

    GameResponseDto createGame(GameCreateRequestDto request);

    Void toggleGameActiveStatus(UUID gameId);

    Void updateGame(GameCreateRequestDto request, UUID gameId);

    GameResponseDto getGame(UUID gameId);

    List<GameResponseDto> getAllGames();

    List<SlotResponseDto> getGameSlots(UUID gameId, LocalDate date);

    Optional<GameCycleReponseDto> getGameCycle(UUID gameId);

    UserActiveBookingDto getUserActiveBooking(UUID gameId);

    void processExpiredBookings();

    void cancelBooking(UUID bookingId);

    Page<BookingRequestListDto> getAllBookingRequests(int page, int size, String search);
}
