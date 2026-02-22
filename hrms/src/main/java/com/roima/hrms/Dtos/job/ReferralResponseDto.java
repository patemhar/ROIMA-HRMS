package com.roima.hrms.Dtos.job;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ReferralResponseDto {
    private UUID id;
    private String referredBy;
    private String jobTitle;
    private String name;
    private String details;
    private String docUrl;
    private LocalDateTime createdAt;
}
