package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.Game;
import com.roima.hrms.Core.Entities.GameBookingCycle;
import com.roima.hrms.Core.Entities.GameSlot;
import com.roima.hrms.Core.Entities.SlotBookingRequest;
import com.roima.hrms.Core.Enums.BookingRequestStatus;
import com.roima.hrms.dtos.game.*;
import com.roima.hrms.Repositories.GameInterestRepository;
import com.roima.hrms.Repositories.GameSlotRepository;
import com.roima.hrms.Repositories.SlotBookingRequestRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

import static java.util.Locale.filter;

@Component
public class GameMapper {

    private ModelMapper modelMapper;
    private GameInterestRepository gameInterestRepository;
    private SlotBookingRequestRepository slotBookingRequestRepository;
    private GameSlotRepository gameSlotRepository;

    public GameMapper(
            ModelMapper modelMapper,
            GameInterestRepository gameInterestRepository,
            SlotBookingRequestRepository slotBookingRequestRepository,
            GameSlotRepository gameSlotRepository
    ) {
        this.modelMapper = modelMapper;
        this.gameInterestRepository = gameInterestRepository;
        this.slotBookingRequestRepository = slotBookingRequestRepository;
        this.gameSlotRepository = gameSlotRepository;
    }

    public GameSlotBookingRequestResponse toGameSlotBookingRequestResponse (SlotBookingRequest request) {
        return modelMapper.map(request, GameSlotBookingRequestResponse.class);
    }

    public Game toEntity(GameCreateRequestDto requestDto) {

        var newGame = new Game();

        newGame.setName(requestDto.getName());
        newGame.setDescription(requestDto.getDescription());
        newGame.setOperatingStartTime(requestDto.getOperatingStartTime());
        newGame.setOperatingEndTime(requestDto.getOperatingEndTime());
        newGame.setMaxPlayers(requestDto.getMaxPlayers());
        newGame.setSlotDurationMinutes(requestDto.getSlotDurationMinutes());
        newGame.setActiveOnWeekends(requestDto.getActiveOnWeekends());

        return newGame;
    }

    public GameResponseDto toGameResponseDto(Game game) {

        var gameResponse = new GameResponseDto();

        gameResponse.setId(game.getId());
        gameResponse.setName(game.getName());
        gameResponse.setDescription(game.getDescription());
        gameResponse.setSlotDurationMinutes(game.getSlotDurationMinutes());
        gameResponse.setMaxPlayersPerSlot(game.getMaxPlayers());
        gameResponse.setStartTime(game.getOperatingStartTime());
        gameResponse.setEndTime(game.getOperatingEndTime());
        gameResponse.setActiveOnWeekends(game.getActiveOnWeekends());
        gameResponse.setActive(game.getActive());

        if(game.getGame_interests() != null) {
            gameResponse.setInterestedCount(game.getGame_interests().size());
        }

        return gameResponse;
    }

    public Game updateGame(Game game, GameCreateRequestDto request) {

        if(request.getName() != null) {
            game.setName(request.getName());
        }
        if(request.getDescription() != null) {
            game.setDescription(request.getDescription());
        }
        if(request.getSlotDurationMinutes() != null) {
            game.setSlotDurationMinutes(request.getSlotDurationMinutes());
        }
        if(request.getOperatingStartTime() != null) {
            game.setOperatingStartTime(request.getOperatingStartTime());
        }
        if(request.getOperatingEndTime() != null) {
            game.setOperatingEndTime(request.getOperatingEndTime());
        }
        if(request.getMaxPlayers() != null) {
            game.setMaxPlayers(request.getMaxPlayers());
        }
        if(request.getActiveOnWeekends() != null) {
            game.setActiveOnWeekends(request.getActiveOnWeekends());
        }

        return game;
    }

    public SlotResponseDto toSlotResponse (GameSlot gameSlot) {

        var slotResponse = new SlotResponseDto();

        slotResponse.setId(gameSlot.getId());
        slotResponse.setGameId(gameSlot.getGame().getId());
        slotResponse.setSlotDate(gameSlot.getSlotDate());
        slotResponse.setStartTime(gameSlot.getStartTime());
        slotResponse.setEndTime(gameSlot.getEndTime());

        var booked = gameSlot.getBookingRequests().stream().anyMatch(request -> request.getStatus() == BookingRequestStatus.CONFIRMED);
        slotResponse.setBooked(booked);

        if(booked) {
            var bookingRequest = gameSlot.getBookingRequests().stream()
                    .filter(request -> request.getStatus() == BookingRequestStatus.CONFIRMED)
                    .findFirst()
                    .orElse(null);

            if(bookingRequest != null) {
                slotResponse.setBookingPriority(bookingRequest.getPriorityScore());
            }

        } else {
            slotResponse.setBookingPriority(null);
        }

        var queue = gameSlot.getBookingRequests().stream()
                .filter(request -> request.getStatus() == BookingRequestStatus.PENDING)
                .count();
        slotResponse.setQueueCount(queue);

        return slotResponse;
    }

    public GameCycleReponseDto toGameCycleResponse (GameBookingCycle gameBookingCycle) {

        var gameCycleResponse = new GameCycleReponseDto();

        gameCycleResponse.setCycleId(gameBookingCycle.getId());
        gameCycleResponse.setCycle_start(gameBookingCycle.getCycle_start());
        gameCycleResponse.setCycle_end(gameBookingCycle.getCycle_end());

        gameCycleResponse.setTotal_slots(gameBookingCycle.getCycle_slots().size());

        return gameCycleResponse;
    }

    public BookingRequestListDto toBookingRequestListDto(SlotBookingRequest request) {
        var dto = new BookingRequestListDto();

        dto.setBookingId(request.getId());
        dto.setCycleId(request.getSlot().getGameCycle().getId());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setStatus(request.getStatus());
        dto.setPriorityScore(request.getPriorityScore());

        // User info
        dto.setRequestedBy(request.getUser().getFirst_name() + " " + request.getUser().getLast_name());
        dto.setRequestedByEmail(request.getUser().getEmail());

        // Slot info
        dto.setSlotDate(request.getSlot().getSlotDate());
        dto.setStartTime(request.getSlot().getStartTime());
        dto.setEndTime(request.getSlot().getEndTime());

        // Game info
        dto.setGameName(request.getSlot().getGame().getName());

        // Participants
        var participants = request.getParticipants().stream()
            .map(sp -> {
                var participantDto = new ParticipantDto();
                participantDto.setUserId(sp.getUser().getId());
                participantDto.setName(sp.getUser().getFirst_name() + " " + sp.getUser().getLast_name());
                participantDto.setEmail(sp.getUser().getEmail());
                return participantDto;
            })
            .collect(Collectors.toList());
        dto.setParticipants(participants);

        return dto;
    }
}
