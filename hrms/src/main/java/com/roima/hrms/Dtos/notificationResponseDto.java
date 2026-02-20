package com.roima.hrms.Dtos;

import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Core.Enums.EntityType;
import com.roima.hrms.Core.Enums.NotificationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
public class notificationResponseDto {

    private UUID id;

    private String recipient;

    private String actor;

    private NotificationType type;

    private String title;

    private String message;

    private boolean read = false;

    private LocalDateTime created_at;
}
