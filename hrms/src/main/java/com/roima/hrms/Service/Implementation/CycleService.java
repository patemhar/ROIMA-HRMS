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
import java.util.Optional;
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

    public LocalDateTime getNextCycleStart() {
        LocalDateTime now = LocalDateTime.now();
        LocalTime time = now.toLocalTime();
        int min = time.getMinute();
        int nextMin = ((min / 30) + 1) * 30;
        if (nextMin >= 60) {
            nextMin -= 60;
            time = time.plusHours(1);
        }
        time = time.withMinute(nextMin).withSecond(0).withNano(0);
        LocalDateTime nextRounded = LocalDateTime.of(now.toLocalDate(), time);
        return nextRounded.minusMinutes(30);
    }

    @Transactional
    public void createCycle(Game game) {

        Integer interestedUsers = interestRepo.countInterestedUsers(game.getId());

        if (interestedUsers == 0) return;

        int slotCapacity = game.getMaxPlayers();
        int slotsRequired = (int) Math.ceil((double) interestedUsers / slotCapacity);

        LocalDateTime startFrom = getNextCycleStart();

        GameBookingCycle cycle = new GameBookingCycle();
        cycle.setGame(game);
        cycle.setCycle_start(startFrom);

        cycleRepo.save(cycle);

        LocalDateTime cycleEnd = createSlotsForCycle(game, cycle, slotsRequired, startFrom);
        cycle.setCycle_end(cycleEnd);

        cycleRepo.save(cycle);

        initializeUserStats(game.getId(), cycle);
    }


    private LocalDateTime createSlotsForCycle(Game game, GameBookingCycle cycle, int slotsRequired, LocalDateTime startFrom) {

        LocalTime operatingStart = game.getOperatingStartTime();
        LocalTime operatingEnd = game.getOperatingEndTime();
        int duration = game.getSlotDurationMinutes();

        LocalDate currentDate = startFrom.toLocalDate();
        LocalTime currentTime = startFrom.toLocalTime();

        if (currentTime.isBefore(operatingStart)) {
            currentTime = operatingStart;
        } else if (currentTime.isAfter(operatingEnd.minusMinutes(duration))) {
            currentDate = currentDate.plusDays(1);
            currentTime = operatingStart;
        }

        // buffer
        currentTime = currentTime.plusMinutes(30);

        List<GameSlot> slots = new ArrayList<>();
        LocalDateTime lastEnd = null;
        int created = 0;

        while (created < slotsRequired) {

            LocalTime slotStart = currentTime;
            LocalTime slotEnd = slotStart.plusMinutes(duration);

            if (slotEnd.isAfter(operatingEnd)) {
                // Move to next day
                currentDate = currentDate.plusDays(1);
                currentTime = operatingStart;
                continue;
            }

            if(!game.getActiveOnWeekends()) {
                var day = currentDate.getDayOfWeek();
                if(day.name().equals("SATURDAY") || day.name().equals("SUNDAY")) {
                    currentDate = currentDate.plusDays(1);
                    currentTime = operatingStart;
                    continue;
                }
            }

            GameSlot slot = new GameSlot();
            slot.setGame(game);
            slot.setSlotDate(currentDate);
            slot.setStartTime(slotStart);
            slot.setEndTime(slotEnd);
            slot.setGameCycle(cycle);

            slots.add(slot);
            lastEnd = LocalDateTime.of(currentDate, slotEnd);
            currentTime = slotEnd;
            created++;
        }

        slotRepo.saveAll(slots);
        return lastEnd;
    }

    private void initializeUserStats(UUID gameId, GameBookingCycle cycle) {

        List<User> users = interestRepo.getInterestedUsers(gameId);

        List<UserCycleStats> stats = new ArrayList<>();

        var existingGame = gameRepo.findById(gameId).orElseThrow(() -> new RuntimeException("No game found for inserting user stats."));

        for (var user : users) {

            if (statsRepo.existsByUserIdAndGameCycleId(user.getId(), cycle.getId()))
                continue;

            UserCycleStats s = new UserCycleStats();
            s.setUser(user);
            s.setGame(existingGame);
            s.setGameCycle(cycle);
            s.setPlayCount(0);

            stats.add(s);
        }

        statsRepo.saveAll(stats);
    }
}
