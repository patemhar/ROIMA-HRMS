package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.Notification;
import com.roima.hrms.Dtos.notificationResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationMapper {

    public notificationResponseDto ToNotificationRespones(Notification notification) {

        var notificationResponseDto = new notificationResponseDto();

        notificationResponseDto.setId(notification.getId());
        notificationResponseDto.setTitle(notification.getTitle());
        notificationResponseDto.setMessage(notification.getMessage());
        notificationResponseDto.setActor(notification.getActor().getId() + " - " + notification.getActor().getFirst_name() + " " + notification.getActor().getLast_name());
        notificationResponseDto.setRecipient(notification.getRecipient().getId() + " - " + notification.getRecipient().getFirst_name() + " " + notification.getRecipient().getLast_name());
        notificationResponseDto.setType(notification.getNotification_type());
        notificationResponseDto.setCreated_at(notification.getCreated_at());
        notificationResponseDto.setRead(notification.isRead());

        return notificationResponseDto;
    }

}
