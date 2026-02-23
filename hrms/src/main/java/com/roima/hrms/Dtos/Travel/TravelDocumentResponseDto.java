package com.roima.hrms.Dtos.Travel;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TravelDocumentResponseDto {
    private UUID id;
    private String docUrl;
    private String uploadedBy;
    private UUID travelId;
    private LocalDateTime createdAt;
}
