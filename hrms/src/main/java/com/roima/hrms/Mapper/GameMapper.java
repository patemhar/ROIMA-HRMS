package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.Game;
import com.roima.hrms.Core.Entities.SlotBookingRequest;
import com.roima.hrms.Dtos.game.GameCreateRequestDto;
import com.roima.hrms.Dtos.game.GameResponseDto;
import com.roima.hrms.Dtos.game.GameSlotBookingRequestResponse;
import com.roima.hrms.Repositories.GameInterestRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import org.springframework.ui.ModelMap;

@Component
public class GameMapper {

    private ModelMapper modelMapper;
    private GameInterestRepository gameInterestRepository;

    public GameMapper(ModelMapper modelMapper, GameInterestRepository gameInterestRepository) {
        this.modelMapper = modelMapper;
        this.gameInterestRepository = gameInterestRepository;
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
}
