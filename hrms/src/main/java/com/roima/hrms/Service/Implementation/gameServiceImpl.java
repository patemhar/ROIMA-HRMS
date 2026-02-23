package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.*;
import com.roima.hrms.Core.Enums.BookingRequestStatus;
import com.roima.hrms.Core.Enums.NotificationType;
import com.roima.hrms.Dtos.game.*;
import com.roima.hrms.Mapper.GameMapper;
import com.roima.hrms.Repositories.*;
import com.roima.hrms.Service.Interfaces.EmailService;
import com.roima.hrms.Service.Interfaces.NotificationService;
import com.roima.hrms.Service.Interfaces.gameService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Override
    public GameSlotBookingRequestResponse makeRequest(GameSlotBookingRequestDto request) {

        for (UUID participant : request.getParticipants()) {
            if(slotParticipantRepository.existsActiveFutureBooking(participant)) {
                throw new RuntimeException("One or more users already have an active booking request.");
            }
        }

        var teamPriority = 0;

        var currentUser = securityUtil.getCurrentUser();
        var existingSlot = gameSlotRepository.findById(request.getSlotId()).orElseThrow(() -> new RuntimeException("No Slot Found"));

        LocalDateTime slotStart = LocalDateTime.of(existingSlot.getSlotDate(), existingSlot.getStartTime());
        if (slotStart.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book a slot that has already started.");
        }

        var gameCycle = gameBookingCycleRepository.getCurrentCycle(existingSlot.getGame().getId());

        if (!gameCycle.isPresent()) {
            throw new RuntimeException("No current cycle for the game");
        }

        List<String> usersWithoutStats = new ArrayList<>();
        for(UUID participantId : request.getParticipants()) {
            var existingUser = userRepository.findById(participantId).orElseThrow(() -> new RuntimeException("No user found for " + participantId));
            var userStats = userCycleStatsRepository.getStatsByGameUserCycle(existingUser.getId(), gameCycle.get().getId(), existingSlot.getGame().getId());
            if (userStats == null) {
                usersWithoutStats.add(existingUser.getFirst_name() + " " + existingUser.getLast_name());
            }
        }
        if (!usersWithoutStats.isEmpty()) {
            throw new RuntimeException("The following users can participate from the next cycle: " + String.join(", ", usersWithoutStats));
        }

        var slotBookingRequest = new SlotBookingRequest();
        slotBookingRequest.setSlot(existingSlot);
        slotBookingRequest.setUser(currentUser);
        slotBookingRequest.setRequestedAt(LocalDateTime.now());
        slotBookingRequest.setStatus(BookingRequestStatus.PENDING);
        slotBookingRequest.setPriorityScore(teamPriority);

        var savedSlotBookingRequest = slotBookingRequestRepository.save(slotBookingRequest);

        for(UUID participantId : request.getParticipants()) {

            var existingUser = userRepository.findById(participantId).orElseThrow(() -> new RuntimeException("No user found for " + participantId));

            var userStats = userCycleStatsRepository.getStatsByGameUserCycle(existingUser.getId(), gameCycle.get().getId(), existingSlot.getGame().getId());

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
        existingSlot.getBookingRequests().add(savedSlotBookingRequest1);

        processRequests(existingSlot);

        var game = existingSlot.getGame();
        String title = "Game Slot Booking Requested";
        String message = "Your booking request for " + game.getName() + " on " + existingSlot.getSlotDate() +
            " at " + existingSlot.getStartTime() + " has been submitted successfully.";

        for(UUID participantId : request.getParticipants()) {
            var participant = userRepository.findById(participantId).orElse(null);
            if (participant != null) {
                notificationService.createNew(participant, currentUser, NotificationType.SYSTEM, title, message);
                emailService.sendSimpleMail(participant.getEmail(), title, message);
            }
        }

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
    public Optional<GameCycleReponseDto> getGameCycle(UUID gameId) {

        var currentCycle = gameBookingCycleRepository.getCurrentCycle(gameId);

        if (currentCycle.isPresent()) {
            return Optional.of(gameMapper.toGameCycleResponse(currentCycle.get()));
        } else {
            return Optional.empty();
        }
    }

    @Override
    public UserActiveBookingDto getUserActiveBooking(UUID gameId) {
        User currentUser = securityUtil.getCurrentUser();

        Optional<SlotBookingRequest> existingBooking = slotBookingRequestRepository.findActiveBookingForUserAndGame(currentUser.getId(), gameId);

        if (existingBooking.isEmpty()) {
            return null;
        }

        SlotBookingRequest booking = existingBooking.get();

        UserActiveBookingDto dto = new UserActiveBookingDto();

        dto.setBookingId(booking.getId());
        dto.setSlotId(booking.getSlot().getId());
        dto.setSlotDate(booking.getSlot().getSlotDate());
        dto.setStartTime(booking.getSlot().getStartTime());
        dto.setEndTime(booking.getSlot().getEndTime());
        dto.setStatus(booking.getStatus());
        dto.setRequestedAt(booking.getRequestedAt());
        dto.setRequestedBy(booking.getUser().getId().toString() + " - " + booking.getUser().getFirst_name() + " " + booking.getUser().getLast_name());

        // participants
        List<SlotParticipant> participants = slotParticipantRepository.findByRequestId(booking.getId()).orElse(List.of());
        dto.setParticipants(participants.stream().map(sp -> sp.getUser().getFirst_name() + " " + sp.getUser().getLast_name()).toList());
        return dto;
    }

    @Override
    public void cancelBooking(UUID bookingId) {
        SlotBookingRequest booking = slotBookingRequestRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User currentUser = securityUtil.getCurrentUser();
        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingRequestStatus.CANCELLED) {
            throw new RuntimeException("Booking already cancelled");
        }

        boolean wasConfirmed = booking.getStatus() == BookingRequestStatus.CONFIRMED;
        booking.setStatus(BookingRequestStatus.CANCELLED);
        slotBookingRequestRepository.save(booking);

        if (wasConfirmed) {
            var game = booking.getSlot().getGame();
            var currentCycle = gameBookingCycleRepository.getCurrentCycle(game.getId());

            LocalDateTime slotStartTime = LocalDateTime.of(booking.getSlot().getSlotDate(), booking.getSlot().getStartTime());
            LocalDateTime now = LocalDateTime.now();
            long minutesUntilStart = java.time.Duration.between(now, slotStartTime).toMinutes();

            boolean isPenalty = minutesUntilStart <= 30 && minutesUntilStart >= 0;

            if (currentCycle.isPresent()) {
                List<SlotParticipant> participants = slotParticipantRepository.findByRequestId(bookingId).orElse(List.of());
                for (SlotParticipant sp : participants) {
                    var stats = userCycleStatsRepository.getStatsByGameUserCycle(sp.getUser().getId(), currentCycle.get().getId(), game.getId());
                    if (stats != null && !isPenalty) {
                        stats.setPlayCount(stats.getPlayCount() - 1);
                        userCycleStatsRepository.save(stats);
                    }

                    // Notify user about penalty if applicable
                    if (isPenalty) {
                        String title = "Late Cancellation Penalty";
                        String message = "You cancelled your booking for " + game.getName() + " within 30 minutes of start time. Your play count will not be refunded as a penalty.";
                        notificationService.createNew(sp.getUser(), sp.getUser(), NotificationType.SYSTEM, title, message);
                        emailService.sendSimpleMail(sp.getUser().getEmail(), title, message);
                    }
                }
            }

            processRequests(booking.getSlot());
        }
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

        if (!currentCycle.isPresent()) return;

        var confirmedRequest = slotBookingRequestRepository.findConfirmed(slot.getId()).orElse(null);

        Pageable pageable = PageRequest.of(0, 1);

        var bestContender = slotBookingRequestRepository.getBestContender(slot.getId(), pageable).getFirst();

        if(bestContender == null) return;

        if (confirmedRequest == null) {
            int updated = slotBookingRequestRepository.confirmIfNotExists(bestContender.getId());
            if (updated == 0) {
                return;
            }
            // Update stats for the newly confirmed
            var newConfirmedSlotParticipants = slotParticipantRepository.findByRequestId(bestContender.getId()).orElseThrow(() -> new RuntimeException("No participant found for slot"));
            for (var participant : newConfirmedSlotParticipants) {
                var userStat = userCycleStatsRepository.getStatsByGameUserCycle(participant.getUser().getId(), currentCycle.get().getId(), game.getId());
                if (userStat != null) {
                    userStat.setPlayCount(userStat.getPlayCount() + 1);
                    userCycleStatsRepository.save(userStat);
                }

                String title = "Game Slot Confirmed!";
                String message = "Your booking for " + game.getName() + " on " + slot.getSlotDate() + " has been confirmed!";
                notificationService.createNew(participant.getUser(), participant.getUser(), NotificationType.SYSTEM, title, message);
                emailService.sendSimpleMail(participant.getUser().getEmail(), title, message);
            }
        } else {
            if(!confirmedRequest.getId().equals(bestContender.getId())) {
                confirmedRequest.setStatus(BookingRequestStatus.PENDING);

                // balance update in canceled slot
                var canceledSlotParticipants = slotParticipantRepository.findByRequestId(confirmedRequest.getId()).orElseThrow(() -> new RuntimeException("No participant found for slot"));

                for (var participant : canceledSlotParticipants) {

                    var userStat = userCycleStatsRepository.getStatsByGameUserCycle(participant.getUser().getId(), currentCycle.get().getId(), game.getId());

                    if (userStat != null) {
                        userStat.setPlayCount(userStat.getPlayCount() - 1);
                        userCycleStatsRepository.save(userStat);
                    }

                    String title = "Game Slot Booking Changed";
                    String message = "Your confirmed booking for " + game.getName() + " on " + slot.getSlotDate() +
                        " has been moved to pending due to a higher priority request.";
                    notificationService.createNew(participant.getUser(), participant.getUser(), NotificationType.SYSTEM, title, message);
                    emailService.sendSimpleMail(participant.getUser().getEmail(), title, message);
                }

                int updated = slotBookingRequestRepository.confirmIfNotExists(bestContender.getId());
                if (updated == 0) {
                    return;
                }

                // balance update in for new slot
                var newConfirmedSlotParticipants = slotParticipantRepository.findByRequestId(bestContender.getId()).orElseThrow(() -> new RuntimeException("No participant found for slot"));

                for (var participant : newConfirmedSlotParticipants) {

                    var userStat = userCycleStatsRepository.getStatsByGameUserCycle(participant.getUser().getId(), currentCycle.get().getId(), game.getId());

                    if (userStat != null) {
                        userStat.setPlayCount(userStat.getPlayCount() + 1);
                        userCycleStatsRepository.save(userStat);
                    }

                    // Notify participant about newly confirmed booking
                    String title = "Game Slot Confirmed!";
                    String message = "Your booking for " + game.getName() + " on " + slot.getSlotDate() + " has been confirmed!";
                    notificationService.createNew(participant.getUser(), participant.getUser(), NotificationType.SYSTEM, title, message);
                    emailService.sendSimpleMail(participant.getUser().getEmail(), title, message);
                }
            }
        }

    }
}
