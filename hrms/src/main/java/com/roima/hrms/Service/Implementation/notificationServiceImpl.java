package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Notification;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Core.Enums.EntityType;
import com.roima.hrms.Core.Enums.NotificationType;
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

    @Override
    public void createNew(User recipient, User actor, NotificationType type, EntityType entityType, String title, String message) {

        var newNotification = new Notification();

        newNotification.setRecipient(recipient);
        newNotification.setActor(actor);
        newNotification.setType(type);
        newNotification.setEntityType(entityType);
        newNotification.setTitle(title);
        newNotification.setMessage(message);

        var savedNotification = notificationRepository.save(newNotification);

        recipient.getMy_notifications().add(savedNotification);
        actor.getSent_notifications().add(savedNotification);
    }

    public SseEmitter addEmitter(UUID userId) {

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));

        return emitter;
    }

    public void notifyUser(UUID userId, String message) {

        SseEmitter emitter = emitters.get(userId);

        if(emitter == null) return;

        try {
            emitter.send(
                    SseEmitter.event()
                            .name("notification")
                            .data(message)
            );
        } catch (Exception e) {
            emitters.remove(userId);
        }
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


//
//Optional<GameBookingCycle> findTopByGameIdOrderByCycleStartDesc(UUID gameId);
//
//boolean existsByUserIdAndCycleId(UUID userId, UUID cycleId);


