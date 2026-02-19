package com.roima.hrms.Controller;

import com.roima.hrms.Service.Interfaces.NotificationService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;


@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final SecurityUtil securityUtil;

    private final NotificationService notificationService;

    @GetMapping("/subscribe")
    public SseEmitter subscribe() {

        UUID userId = securityUtil.getCurrentUser().getId();

        return notificationService.addEmitter(userId);
    }
}