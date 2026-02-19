package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Game;
import com.roima.hrms.Core.Entities.GameSlot;
import com.roima.hrms.Repositories.GameRepository;
import com.roima.hrms.Repositories.GameSlotRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RequiredArgsConstructor
@Component
public class ScheduledServices {

    private final GameRepository gameRepository;
    private final GameSlotRepository gameSlotRepository;


    @Transactional
    public void generateUpcomingSlots() {

        List<Game> games = gameRepository.findAll();

        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(5);

        for (Game game : games) {

            LocalTime start = game.getOperatingStartTime();
            LocalTime end = game.getOperatingEndTime();
            int duration = game.getSlotDurationMinutes();

            for (LocalDate date = today; !date.isAfter(endDate); date = date.plusDays(1)) {

                LocalTime current = start;

                while (current.plusMinutes(duration).isBefore(end) ||
                        current.plusMinutes(duration).equals(end)) {

                    LocalTime slotEnd = current.plusMinutes(duration);

//                    boolean exists =
//                            gameSlotRepository.existsByGameAndSlotDateAndStartTime(
//                                    game, date, current
//                            );

//                    if (!exists) {
                        GameSlot slot = new GameSlot();
                        slot.setGame(game);
                        slot.setSlotDate(date);
                        slot.setStartTime(current);
                        slot.setEndTime(slotEnd);
                        slot.setMaxPlayers(game.getMaxPlayers());

                        gameSlotRepository.save(slot);
//                    }

                    current = current.plusMinutes(duration);
                }
            }
        }
    }


}
