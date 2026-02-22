package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Profile;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Core.Enums.NotificationType;
import com.roima.hrms.Repositories.ProfileRepository;
import com.roima.hrms.Service.Interfaces.EmailService;
import com.roima.hrms.Service.Interfaces.NotificationService;
import com.roima.hrms.Service.Interfaces.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BirthdayAnniversaryScheduler {

    private final ProfileRepository profileRepository;
    private final PostService postService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 0 * * ?") // Runs daily at midnight
    public void generateCelebrationPosts() {
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int day = today.getDayOfMonth();

        // Handle Birthdays
        List<Profile> birthdays = profileRepository.findBirthdaysByMonthAndDay(month, day);
        for (Profile profile : birthdays) {
            User user = profile.getUser();
            String title = "Birthday Celebration";
            String content = "Today is " + user.getFirst_name() + " " + user.getLast_name() + "'s birthday!";
            postService.createSystemPost(title, content, "birthday");

            // Create notification
            notificationService.createNew(user, user, NotificationType.BIRTHDAY, "Happy Birthday!", content);

            // Send email
            emailService.sendSimpleMail(user.getEmail(), "Happy Birthday!", content);
        }

        // Handle Work Anniversaries
        List<Profile> anniversaries = profileRepository.findAnniversariesByMonthAndDay(month, day);
        for (Profile profile : anniversaries) {
            int years = Period.between(profile.getJoined_date(), today).getYears();
            if (years > 0) {
                User user = profile.getUser();
                String title = "Work Anniversary";
                String content = user.getFirst_name() + " " + user.getLast_name() + " completes " + years + " years at the organization.";
                postService.createSystemPost(title, content, "anniversary");

                // Create notification
                notificationService.createNew(user, user, NotificationType.WORK_ANNIVERSARY, "Work Anniversary!", content);

                // Send email
                emailService.sendSimpleMail(user.getEmail(), "Work Anniversary!", content);
            }
        }
    }
}
