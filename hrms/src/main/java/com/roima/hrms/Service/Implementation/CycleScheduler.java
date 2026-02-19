package com.roima.hrms.Service.Implementation;


import com.roima.hrms.Core.Entities.Game;
import com.roima.hrms.Core.Entities.GameBookingCycle;
import com.roima.hrms.Repositories.GameBookingCycleRepository;
import com.roima.hrms.Repositories.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CycleScheduler {

    private final GameRepository gameRepo;
    private final GameBookingCycleRepository cycleRepo;
    private final CycleService cycleService;

    @Scheduled(fixedRate = 1000 * 60 * 30) //
    public void createNextCycleIfRequired() {

        List<Game> games = gameRepo.findAll();

        for(Game game : games) {

            Optional<GameBookingCycle> currentCycle = cycleRepo.getCurrentCycle(game.getId());

            if(currentCycle.isEmpty()) {
                cycleService.createCycle(game);
                continue;
            }

            if(LocalDateTime.now().isAfter(currentCycle.get().getCycle_end())) {
                cycleService.createCycle(game);
            }
        }
    }
}

