package com.roima.hrms.Dtos.Travel;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ExpenseDocumentResponseDto {
    private UUID id;
    private String docUrl;
    private String uploadedBy;
    private UUID expenseId;
    private LocalDateTime createdAt;
}
