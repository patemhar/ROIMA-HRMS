package com.roima.hrms.Controller;

import com.roima.hrms.Service.Interfaces.NotificationService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final SecurityUtil securityUtil;

    private final NotificationService notificationService;

    @GetMapping("/subscribe")
    @PreAuthorize("hasAuthority('PER020')")
    public SseEmitter subscribe() {

        UUID userId = securityUtil.getCurrentUser().getId();

        return notificationService.addEmitter(userId);
    }

    @PatchMapping("/{notificationId}/read")
    public void markAsRead(
            @PathVariable UUID notificationId
    ) {
        notificationService.markAsRead(notificationId);
    }
}