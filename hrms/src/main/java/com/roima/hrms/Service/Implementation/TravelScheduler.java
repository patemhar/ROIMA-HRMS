package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Repositories.TravelRepository;
import com.roima.hrms.Service.Interfaces.TravelService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
@RequiredArgsConstructor
public class TravelScheduler {

    private final TravelService travelService;

    @Scheduled(fixedRate = 1000 * 60 * 60)
    public void updateTravelStatuses() {
        travelService.updateTravelStatuses();
    }
}
