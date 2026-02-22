package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.Game;
import com.roima.hrms.Core.Entities.GameBookingCycle;
import com.roima.hrms.Core.Entities.GameSlot;
import com.roima.hrms.Core.Entities.SlotBookingRequest;
import com.roima.hrms.Dtos.game.*;
import com.roima.hrms.Repositories.GameInterestRepository;
import com.roima.hrms.Repositories.GameSlotRepository;
import com.roima.hrms.Repositories.SlotBookingRequestRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import org.springframework.ui.ModelMap;

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

        System.out.println("\n\nrequest: " + requestDto.getMaxPlayers());

        newGame.setName(requestDto.getName());
        newGame.setDescription(requestDto.getDescription());
        newGame.setOperatingStartTime(requestDto.getOperatingStartTime());
        newGame.setOperatingEndTime(requestDto.getOperatingEndTime());
        newGame.setMaxPlayers(requestDto.getMaxPlayers());
        newGame.setSlotDurationMinutes(requestDto.getSlotDurationMinutes());

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

        gameResponse.setInterestedCount(gameInterestRepository.countInterestedUsers(game.getId()));

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

        return game;
    }

    public SlotResponseDto toSlotResponse (GameSlot gameSlot) {

        var slotResponse = new SlotResponseDto();

        slotResponse.setId(gameSlot.getId());
        slotResponse.setGameId(gameSlot.getGame().getId());
        slotResponse.setSlotDate(gameSlot.getSlotDate());
        slotResponse.setStartTime(gameSlot.getStartTime());
        slotResponse.setEndTime(gameSlot.getEndTime());

        var queue = slotBookingRequestRepository.getQueueCount(gameSlot.getId());
        slotResponse.setQueueCount(queue);

        return slotResponse;
    }

    public GameCycleReponseDto toGameCycleResponse (GameBookingCycle gameBookingCycle) {

        var gameCycleResponse = new GameCycleReponseDto();

        gameCycleResponse.setCycleId(gameBookingCycle.getId());
        gameCycleResponse.setCycle_start(gameBookingCycle.getCycle_start());
        gameCycleResponse.setCycle_end(gameBookingCycle.getCycle_end());

        var totalSlots = gameSlotRepository.getTotalSlots(gameBookingCycle.getId());

        gameCycleResponse.setTotal_slots(totalSlots);

        return gameCycleResponse;
    }
}
