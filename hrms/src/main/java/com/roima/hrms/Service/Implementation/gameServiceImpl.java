package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.*;
import com.roima.hrms.Core.Enums.BookingRequestStatus;
import com.roima.hrms.Dtos.game.*;
import com.roima.hrms.Mapper.GameMapper;
import com.roima.hrms.Repositories.*;
import com.roima.hrms.Service.Interfaces.gameService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class gameServiceImpl implements gameService {

    private final SlotBookingRequestRepository slotBookingRequestRepository;
    private final SlotParticipantRepository slotParticipantRepository;
    private final GameSlotRepository gameSlotRepository;
    private final UserCycleStatsRepository userCycleStatsRepository;
    private final GameBookingCycleRepository gameBookingCycleRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;
    private final GameMapper gameMapper;
    private final GameRepository gameRepository;

    @Override
    public GameSlotBookingRequestResponse makeRequest(GameSlotBookingRequestDto request) {

        if(slotParticipantRepository.existsActiveFutureBooking(request.getParticipants())) {
            throw new RuntimeException("One or more users already have an active booking request.");
        }

        var teamPriority = 0;

        var currentUser = securityUtil.getCurrentUser();
        var existingSlot = gameSlotRepository.findById(request.getSlotId()).orElseThrow(() -> new RuntimeException("No Slot Found"));

        var gameCycle = gameBookingCycleRepository.getCurrentCycle(existingSlot.getGame().getId());

        var slotBookingRequest = new SlotBookingRequest();
        slotBookingRequest.setSlot(existingSlot);
        slotBookingRequest.setUser(currentUser);
        slotBookingRequest.setRequestedAt(LocalDateTime.now());
        slotBookingRequest.setStatus(BookingRequestStatus.PENDING);
        slotBookingRequest.setPriorityScore(teamPriority);

        var savedSlotBookingRequest = slotBookingRequestRepository.save(slotBookingRequest);

        for(UUID participantId : request.getParticipants()) {

            var existingUser = userRepository.findById(participantId).orElseThrow(() -> new RuntimeException("No user found for " + participantId));

            var userStats = userCycleStatsRepository.getStatsByGameUserCycle(existingSlot.getGame().getId(), existingUser.getId(), gameCycle.get().getId());

            teamPriority = Math.max(teamPriority, userStats.getPlayCount());

            SlotParticipant slotParticipant = new SlotParticipant();
            slotParticipant.setBookingRequest(savedSlotBookingRequest);
            slotParticipant.setUser(existingUser);

            var savedSlotParticipant = slotParticipantRepository.save(slotParticipant);

            // memory
            existingUser.getMy_participation().add(savedSlotParticipant);
            savedSlotBookingRequest.getParticipants()
                    .add(savedSlotParticipant);
        }

        savedSlotBookingRequest.setPriorityScore(teamPriority);

        var savedSlotBookingRequest1 = slotBookingRequestRepository.save(savedSlotBookingRequest);

        //memory
        currentUser.getMy_booking_requests().add(savedSlotBookingRequest1);
        existingSlot.getBookingRequests().add(savedSlotBookingRequest1);

        processRequests(existingSlot);

        return gameMapper.toGameSlotBookingRequestResponse(savedSlotBookingRequest1);
    }

    @Override
    public List<GameResponseDto> getAllGames() {

        var games = gameRepository.findAll();

        return games.stream().map(gameMapper::toGameResponseDto).toList();
    }

    @Override
    public List<SlotResponseDto> getGameSlots(UUID gameId, LocalDate date) {

        var currentCycle = gameBookingCycleRepository.getCurrentCycle(gameId);

        var gameSlots = gameSlotRepository.findSlotByDate(gameId, currentCycle.get().getId(), date);

        return gameSlots.stream().map(gameMapper::toSlotResponse).toList();
    }

    @Override
    public GameCycleReponseDto getGameCycle(UUID gameId) {

        var currentCycle = gameBookingCycleRepository.getCurrentCycle(gameId).orElseThrow(() -> new RuntimeException("No Cycle Found"));

        return gameMapper.toGameCycleResponse(currentCycle);
    }

    @Override
    public GameResponseDto getGame(UUID gameId) {

        var existingGame = gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException("No game Found for" + gameId));

        return gameMapper.toGameResponseDto(existingGame);
    }

    @Override
    public GameResponseDto createGame(GameCreateRequestDto request) {

        var newGame = gameMapper.toEntity(request);

        var savedGame = gameRepository.save(newGame);

        return gameMapper.toGameResponseDto(savedGame);
    }

    @Override
    public Void updateGame(GameCreateRequestDto request, UUID gameId) {

        var existingGame = gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException("No game found"));

        var updatedGame = gameMapper.updateGame(existingGame, request);

        gameRepository.save(updatedGame);

        return null;
    }

    private void processRequests(GameSlot slot) {

        var game = slot.getGame();
        var currentCycle = gameBookingCycleRepository.getCurrentCycle(game.getId());

        var confirmedRequest = slotBookingRequestRepository.findConfirmed(slot.getId()).orElse(null);

        Pageable pageable = PageRequest.of(0, 1);

        var bestContender = slotBookingRequestRepository.getBestContender(slot.getId(), pageable).getFirst();

        if(bestContender == null) return;

        if (confirmedRequest == null) {
            bestContender.setStatus(BookingRequestStatus.CONFIRMED);
        } else {
            if(!confirmedRequest.getId().equals(bestContender.getId())) {
                confirmedRequest.setStatus(BookingRequestStatus.PENDING);

                // balance update in canceled slot
                var canceledSlotParticipants = slotParticipantRepository.findByRequestId(confirmedRequest.getId()).orElseThrow(() -> new RuntimeException("No participant found for slot"));

                for (var participant : canceledSlotParticipants) {

                    var userStat = userCycleStatsRepository.getStatsByGameUserCycle(game.getId(), participant.getUser().getId(), currentCycle.get().getId());

                    userStat.setPlayCount(userStat.getPlayCount() - 1);

                    userCycleStatsRepository.save(userStat);
                }

                // balance update in for new slot
                var newConfirmedSlotParticipants = slotParticipantRepository.findByRequestId(confirmedRequest.getId()).orElseThrow(() -> new RuntimeException("No participant found for slot"));

                for (var participant : newConfirmedSlotParticipants) {

                    var userStat = userCycleStatsRepository.getStatsByGameUserCycle(game.getId(), participant.getUser().getId(), currentCycle.get().getId());

                    userStat.setPlayCount(userStat.getPlayCount() + 1);

                    userCycleStatsRepository.save(userStat);
                }


                bestContender.setStatus(BookingRequestStatus.CONFIRMED);
            }
        }

    }
}
