package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Core.Entities.Notification;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Core.Enums.EntityType;
import com.roima.hrms.Core.Enums.NotificationType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

public interface NotificationService {

    void createNew(User recipient, User actor, NotificationType type, EntityType entityType, String title, String message);

    SseEmitter addEmitter(UUID userId);

    void notifyUser(UUID userId, String message);
}
