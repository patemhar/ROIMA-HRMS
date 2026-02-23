package com.roima.hrms.Dtos.job;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class JobSharingRecordResponseDto {
    private UUID id;
    private String sharedBy;
    private String jobTitle;
    private String email;
    private LocalDateTime createdAt;
}
