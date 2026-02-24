package com.roima.hrms.Service.Implementation;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JobScheduler {

    private final JobServiceImpl jobService;

    @Scheduled(cron = "0 0 0 * * *")
    public void markExpiredJobsAsInactive() {
        jobService.processJobsPassedDeadline();
    }

}
