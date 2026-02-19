package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.*;
import com.roima.hrms.Repositories.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CycleService {

    private final GameRepository gameRepo;
    private final GameInterestRepository interestRepo;
    private final GameBookingCycleRepository cycleRepo;
    private final GameSlotRepository slotRepo;
    private final UserCycleStatsRepository statsRepo;
    private final UserRepository userRepository;

    @Transactional
    public void createCycle(Game game) {

        Integer interestedUsers = interestRepo.countInterestedUsers(game.getId());

        if (interestedUsers == 0) return;

        int slotCapacity = game.getMaxPlayers();
        int slotsRequired = (int) Math.ceil((double) interestedUsers / slotCapacity);

        int slotDuration = game.getSlotDurationMinutes();

        int cycleDurationMinutes = slotsRequired * slotDuration;

        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusMinutes(cycleDurationMinutes);

        GameBookingCycle cycle = new GameBookingCycle();
        cycle.setGame(game);
        cycle.setCycle_start(start);
        cycle.setCycle_end(end);

        cycleRepo.save(cycle);

        createSlotsForCycle(game, cycle, slotsRequired);
        initializeUserStats(game.getId(), cycle);
    }


    private void createSlotsForCycle(Game game, GameBookingCycle cycle, int slotsRequired) {

        LocalTime operatingStart = game.getOperatingStartTime();

        int duration = game.getSlotDurationMinutes();

        LocalDate date = LocalDate.now();

        List<GameSlot> slots = new ArrayList<>();

        for (int i = 0; i < slotsRequired; i++) {

            LocalTime startTime = operatingStart.plusMinutes(i * duration);

            GameSlot slot = new GameSlot();
            slot.setGame(game);
            slot.setSlotDate(date);
            slot.setStartTime(startTime);
            slot.setEndTime(startTime.plusMinutes(duration));
            slot.setGame_cycle(cycle);
            slot.setMaxPlayers(game.getMaxPlayers());

            slots.add(slot);
        }

        slotRepo.saveAll(slots);
    }

    private void initializeUserStats(UUID gameId, GameBookingCycle cycle) {

        List<User> users = interestRepo.getInterestedUsers(gameId);

        List<UserCycleStats> stats = new ArrayList<>();

        for (var user : users) {

            if (statsRepo.existsByUserIdAndGameCycleId(user.getId(), cycle.getId()))
                continue;

            UserCycleStats s = new UserCycleStats();
            s.setUser(user);
            s.setGameCycle(cycle);
            s.setPlayCount(0);

            stats.add(s);
        }

        statsRepo.saveAll(stats);
    }
}