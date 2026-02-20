package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Notification;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Core.Enums.EntityType;
import com.roima.hrms.Core.Enums.NotificationType;
import com.roima.hrms.Dtos.notificationResponseDto;
import com.roima.hrms.Mapper.NotificationMapper;
import com.roima.hrms.Repositories.NotificationRepository;
import com.roima.hrms.Service.Interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class notificationServiceImpl implements NotificationService {

    private final Map<UUID, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public void createNew(User recipient, User actor, NotificationType notificationType, String title, String message) {

        var newNotification = new Notification();

        newNotification.setRecipient(recipient);
        newNotification.setActor(actor);
        newNotification.setNotification_type(notificationType);
        newNotification.setTitle(title);
        newNotification.setMessage(message);

        var savedNotification = notificationRepository.save(newNotification);

        recipient.getMy_notifications().add(savedNotification);
        actor.getSent_notifications().add(savedNotification);

        var notificationResponse = notificationMapper.ToNotificationRespones(savedNotification);

        notifyUser(recipient.getId(), notificationResponse);
    }

    public SseEmitter addEmitter(UUID userId) {

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));

        return emitter;
    }

    @Override
    public void notifyUser(UUID userId, notificationResponseDto response) {

        SseEmitter emitter = emitters.get(userId);

        if(emitter == null) return;

        try {
            emitter.send(
                    SseEmitter.event()
                            .name("notification")
                            .data(response)
            );
        } catch (Exception e) {
            emitters.remove(userId);
        }
    }

    @Override
    public void markAsRead(UUID notificationId) {
        notificationRepository.markAsRead(notificationId);
    }
}

// -------------------------------------------------------------------------


//notificationService.notifyUser(
//        userId,
//    "Your booking for slot 5PM is confirmed"
//);
//
//
//notificationService.notifyUser(
//        removedUserId,
//    "You have been moved to On Hold due to higher priority request"
//);
//
//
//notificationService.notifyUser(
//        userId,
//    "Your travel expense has been approved"
//);
