package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Profile;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Core.Enums.NotificationType;
import com.roima.hrms.Repositories.NotificationRepository;
import com.roima.hrms.Repositories.PostRepository;
import com.roima.hrms.Repositories.ProfileRepository;
import com.roima.hrms.Service.Interfaces.EmailService;
import com.roima.hrms.Service.Interfaces.NotificationService;
import com.roima.hrms.Service.Interfaces.PostService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BirthdayAnniversaryScheduler {

    private final ProfileRepository profileRepository;
    private final PostRepository postRepository;
    private final NotificationRepository notificationRepository;
    private final PostService postService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Scheduled(fixedRate = 1000 * 60 * 60 * 24)
    @Transactional
    public void generateCelebrationPosts() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();
        int month = today.getMonthValue();
        int day = today.getDayOfMonth();

        // Birthdays
        List<Profile> birthdays = profileRepository.findBirthdaysByMonthAndDay(month, day);
        for (Profile profile : birthdays) {
            User user = profile.getUser();
            String userName = user.getFirst_name() + " " + user.getLast_name();

            boolean postExists = postRepository.existsCelebrationPostToday("birthday", userName, startOfDay, endOfDay);
            if (!postExists) {
                String title = "Birthday Celebration";
                String content = "Today is " + userName + "'s birthday!";
                postService.createSystemPost(title, content, "birthday");
            }

            boolean notificationExists = notificationRepository.existsCelebrationNotificationToday(user.getId(), NotificationType.BIRTHDAY, startOfDay, endOfDay);
            if (!notificationExists) {
                String content = "Today is " + userName + "'s birthday!";
                notificationService.createNew(user, user, NotificationType.BIRTHDAY, "Happy Birthday!", content);
                emailService.sendSimpleMail(user.getEmail(), "Happy Birthday!", content);
            }
        }

        // Anniversaries
        List<Profile> anniversaries = profileRepository.findAnniversariesByMonthAndDay(month, day);
        for (Profile profile : anniversaries) {
            int years = Period.between(profile.getJoined_date(), today).getYears();
            if (years > 0) {
                User user = profile.getUser();
                String userName = user.getFirst_name() + " " + user.getLast_name();

                boolean postExists = postRepository.existsCelebrationPostToday("anniversary", userName, startOfDay, endOfDay);
                if (!postExists) {
                    String title = "Work Anniversary";
                    String content = userName + " completes " + years + " years at the organization.";
                    postService.createSystemPost(title, content, "anniversary");
                }

                boolean notificationExists = notificationRepository.existsCelebrationNotificationToday(user.getId(), NotificationType.WORK_ANNIVERSARY, startOfDay, endOfDay);
                if (!notificationExists) {
                    String content = userName + " completes " + years + " years at the organization.";
                    notificationService.createNew(user, user, NotificationType.WORK_ANNIVERSARY, "Work Anniversary!", content);
                    emailService.sendSimpleMail(user.getEmail(), "Work Anniversary!", content);
                }
            }
        }
    }
}
