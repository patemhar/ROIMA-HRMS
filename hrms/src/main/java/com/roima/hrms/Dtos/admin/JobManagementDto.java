package com.roima.hrms.dtos.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobManagementDto {
    private UUID id;
    private String title;
    private String description;
    private String employmentType;
    private String location;
    private String salaryRange;
    private LocalDate applicationDeadline;
    private String departmentName;
    private UUID departmentId;
    private String createdByName;
    private UUID createdById;
    private String defaultReviewerName;
    private UUID defaultReviewerId;
    private boolean isActive;
    private Integer referralCount;
    private Integer sharingCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

