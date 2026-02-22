package com.roima.hrms.Controller;

import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.notificationResponseDto;
import com.roima.hrms.Service.Interfaces.NotificationService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

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

    @GetMapping("/unread")
    @PreAuthorize("hasAuthority('PER020')")
    public ApiResponse<List<notificationResponseDto>> getUnreadNotifications() {
        UUID userId = securityUtil.getCurrentUser().getId();
        List<notificationResponseDto> unreadNotifications = notificationService.getUnreadNotifications(userId);
        return ApiResponse.success(unreadNotifications, "Unread notifications fetched successfully");
    }

    @PutMapping("/{notificationId}/read")
    @PreAuthorize("hasAuthority('PER020')")
    public ApiResponse<Void> markAsRead(@PathVariable UUID notificationId) {
        notificationService.markAsRead(notificationId);
        return ApiResponse.success(null, "Notification marked as read");
    }
}